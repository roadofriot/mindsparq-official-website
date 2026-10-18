import { useState, useEffect } from 'react';
import { 
  MindSparQThemeSettings, 
  getSiteThemeSettings, 
  loadSiteThemeSettingsAsync,
  THEME_UPDATE_EVENT, 
  applyThemeToDocument 
} from '../services/siteThemeService';
import { CMS_DOCUMENT_CHANGED_EVENT, CmsChangeEventDetail } from '../services/cmsStore';

/**
 * Custom React Hook for reactive site-wide theme, header, and footer settings.
 * Synchronizes with custom events, cloud CMS store, and local storage across components.
 */
export function useSiteTheme(): MindSparQThemeSettings {
  const [themeSettings, setThemeSettings] = useState<MindSparQThemeSettings>(() => {
    const initial = getSiteThemeSettings();
    if (typeof document !== 'undefined') {
      applyThemeToDocument(initial);
    }
    return initial;
  });

  useEffect(() => {
    let isMounted = true;

    // Asynchronously fetch latest published settings from Supabase/Cloud CMS
    loadSiteThemeSettingsAsync().then((remoteSettings) => {
      if (isMounted && remoteSettings) {
        setThemeSettings(remoteSettings);
      }
    });

    const handleThemeUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<MindSparQThemeSettings>;
      if (customEvent.detail) {
        setThemeSettings(customEvent.detail);
      } else {
        setThemeSettings(getSiteThemeSettings());
      }
    };

    const handleCmsDocUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CmsChangeEventDetail>;
      if (customEvent.detail && customEvent.detail.key === 'settings.theme') {
        const docData = customEvent.detail.data as Partial<MindSparQThemeSettings>;
        if (docData) {
          const fresh = getSiteThemeSettings();
          setThemeSettings(fresh);
        }
      }
    };

    window.addEventListener(THEME_UPDATE_EVENT, handleThemeUpdate);
    window.addEventListener(CMS_DOCUMENT_CHANGED_EVENT, handleCmsDocUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(THEME_UPDATE_EVENT, handleThemeUpdate);
      window.removeEventListener(CMS_DOCUMENT_CHANGED_EVENT, handleCmsDocUpdate);
    };
  }, []);

  return themeSettings;
}
