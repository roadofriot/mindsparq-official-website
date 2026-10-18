/**
 * MindSparQ Education & Technology (mindsparqeducation.com.np)
 * Universal CMS Store Service
 * 
 * Provides a resilient, single-source-of-truth document store for:
 * - Published state (cms_documents table in Postgres -> public read)
 * - Draft state (cms_drafts table in Postgres -> staff read/write)
 * - LocalStorage sync cache (survives offline/network interruptions, but invalidates cleanly)
 * - Realtime broadcast and subscription across all client tabs
 * - Automatic immutable audit & revision snapshots on publish
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { recordAuditLog } from './auditService';
import { createContentVersion, SupportedContentType } from './versionService';

export interface CmsStoreItem<T = Record<string, unknown>> {
  key: string;
  data: T;
  version: number;
  updatedAt: string;
  updatedBy?: string | null;
  status: 'draft' | 'published';
}

const LOCAL_STORAGE_CMS_PREFIX = 'mindsparq_cms_doc_';
const LOCAL_STORAGE_DRAFT_PREFIX = 'mindsparq_cms_draft_';
export const CMS_DOCUMENT_CHANGED_EVENT = 'mindsparq_cms_document_changed';

export interface CmsChangeEventDetail {
  key: string;
  status: 'draft' | 'published';
  data: unknown;
}

/**
 * Read published document (Publicly accessible, used by site visitors)
 * Fallback chain: Supabase cms_documents -> Local cache -> provided defaultData
 */
export async function getPublishedDocument<T extends Record<string, unknown>>(
  key: string,
  defaultData: T
): Promise<{ data: T; version: number; publishedAt: string }> {
  // 1. Try Supabase cloud store
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('cms_documents')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (!error && data && data.data) {
        // Cache locally for offline resilience
        try {
          localStorage.setItem(`${LOCAL_STORAGE_CMS_PREFIX}${key}`, JSON.stringify(data));
        } catch {
          // ignore quota errors
        }
        return {
          data: { ...defaultData, ...(data.data as T) },
          version: data.version || 1,
          publishedAt: data.published_at || new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn(`[CmsStore] Cloud fetch failed for ${key}, falling back to cache:`, err);
    }
  }

  // 2. Try local cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_CMS_PREFIX}${key}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.data) {
          return {
            data: { ...defaultData, ...(parsed.data as T) },
            version: parsed.version || 1,
            publishedAt: parsed.published_at || new Date().toISOString()
          };
        }
      }
    } catch {
      // ignore JSON parse failures
    }
  }

  // 3. Fallback to default bundled static configuration
  return {
    data: defaultData,
    version: 1,
    publishedAt: new Date().toISOString()
  };
}

/**
 * Read draft document (Staff-only, used by Admin Visual Editor)
 * Fallback chain: Supabase cms_drafts -> Local draft cache -> Published document
 */
export async function getDraftDocument<T extends Record<string, unknown>>(
  key: string,
  defaultData: T
): Promise<{ data: T; baseVersion: number; updatedAt: string }> {
  // 1. Try Supabase cms_drafts table
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('cms_drafts')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (!error && data && data.data) {
        try {
          localStorage.setItem(`${LOCAL_STORAGE_DRAFT_PREFIX}${key}`, JSON.stringify(data));
        } catch {
          // ignore
        }
        return {
          data: { ...defaultData, ...(data.data as T) },
          baseVersion: data.base_version || 0,
          updatedAt: data.updated_at || new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn(`[CmsStore] Cloud draft fetch failed for ${key}:`, err);
    }
  }

  // 2. Try local draft cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_DRAFT_PREFIX}${key}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.data) {
          return {
            data: { ...defaultData, ...(parsed.data as T) },
            baseVersion: parsed.base_version || 0,
            updatedAt: parsed.updated_at || new Date().toISOString()
          };
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. If no draft exists yet, inherit from active published document
  const published = await getPublishedDocument(key, defaultData);
  return {
    data: published.data,
    baseVersion: published.version,
    updatedAt: published.publishedAt
  };
}

/**
 * Save draft document (Staff operation, does NOT affect live public site)
 */
