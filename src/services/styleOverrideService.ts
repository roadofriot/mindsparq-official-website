import {
  StyleOverridesMap,
  generateStyleSheet
} from '../cms/styleSchema';
import {
  getPublishedDocument,
  getDraftDocument,
  saveDraftDocument,
  publishDocument
} from './cmsStore';
import { recordAuditLog } from './auditService';

export const STYLE_OVERRIDES_DOC_KEY = 'design.overrides';
export const STYLE_OVERRIDES_UPDATE_EVENT = 'mindsparq_style_overrides_updated';
const STYLE_TAG_ID = 'mindsparq-dynamic-overrides';

export interface StyleOverridesDocData extends Record<string, unknown> {
  overrides: StyleOverridesMap;
  lastUpdated?: string;
  updatedBy?: string;
}

const DEFAULT_STYLE_OVERRIDES_DATA: StyleOverridesDocData = {
  overrides: {}
};

/**
 * Injects or updates the generated CSS in the document <head>
 */
export function applyStyleOverridesToDOM(overrides: StyleOverridesMap): void {
  if (typeof document === 'undefined') return;

  let styleEl = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_TAG_ID;
    document.head.appendChild(styleEl);
  }

  const css = generateStyleSheet(overrides);
  styleEl.textContent = css;
}

/**
 * Broadcast an in-memory update across components/tabs
 */
export function broadcastStyleOverridesChange(data: StyleOverridesDocData): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STYLE_OVERRIDES_UPDATE_EVENT, { detail: data }));
  }
}

/**
 * Fetch published style overrides (visitor facing)
 */
export async function getPublishedStyleOverrides(): Promise<StyleOverridesMap> {
  try {
    const doc = await getPublishedDocument<StyleOverridesDocData>(
      STYLE_OVERRIDES_DOC_KEY,
      DEFAULT_STYLE_OVERRIDES_DATA
    );
    const overrides = doc.data.overrides || {};
    applyStyleOverridesToDOM(overrides);
    return overrides;
  } catch (err) {
    console.warn('[StyleOverrideService] Failed to load published overrides:', err);
    return {};
  }
}

/**
 * Fetch draft style overrides (editor/admin facing)
 */
export async function getDraftStyleOverrides(): Promise<StyleOverridesMap> {
  try {
    const doc = await getDraftDocument<StyleOverridesDocData>(
      STYLE_OVERRIDES_DOC_KEY,
      DEFAULT_STYLE_OVERRIDES_DATA
    );
    const overrides = doc.data.overrides || {};
    return overrides;
  } catch (err) {
    console.warn('[StyleOverrideService] Failed to load draft overrides:', err);
    return {};
  }
}

/**
 * Save draft style overrides
 */
export async function saveDraftStyleOverrides(
  overrides: StyleOverridesMap,
  editorName?: string
): Promise<{ success: boolean; error?: Error }> {
  try {
    const payload: StyleOverridesDocData = {
      overrides,
      lastUpdated: new Date().toISOString(),
      updatedBy: editorName || 'Staff Designer'
    };

    const res = await saveDraftDocument(STYLE_OVERRIDES_DOC_KEY, payload as unknown as Record<string, unknown>, editorName);
    broadcastStyleOverridesChange(payload);
    return res;
  } catch (err) {
    return { success: false, error: err as Error };
  }
}

/**
 * Publish style overrides to production
 */
export async function publishStyleOverrides(
  overrides: StyleOverridesMap,
  publisherName?: string,
  changeSummary?: string
): Promise<{ success: boolean; version: number; error?: Error }> {
  try {
    const payload: StyleOverridesDocData = {
      overrides,
      lastUpdated: new Date().toISOString(),
      updatedBy: publisherName || 'Staff Publisher'
    };

    const res = await publishDocument(
      STYLE_OVERRIDES_DOC_KEY,
      payload as unknown as Record<string, unknown>,
      {
        publisherName: publisherName || 'Staff Publisher',
        changeSummary: changeSummary || 'Published custom design style overrides',
        contentType: 'theme',
        title: 'Design Style Overrides'
      }
    );

    if (res.success) {
      applyStyleOverridesToDOM(overrides);
      broadcastStyleOverridesChange(payload);
      await recordAuditLog('design.publish', 'cms_documents', STYLE_OVERRIDES_DOC_KEY, {
        overriddenElementsCount: Object.keys(overrides).length,
        version: res.version
      });
    }

    return res;
  } catch (err) {
    return { success: false, version: 0, error: err as Error };
  }
}
