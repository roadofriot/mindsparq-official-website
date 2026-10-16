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

export interface MediaUsageLocation {
  type: 'blog_post' | 'course' | 'lesson' | 'carousel_item' | 'site_section';
  id: string;
  title: string;
  field: string;
}

export interface MediaUsageReport {
  inUse: boolean;
  locations: MediaUsageLocation[];
}

/**
 * Checks all content models (blogs, courses, syllabus lessons, hero slides, sections)
 * for active references before an asset is deleted to prevent dead links.
 */
export async function checkMediaUsage(asset: MediaAsset): Promise<MediaUsageReport> {
  const locations: MediaUsageLocation[] = [];
  if (!isSupabaseConfigured) {
    return { inUse: false, locations: [] };
  }

  const path = asset.storage_path;
  const filename = asset.original_filename;

  try {
    // 1. Check blog_posts (cover_image_url or content)
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('id, title, cover_image_url, content');

    if (blogPosts) {
      for (const bp of blogPosts) {
        if (bp.cover_image_url && (bp.cover_image_url === path || bp.cover_image_url.includes(filename))) {
          locations.push({ type: 'blog_post', id: bp.id, title: bp.title, field: 'Cover Image' });
        } else if (bp.content && (bp.content.includes(path) || bp.content.includes(filename))) {
          locations.push({ type: 'blog_post', id: bp.id, title: bp.title, field: 'Article Content Body' });
        }
      }
    }

    // 2. Check courses (thumbnail_url)
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, thumbnail_url');

    if (courses) {
      for (const c of courses) {
        if (c.thumbnail_url && (c.thumbnail_url === path || c.thumbnail_url.includes(filename))) {
          locations.push({ type: 'course', id: c.id, title: c.title, field: 'Course Card Thumbnail' });
        }
      }
    }

    // 3. Check lessons (resource_url)
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, resource_url');

    if (lessons) {
      for (const l of lessons) {
        if (l.resource_url && (l.resource_url === path || l.resource_url.includes(filename))) {
          locations.push({ type: 'lesson', id: l.id, title: l.title, field: 'Lesson Attachment Resource' });
        }
      }
    }

    // 4. Check carousel_items (image_url)
    const { data: carouselItems } = await supabase
      .from('carousel_items')
      .select('id, title, image_url');

    if (carouselItems) {
      for (const ci of carouselItems) {
        if (ci.image_url && (ci.image_url === path || ci.image_url.includes(filename))) {
          locations.push({ type: 'carousel_item', id: ci.id, title: ci.title || 'Hero Banner', field: 'Banner Slide Image' });
        }
      }
    }

    // 5. Check site_sections
    const { data: sections } = await supabase
      .from('site_sections')
      .select('id, section_key, title, content');

    if (sections) {
      for (const s of sections) {
        const contentStr = typeof s.content === 'string' ? s.content : JSON.stringify(s.content || {});
        if (contentStr.includes(path) || contentStr.includes(filename)) {
          locations.push({ type: 'site_section', id: s.id, title: s.title || s.section_key, field: 'Landing Section Content' });
        }
      }
    }
  } catch (err) {
    console.warn('[MindSparQ Media] Usage check warning:', err);
  }

  return {
    inUse: locations.length > 0,
    locations
  };
}

/**
 * Deduplication check: detects if an asset with matching original filename and size already exists.
 */
export async function findDuplicateAsset(filename: string, sizeBytes: number): Promise<MediaAsset | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data } = await supabase
      .from('media_assets')
      .select('*')
      .eq('original_filename', filename)
      .eq('size_bytes', sizeBytes)
      .limit(1);

    return (data && data.length > 0) ? (data[0] as MediaAsset) : null;
  } catch {
    return null;
  }
}

export interface BatchUploadResult {
  successful: MediaAsset[];
  duplicates: { file: File; existingAsset: MediaAsset }[];
  errors: { file: File; error: string }[];
}

/**
 * Batch multi-file upload with progress callback and automatic deduplication detection.
 */
export async function uploadMediaBatch(
  files: File[],
  visibility: 'public' | 'private' = 'public',
  onProgress?: (completed: number, total: number) => void
): Promise<BatchUploadResult> {
  const result: BatchUploadResult = {
    successful: [],
    duplicates: [],
    errors: []
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Deduplication check
    const dup = await findDuplicateAsset(file.name, file.size);
    if (dup) {
      result.duplicates.push({ file, existingAsset: dup });
      onProgress?.(i + 1, files.length);
      continue;
    }

    const cleanAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const { data, error } = await uploadMedia(file, cleanAlt, undefined, visibility);

    if (error) {
      result.errors.push({ file, error: error.message });
    } else if (data) {
      result.successful.push(data);
    }

    onProgress?.(i + 1, files.length);
  }

  return result;
}