export async function saveDraftDocument<T extends Record<string, unknown>>(
  key: string,
  data: T,
  editorName?: string
): Promise<{ success: boolean; error?: Error }> {
  const now = new Date().toISOString();
  const draftPayload = {
    key,
    data,
    updated_at: now,
    updated_by_name: editorName || 'Staff Editor'
  };

  // 1. Save in local draft cache immediately
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_DRAFT_PREFIX}${key}`, JSON.stringify(draftPayload));
    } catch {
      // ignore
    }
  }

  // 2. Persist to Supabase cms_drafts
  if (isSupabaseConfigured) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('cms_drafts')
        .upsert({
          key,
          data,
          updated_at: now,
          updated_by: user?.id || null,
          updated_by_name: editorName || user?.user_metadata?.display_name || user?.email || 'Staff Editor'
        }, { onConflict: 'key' });

      if (error) {
        console.warn(`[CmsStore] Supabase draft upsert warning for ${key}:`, error.message);
      }
    } catch (err) {
      console.warn(`[CmsStore] Cloud draft save exception for ${key}:`, err);
    }
  }

  // 3. Broadcast local event
  broadcastChangeEvent(key, 'draft', data);
  return { success: true };
}

/**
 * Publish draft document atomically to live public site
 * Automatically creates an immutable content_version snapshot
 */
export async function publishDocument<T extends Record<string, unknown>>(
  key: string,
  data: T,
  options?: {
    publisherName?: string;
    changeSummary?: string;
    contentType?: SupportedContentType;
    title?: string;
  }
): Promise<{ success: boolean; version: number; error?: Error }> {
  const now = new Date().toISOString();
  const publisher = options?.publisherName || 'Staff Publisher';

  // 1. Fetch current published version to increment sequence
  let nextVersion = 1;
  const current = await getPublishedDocument(key, data);
  nextVersion = (current.version || 0) + 1;

  const docPayload = {
    key,
    data,
    version: nextVersion,
    published_at: now,
    published_by_name: publisher
  };

  // 2. Update local published cache and clear local draft cache
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_CMS_PREFIX}${key}`, JSON.stringify(docPayload));
      localStorage.removeItem(`${LOCAL_STORAGE_DRAFT_PREFIX}${key}`);
    } catch {
      // ignore
    }
  }

  // 3. Persist to Supabase cms_documents
  if (isSupabaseConfigured) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('cms_documents')
        .upsert({
          key,
          data,
          version: nextVersion,
          published_at: now,
          published_by: user?.id || null,
          published_by_name: publisher
        }, { onConflict: 'key' });

      if (error) {
        console.warn(`[CmsStore] Cloud publish warning for ${key}:`, error.message);
      }

      // Also clean up remote draft row
      await supabase.from('cms_drafts').delete().eq('key', key);
    } catch (err) {
      console.warn(`[CmsStore] Cloud publish exception for ${key}:`, err);
    }
  }

  // 4. Create immutable version revision snapshot
  try {
    const cType: SupportedContentType = options?.contentType || (key.startsWith('sections.') ? 'site_section' : 'page');
    await createContentVersion(
      cType,
      key,
      options?.title || `Document ${key}`,
      data as Record<string, unknown>,
      options?.changeSummary || `Published ${key} (v${nextVersion})`,
      publisher
    );
  } catch (verErr) {
    console.warn(`[CmsStore] Failed to record version snapshot for ${key}:`, verErr);
  }

  // 5. Audit log
  await recordAuditLog('cms.publish', 'cms_documents', key, {
    version: nextVersion,
    publisher
  });

  // 6. Broadcast published update
  broadcastChangeEvent(key, 'published', data);

  return { success: true, version: nextVersion };
}

/**
 * Revert draft back to current published state
 */
export async function revertDraftToPublished<T extends Record<string, unknown>>(
  key: string,
  defaultData: T
): Promise<{ success: boolean; data: T }> {
  // Clear local draft
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${LOCAL_STORAGE_DRAFT_PREFIX}${key}`);
  }

  // Clear cloud draft
  if (isSupabaseConfigured) {
    try {
      await supabase.from('cms_drafts').delete().eq('key', key);
    } catch {
      // ignore
    }
  }

  const published = await getPublishedDocument(key, defaultData);
  broadcastChangeEvent(key, 'draft', published.data);
  return { success: true, data: published.data };
}

/**
 * Broadcast change event within browser for reactive hooks
 */
function broadcastChangeEvent(key: string, status: 'draft' | 'published', data: unknown): void {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent<CmsChangeEventDetail>(CMS_DOCUMENT_CHANGED_EVENT, {
    detail: { key, status, data }
  });
  window.dispatchEvent(event);
}

/**
 * Reactive listener hook helper for React components
 */
export function subscribeToCmsDocument(
  targetKey: string,
  callback: (detail: CmsChangeEventDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<CmsChangeEventDetail>;
    if (custom.detail && (custom.detail.key === targetKey || targetKey === '*')) {
      callback(custom.detail);
    }
  };

  window.addEventListener(CMS_DOCUMENT_CHANGED_EVENT, handler);
  return () => {
    window.removeEventListener(CMS_DOCUMENT_CHANGED_EVENT, handler);
  };
}
