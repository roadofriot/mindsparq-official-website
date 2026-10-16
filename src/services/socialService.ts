import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SocialLink } from '../types/database';
import { recordAuditLog } from './auditService';

export async function getSocialLinks(): Promise<SocialLink[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('is_enabled', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.warn('[MindSparQ Social] Error fetching social links:', error.message);
    return [];
  }

  return (data as SocialLink[]) || [];
}

export async function getAllSocialLinks(): Promise<SocialLink[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[MindSparQ Social] Error fetching all social links:', error);
    return [];
  }

  return (data as SocialLink[]) || [];
}

export async function saveSocialLink(
  link: Partial<SocialLink>
): Promise<{ data: SocialLink | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  if (!link.profile_url || !/^https?:\/\//i.test(link.profile_url)) {
    return { data: null, error: new Error('Profile URL must start with http:// or https://') };
  }

  const isNew = !link.id;
  const payload = {
    platform: link.platform || 'facebook',
    profile_url: link.profile_url,
    display_label: link.display_label || 'Official Profile',
    is_enabled: link.is_enabled ?? true,
    sort_order: link.sort_order ?? 0,
    updated_at: new Date().toISOString()
  };

  if (isNew) {
    const { data, error } = await supabase
      .from('social_links')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('social.create', 'social_links', data.id, { platform: data.platform });
    }
    return { data: data as SocialLink, error };
  } else {
    const { data, error } = await supabase
      .from('social_links')
      .update(payload)
      .eq('id', link.id)
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('social.update', 'social_links', data.id, { platform: data.platform });
    }
    return { data: data as SocialLink, error };
  }
}

/**
 * Generate standard web share URLs for public posts and events
 */
export function getSocialShareUrls(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=Read%20this%20article%20on%20MindSparQ:%20${encodedUrl}`
  };
}

/**
 * Native Web Share trigger with clipboard copy fallback
 */
export async function sharePublicContent(
  title: string,
  text: string,
  url: string
): Promise<{ method: 'native' | 'clipboard'; success: boolean }> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { method: 'native', success: true };
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return { method: 'native', success: false };
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return { method: 'clipboard', success: true };
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return { method: 'clipboard', success: false };
  }
}
