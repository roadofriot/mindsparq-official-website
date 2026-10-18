import { useState, useEffect, useCallback } from 'react';
import { StyleOverridesMap, ResponsiveStyleOverride, ElementStyle } from '../cms/styleSchema';
import {
  getPublishedStyleOverrides,
  getDraftStyleOverrides,
  saveDraftStyleOverrides,
  publishStyleOverrides,
  applyStyleOverridesToDOM,
  STYLE_OVERRIDES_UPDATE_EVENT,
  STYLE_OVERRIDES_DOC_KEY
} from '../services/styleOverrideService';
import { CMS_DOCUMENT_CHANGED_EVENT, CmsChangeEventDetail } from '../services/cmsStore';

interface UseStyleOverridesOptions {
  mode?: 'draft' | 'published';
}

export function useStyleOverrides(options: UseStyleOverridesOptions = {}) {
  const mode = options.mode || 'published';
  const [overrides, setOverrides] = useState<StyleOverridesMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load initial overrides
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loader = mode === 'draft' ? getDraftStyleOverrides : getPublishedStyleOverrides;
    loader().then((data) => {
      if (isMounted) {
        setOverrides(data);
        applyStyleOverridesToDOM(data);
        setLoading(false);
      }
    });

    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ overrides: StyleOverridesMap }>;
      if (customEvent.detail && customEvent.detail.overrides) {
        setOverrides(customEvent.detail.overrides);
        applyStyleOverridesToDOM(customEvent.detail.overrides);
      }
    };

    const handleCmsBroadcast = (e: Event) => {
      const customEvent = e as CustomEvent<CmsChangeEventDetail>;
      if (customEvent.detail && customEvent.detail.key === STYLE_OVERRIDES_DOC_KEY) {
        const docData = customEvent.detail.data as { overrides?: StyleOverridesMap };
        if (docData?.overrides) {
          setOverrides(docData.overrides);
          applyStyleOverridesToDOM(docData.overrides);
        }
      }
    };

    window.addEventListener(STYLE_OVERRIDES_UPDATE_EVENT, handleLocalUpdate);
    window.addEventListener(CMS_DOCUMENT_CHANGED_EVENT, handleCmsBroadcast);

    return () => {
      isMounted = false;
      window.removeEventListener(STYLE_OVERRIDES_UPDATE_EVENT, handleLocalUpdate);
      window.removeEventListener(CMS_DOCUMENT_CHANGED_EVENT, handleCmsBroadcast);
    };
  }, [mode]);

  // Update a single element override in memory
  const updateElementOverride = useCallback((
    styleId: string,
    breakpoint: 'base' | 'tablet' | 'mobile',
    partialStyle: Partial<ElementStyle>
  ) => {
    setOverrides((prev) => {
      const current = prev[styleId] || {};
      const targetBreakpointStyle = current[breakpoint] || {};

      const updatedBreakpointStyle: ElementStyle = {
        ...targetBreakpointStyle,
        ...partialStyle
      };

      const updatedResponsive: ResponsiveStyleOverride = {
        ...current,
        [breakpoint]: updatedBreakpointStyle
      };

      const nextMap: StyleOverridesMap = {
        ...prev,
        [styleId]: updatedResponsive
      };

      applyStyleOverridesToDOM(nextMap);
      return nextMap;
    });
  }, []);

  // Reset a single element's overrides
  const resetElementOverride = useCallback((styleId: string) => {
    setOverrides((prev) => {
      const nextMap = { ...prev };
      delete nextMap[styleId];
      applyStyleOverridesToDOM(nextMap);
      return nextMap;
    });
  }, []);

  // Save current memory state as draft
  const saveDraft = useCallback(async (editorName?: string) => {
    setIsSaving(true);
    try {
      const res = await saveDraftStyleOverrides(overrides, editorName);
      return res;
    } finally {
      setIsSaving(false);
    }
  }, [overrides]);

  // Publish current memory state live
  const publishLive = useCallback(async (publisherName?: string, changeSummary?: string) => {
    setIsSaving(true);
    try {
      const res = await publishStyleOverrides(overrides, publisherName, changeSummary);
      return res;
    } finally {
      setIsSaving(false);
    }
  }, [overrides]);

  return {
    overrides,
    setOverrides,
    updateElementOverride,
    resetElementOverride,
    saveDraft,
    publishLive,
    loading,
    isSaving
  };
}
