import { useState, useEffect } from 'react';
import { 
  MindSparQThemeSettings, 
  getSiteThemeSettings, 
  THEME_UPDATE_EVENT, 
  applyThemeToDocument 
} from '../services/siteThemeService';

/**
 * Custom React Hook for reactive site-wide theme, header, and footer settings.
 * Synchronizes with custom events and local storage across components.
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
    const handleThemeUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<MindSparQThemeSettings>;
      if (customEvent.detail) {
        setThemeSettings(customEvent.detail);
      } else {
        setThemeSettings(getSiteThemeSettings());
      }
    };

    window.addEventListener(THEME_UPDATE_EVENT, handleThemeUpdate);
    return () => {
      window.removeEventListener(THEME_UPDATE_EVENT, handleThemeUpdate);
    };
  }, []);

  return themeSettings;
}
