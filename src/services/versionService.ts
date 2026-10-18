import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ContentVersion } from '../types/database';
import { recordAuditLog } from './auditService';

const LOCAL_STORAGE_VERSIONS_KEY = 'mindsparq_content_versions';

function getLocalVersions(): ContentVersion[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VERSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[MindSparQ Versions] Could not read local versions:', err);
    return [];
  }
}

function saveLocalVersions(versions: ContentVersion[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_VERSIONS_KEY, JSON.stringify(versions));
  } catch (err) {
    console.warn('[MindSparQ Versions] Could not save local versions:', err);
  }
}
export type SupportedContentType =
  | 'blog_post'
  | 'course'
  | 'program'
  | 'site_section'
  | 'section'
  | 'page'
  | 'header'
  | 'footer'
  | 'theme';

/**
 * Creates an immutable snapshot version of a content entity (Blog Post, Course, Program, Page, Header, etc.)
 */
export async function createContentVersion(
  contentType: SupportedContentType,
  contentId: string,
  title: string,
  snapshot: Record<string, unknown>,
  changeSummary?: string,
  createdByName?: string
): Promise<{ data: ContentVersion | null; error: Error | null }> {
  const now = new Date().toISOString();

  // Try Supabase first
  if (isSupabaseConfigured) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Find highest existing version
      const { data: existingVersions, error: fetchErr } = await supabase
        .from('content_versions')
        .select('version_number')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = (!fetchErr && existingVersions && existingVersions.length > 0)
        ? (existingVersions[0].version_number + 1)
        : 1;

      const payload = {
        content_type: contentType,
        content_id: contentId,
        version_number: nextVersion,
        title,
        snapshot,
        change_summary: changeSummary || `Revision v${nextVersion}`,
        created_by: user?.id || null,
        created_by_name: createdByName || user?.user_metadata?.display_name || user?.email || 'Staff Editor',
        created_at: now
      };

      const { data, error } = await supabase
        .from('content_versions')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        await recordAuditLog('version.create', contentType, contentId, {
          version_number: data.version_number,
          summary: data.change_summary
        });
        return { data: data as ContentVersion, error: null };
      }
    } catch (err) {
      console.warn('[MindSparQ Versions] Supabase version insert error, falling back to local storage:', err);
    }
  }

  // Resilient Local Storage fallback
  const localList = getLocalVersions();
  const existingForContent = localList.filter(
    (v) => v.content_type === contentType && v.content_id === contentId
  );
  const nextVersionNumber = existingForContent.length > 0
    ? Math.max(...existingForContent.map((v) => v.version_number)) + 1
    : 1;

  const newVersion: ContentVersion = {
    id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    content_type: contentType,
    content_id: contentId,
    version_number: nextVersionNumber,
    title,
    snapshot,
    change_summary: changeSummary || `Revision v${nextVersionNumber}`,
    created_by: null,
    created_by_name: createdByName || 'Staff Editor',
    created_at: now
  };

  localList.unshift(newVersion);
  saveLocalVersions(localList);
  return { data: newVersion, error: null };
}

/**
 * Retrieves all chronological snapshots for a specific content item
 */
export async function getContentVersions(
  contentType: SupportedContentType,
  contentId: string
): Promise<ContentVersion[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('version_number', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ContentVersion[];
      }
    } catch (err) {
      console.warn('[MindSparQ Versions] Failed to fetch remote versions, using local store:', err);
    }
  }

  // Fallback to local storage
  const localList = getLocalVersions();
  return localList
    .filter((v) => v.content_type === contentType && v.content_id === contentId)
    .sort((a, b) => b.version_number - a.version_number);
}

/**
 * Retrieves all recent versions across all or filtered content types
 */
