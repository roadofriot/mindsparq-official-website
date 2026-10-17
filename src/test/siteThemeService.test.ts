import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_THEME_SETTINGS,
  getSiteThemeSettings,
  saveSiteThemeSettings,
  resetSiteThemeSettings,
  applyThemeToDocument,
  THEME_STORAGE_KEY,
  THEME_UPDATE_EVENT,
  MindSparQThemeSettings
} from '../services/siteThemeService';

describe('siteThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.cssText = '';
  });

  it('provides comprehensive enterprise default settings', () => {
    expect(DEFAULT_THEME_SETTINGS.header.height).toBe(68);
    expect(DEFAULT_THEME_SETTINGS.header.logoHeight).toBe(42);
    expect(DEFAULT_THEME_SETTINGS.header.isSticky).toBe(true);
    expect(DEFAULT_THEME_SETTINGS.header.customNavItems.length).toBeGreaterThan(0);
    expect(DEFAULT_THEME_SETTINGS.footer.columns.length).toBe(3);
    expect(DEFAULT_THEME_SETTINGS.typography.headingFont).toBe('Inter');
    expect(DEFAULT_THEME_SETTINGS.typography.primaryColor).toBe('#2457D6');
  });

  it('retrieves default theme settings when localStorage is empty', () => {
    const settings = getSiteThemeSettings();
    expect(settings.header.height).toBe(68);
    expect(settings.footer.backgroundTheme).toBe('surface');
  });

  it('persists and applies updated theme settings', () => {
    const updated: MindSparQThemeSettings = {
      ...DEFAULT_THEME_SETTINGS,
      header: {
        ...DEFAULT_THEME_SETTINGS.header,
        height: 80,
        showAnnouncement: true,
        announcementText: 'Admissions Open 2026'
      },
      typography: {
        ...DEFAULT_THEME_SETTINGS.typography,
        headingFont: 'Outfit',
        primaryColor: '#059669',
        containerMaxWidth: '1440px'
      }
    };

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    saveSiteThemeSettings(updated);

    // Verify localStorage
    const savedRaw = localStorage.getItem(THEME_STORAGE_KEY);
    expect(savedRaw).toBeTruthy();
    const saved = JSON.parse(savedRaw!);
    expect(saved.header.height).toBe(80);
    expect(saved.header.announcementText).toBe('Admissions Open 2026');
    expect(saved.typography.primaryColor).toBe('#059669');

    // Verify event dispatch
    expect(dispatchSpy).toHaveBeenCalled();
    const dispatchedEvent = dispatchSpy.mock.calls[0][0] as CustomEvent;
    expect(dispatchedEvent.type).toBe(THEME_UPDATE_EVENT);

    // Verify DOM CSS variable injection
    expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('80px');
    expect(document.documentElement.style.getPropertyValue('--container-max')).toBe('1440px');
    expect(document.documentElement.style.getPropertyValue('--color-brand-primary')).toBe('#059669');
  });

  it('resets settings back to factory defaults', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      ...DEFAULT_THEME_SETTINGS,
      header: { ...DEFAULT_THEME_SETTINGS.header, height: 90 }
    }));

    const restored = resetSiteThemeSettings();
    expect(restored.header.height).toBe(68);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('applies custom border radius presets correctly', () => {
    applyThemeToDocument({
      ...DEFAULT_THEME_SETTINGS,
      typography: {
        ...DEFAULT_THEME_SETTINGS.typography,
        borderRadiusPreset: 'sharp'
      }
    });

    expect(document.documentElement.style.getPropertyValue('--radius-md')).toBe('4px');

    applyThemeToDocument({
      ...DEFAULT_THEME_SETTINGS,
      typography: {
        ...DEFAULT_THEME_SETTINGS.typography,
        borderRadiusPreset: 'squircle'
      }
    });

    expect(document.documentElement.style.getPropertyValue('--radius-md')).toBe('18px');
  });
});
