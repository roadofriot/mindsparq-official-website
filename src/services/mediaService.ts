import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MediaAsset } from '../types/database';
import { recordAuditLog } from './auditService';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf'
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function getMediaAssets(): Promise<MediaAsset[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[MindSparQ Media] Error fetching media assets:', error);
    return [];
  }

  return (data as MediaAsset[]) || [];
}

export async function uploadMedia(
  file: File,
  altText: string,
  caption?: string,
  visibility: 'public' | 'private' = 'public'
): Promise<{ data: MediaAsset | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  // 1. Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      data: null,
      error: new Error(`Unsupported file type (${file.type}). Allowed types: JPG, PNG, WebP, GIF, PDF.`)
    };
  }

  // 2. Validate Size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      data: null,
      error: new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 10MB.`)
    };
  }

  // 3. Alt text required
  if (!altText || altText.trim().length === 0) {
    return {
      data: null,
      error: new Error('Meaningful alt text is required for accessibility.')
    };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: new Error('Authentication required to upload media.') };
  }

  // 4. Generate unique safe storage path
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const cleanBaseName = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const uniqueId = crypto.randomUUID();
  const bucketName = visibility === 'public' ? 'public-media' : 'private-resources';
  const storagePath = `${visibility}/${new Date().getFullYear()}/${uniqueId}_${cleanBaseName}.${ext}`;

  // 5. Upload to Supabase Storage
  const { error: uploadErr } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadErr) {
    return { data: null, error: uploadErr };
  }

  // 6. Get Public URL if public
  let publicUrl = storagePath;
  if (visibility === 'public') {
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
    publicUrl = urlData.publicUrl;
  }

  // 7. Insert row in media_assets table
  const mediaType: 'image' | 'document' | 'audio' = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('audio/')
    ? 'audio'
    : 'document';

  const { data: assetData, error: dbErr } = await supabase
    .from('media_assets')
    .insert([
      {
        storage_path: publicUrl,
        original_filename: file.name,
        alt_text: altText.trim(),
        caption: caption?.trim() || null,
        media_type: mediaType,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: user.id,
        visibility
      }
    ])
    .select()
    .single();

  if (dbErr) {
    // Attempt storage cleanup if db insert fails
    await supabase.storage.from(bucketName).remove([storagePath]);
    return { data: null, error: dbErr };
  }

  await recordAuditLog('media.upload', 'media_assets', assetData.id, {
    filename: file.name,
    size_bytes: file.size,
    mime_type: file.type
  });

  return { data: assetData as MediaAsset, error: null };
}

export async function deleteMediaAsset(asset: MediaAsset): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  // 1. Delete from database
  const { error: dbErr } = await supabase.from('media_assets').delete().eq('id', asset.id);
  if (dbErr) return { error: dbErr };

  // 2. Delete from storage if path matches
  try {
    const bucketName = asset.visibility === 'public' ? 'public-media' : 'private-resources';
    // If storage_path is a full URL, extract relative path
    const pathParts = asset.storage_path.split(`${bucketName}/`);
    const objectPath = pathParts.length > 1 ? pathParts[1] : asset.storage_path;
    await supabase.storage.from(bucketName).remove([objectPath]);
  } catch (err) {
    console.warn('[MindSparQ Media] Notice: Storage object removal completed with note:', err);
  }

  await recordAuditLog('media.delete', 'media_assets', asset.id, {
    filename: asset.original_filename
  });

  return { error: null };
}