export async function getAllRecentVersions(
  filterType?: SupportedContentType
): Promise<ContentVersion[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('content_versions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterType) {
        query = query.eq('content_type', filterType);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as ContentVersion[];
      }
    } catch (err) {
      console.warn('[MindSparQ Versions] Failed to fetch all remote versions, using local store:', err);
    }
  }

  const localList = getLocalVersions();
  return localList
    .filter((v) => (filterType ? v.content_type === filterType : true))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Restores a historic snapshot into the active content table
 */
export async function restoreContentVersion(
  version: ContentVersion
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { content_type, content_id, snapshot } = version;

    if (content_type === 'page') {
      const { restorePageVersion } = await import('./pageService');
      const res = await restorePageVersion(content_id, snapshot, 'Staff Editor');
      if (!res.success) throw res.error || new Error('Page restoration failed.');
    } else if (content_type === 'header' || content_type === 'footer') {
      const { saveSiteThemeSettings, getSiteThemeSettings } = await import('./siteThemeService');
      const currentTheme = getSiteThemeSettings();
      const updatedTheme = {
        ...currentTheme,
        [content_type]: snapshot
      };
      saveSiteThemeSettings(updatedTheme);
    } else if (content_type === 'site_section') {
      const { saveSiteSection } = await import('./siteCustomizerService');
      const res = await saveSiteSection(snapshot as any);
      if (!res.success) throw res.error || new Error('Section restoration failed.');
    } else if (content_type === 'blog_post') {
      const { savePost } = await import('./blogService');
      const payload = {
        ...snapshot,
        id: content_id
      };
      const res = await savePost(payload);
      if (res.error) {
        console.warn('[MindSparQ Versions] Remote restore sync warning:', res.error.message);
      }
    } else if (content_type === 'course') {
      const { saveCourse } = await import('./courseService');
      const payload = {
        ...snapshot,
        id: content_id
      };
      const res = await saveCourse(payload);
      if (res.error) {
        console.warn('[MindSparQ Versions] Remote restore sync warning:', res.error.message);
      }
    }

    // Save a new version noting the restoration
    await createContentVersion(
      content_type as SupportedContentType,
      content_id,
      version.title,
      snapshot,
      `Restored from Version ${version.version_number} (${new Date(version.created_at).toLocaleDateString()})`
    );

    await recordAuditLog('version.restore', content_type, content_id, {
      restored_from_version: version.version_number
    });

    return { success: true, error: null };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    console.error('[MindSparQ Versions] Error restoring content version:', errorObj);
    return { success: false, error: errorObj };
  }
}

// ============================================================================
// PREVIEW TOKENS (TIME-LIMITED SECURE DRAFT ACCESS)
// ============================================================================

interface PreviewTokenPayload {
  t: string; // type
  id: string; // id
  exp: number; // expires timestamp
  sig: string; // signature
}

const PREVIEW_SECRET = 'mindsparq-draft-preview-salt-2026';

function generateSignature(type: string, id: string, exp: number): string {
  let hash = 0;
  const str = `${type}:${id}:${exp}:${PREVIEW_SECRET}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generates a shareable, time-limited token for staff to review private drafts
 */
export function generatePreviewToken(
  type: string,
  id: string,
  expiresInHours = 48
): string {
  const exp = Date.now() + expiresInHours * 60 * 60 * 1000;
  const sig = generateSignature(type, id, exp);
  const payload: PreviewTokenPayload = { t: type, id, exp, sig };
  return btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Verifies if a given preview token is valid, matches the target, and is not expired
 */
export function verifyPreviewToken(
  token: string | null | undefined,
  expectedType: string,
  expectedId: string
): boolean {
  if (!token) return false;
  try {
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = atob(base64);
    const payload: PreviewTokenPayload = JSON.parse(jsonStr);

    if (payload.t !== expectedType || payload.id !== expectedId) {
      return false;
    }

    if (Date.now() > payload.exp) {
      return false; // Expired
    }

    const expectedSig = generateSignature(payload.t, payload.id, payload.exp);
    return payload.sig === expectedSig;
  } catch {
    return false;
  }
}
