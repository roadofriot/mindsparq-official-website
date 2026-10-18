import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidColor,
  isValidLength,
  sanitizeStyleValue,
  validateElementStyle,
  elementStyleToCss,
  generateStyleSheet,
  StyleOverridesMap,
  ElementStyle
} from '../cms/styleSchema';
import {
  saveDraftStyleOverrides,
  publishStyleOverrides,
  getDraftStyleOverrides,
  getPublishedStyleOverrides,
  applyStyleOverridesToDOM
} from '../services/styleOverrideService';
import {
  getSiteSections,
  saveSiteSection,
  publishSiteSections
} from '../services/siteCustomizerService';

describe('Design Customization & Style Overrides Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    const existing = document.getElementById('mindsparq-dynamic-overrides');
    if (existing) existing.remove();
  });

  describe('Validation & Sanitization', () => {
    it('validates hex, rgb, rgba, hsl, transparent, and css variables correctly', () => {
      expect(isValidColor('#2457d6')).toBe(true);
      expect(isValidColor('#fff')).toBe(true);
      expect(isValidColor('#ffffffaa')).toBe(true);
      expect(isValidColor('rgb(36, 87, 214)')).toBe(true);
      expect(isValidColor('rgba(36, 87, 214, 0.5)')).toBe(true);
      expect(isValidColor('hsl(220, 70%, 50%)')).toBe(true);
      expect(isValidColor('transparent')).toBe(true);
      expect(isValidColor('var(--color-primary-600)')).toBe(true);

      // Rejects malicious or invalid values
      expect(isValidColor('red; background: black')).toBe(false);
      expect(isValidColor('javascript:alert(1)')).toBe(false);
      expect(isValidColor('123456')).toBe(false);
    });

    it('validates lengths, percentages, and responsive clamp formulas', () => {
      expect(isValidLength('0')).toBe(true);
      expect(isValidLength('24px')).toBe(true);
      expect(isValidLength('1.5rem')).toBe(true);
      expect(isValidLength('100%')).toBe(true);
      expect(isValidLength('50vw')).toBe(true);
      expect(isValidLength('auto')).toBe(true);
      expect(isValidLength('clamp(1rem, 2.5vw, 2rem)')).toBe(true);
      expect(isValidLength('calc(100% - 20px)')).toBe(true);

      // Rejects invalid strings
      expect(isValidLength('24px; color: red')).toBe(false);
      expect(isValidLength('alert("xss")')).toBe(false);
    });

    it('sanitizes dangerous characters to prevent CSS injection', () => {
      expect(sanitizeStyleValue('red; color: blue;')).toBe('red color: blue');
      expect(sanitizeStyleValue('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeStyleValue('<script>evil()</script>')).toBe('scriptevil()/script');
    });

    it('validates and sanitizes a complete ElementStyle object', () => {
      const raw: ElementStyle = {
        backgroundColor: '#2457d6',
        textColor: 'invalid-color',
        paddingTop: '20px',
        paddingBottom: 'calc(100% - 10px)',
        width: '500px',
        maxWidth: '1200px',
        textAlign: 'center',
        overlayOpacity: 1.5 // should clamp to 1.0
      };

      const clean = validateElementStyle(raw);
      expect(clean.backgroundColor).toBe('#2457d6');
      expect(clean.textColor).toBeUndefined(); // rejected
      expect(clean.paddingTop).toBe('20px');
      expect(clean.paddingBottom).toBe('calc(100% - 10px)');
      expect(clean.width).toBe('500px');
      expect(clean.textAlign).toBe('center');
      expect(clean.overlayOpacity).toBe(1.0);
    });
  });

  describe('CSS Rule Generation', () => {
    it('generates scoped rules and emitted CSS variables for components', () => {
      const style: ElementStyle = {
        backgroundColor: '#0f172a',
        textColor: '#ffffff',
        headingColor: '#38bdf8',
        paddingTop: '40px',
        paddingBottom: '40px',
        borderRadius: '16px'
      };

      const css = elementStyleToCss(style, '[data-style-id="social_community_hub"]');
      expect(css).toContain('[data-style-id="social_community_hub"]');
      expect(css).toContain('background-color: #0f172a;');
      expect(css).toContain('color: #ffffff;');
      expect(css).toContain('--ms-bg: #0f172a;');
      expect(css).toContain('--ms-heading: #38bdf8;');
      expect(css).toContain('border-radius: 16px;');
    });

    it('generates responsive media queries for tablet and mobile overrides', () => {
      const map: StyleOverridesMap = {
        'programs.trust_strip': {
          base: {
            marginTop: '24px',
            backgroundColor: '#ffffff'
          },
          tablet: {
            marginTop: '16px'
          },
          mobile: {
            marginTop: '8px',
            paddingTop: '12px'
          }
        }
      };

      const sheet = generateStyleSheet(map);
      expect(sheet).toContain('[data-style-id="programs.trust_strip"]');
      expect(sheet).toContain('@media (max-width: 768px)');
      expect(sheet).toContain('@media (max-width: 480px)');
      expect(sheet).toContain('margin-top: 8px;');
    });
  });

  describe('Persistence & Draft Isolation', () => {
    it('saves draft style overrides without mutating published store until published', async () => {
      const initialPublished = await getPublishedStyleOverrides();
      expect(initialPublished).toEqual({});

      const draftMap: StyleOverridesMap = {
        'social_community_hub': {
          base: { backgroundColor: '#112233' }
        }
      };

      const saveRes = await saveDraftStyleOverrides(draftMap, 'Staff Tester');
      expect(saveRes.success).toBe(true);

      // Draft has the new styling
      const loadedDraft = await getDraftStyleOverrides();
      expect(loadedDraft['social_community_hub']?.base?.backgroundColor).toBe('#112233');

      // Published visitor store is still empty / untouched
      const publishedAfterDraft = await getPublishedStyleOverrides();
      expect(publishedAfterDraft['social_community_hub']).toBeUndefined();

      // Now publish live
      const pubRes = await publishStyleOverrides(draftMap, 'Staff Publisher', 'Testing publish');
      expect(pubRes.success).toBe(true);

      // Visitor store now reflects published changes
      const publishedAfterPublish = await getPublishedStyleOverrides();
      expect(publishedAfterPublish['social_community_hub']?.base?.backgroundColor).toBe('#112233');
    });

    it('injects dynamic stylesheet into document DOM', () => {
      const map: StyleOverridesMap = {
        'social_community_hub': {
          base: { backgroundColor: '#123456' }
        }
      };

      applyStyleOverridesToDOM(map);
      const tag = document.getElementById('mindsparq-dynamic-overrides');
      expect(tag).not.toBeNull();
      expect(tag?.textContent).toContain('#123456');
    });

    it('enforces draft-first workflow for homepage sections', async () => {
      const defaultList = await getSiteSections('published');
      expect(defaultList.length).toBeGreaterThan(0);

      const target = { ...defaultList[0], title: 'Draft Custom Title 2026' };
      const saveRes = await saveSiteSection(target);
      expect(saveRes.success).toBe(true);

      // Draft shows update
      const draftList = await getSiteSections('draft');
      expect(draftList[0].title).toBe('Draft Custom Title 2026');

      // Published list still has old title
      const publishedList = await getSiteSections('published');
      expect(publishedList[0].title).not.toBe('Draft Custom Title 2026');

      // Publish live
      const pubRes = await publishSiteSections('Staff Publisher', 'Published test section');
      expect(pubRes.success).toBe(true);

      // Now published reflects it
      const afterPub = await getSiteSections('published');
      expect(afterPub[0].title).toBe('Draft Custom Title 2026');
    });
  });
});
