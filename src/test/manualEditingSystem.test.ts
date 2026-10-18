import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPageContent,
  savePageDraft,
  publishPage,
  getPagesInventory,
  validateUrlScheme,
  sanitizeRichText,
  PageSectionItem
} from '../services/pageService';
import {
  getSiteThemeSettings,
  saveSiteThemeSettings,
  DEFAULT_THEME_SETTINGS,
  MindSparQThemeSettings
} from '../services/siteThemeService';
import {
  getContentVersions,
  restoreContentVersion
} from '../services/versionService';

describe('MindSparQ Complete Manual Website Editing System', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.cssText = '';
    vi.restoreAllMocks();
  });

  describe('Test A: Global Header & Navigation Editing & Publishing', () => {
    it('allows updating navigation items, brand destination, logo settings, and persists correctly', async () => {
      const current = getSiteThemeSettings();
      const updated: MindSparQThemeSettings = {
        ...current,
        header: {
          ...current.header,
          logoAltText: 'MindSparQ Education & Technology Official Logo',
          logoDestination: '/about',
          showAnnouncement: true,
          announcementText: 'Spring 2026 Admissions Now Open Across Gandaki & Lumbini',
          announcementLink: '/admissions',
          customNavItems: [
            { id: 'nav-home', label: 'Home', href: '/' },
            { id: 'nav-programs', label: 'Academic Programs', href: '/programs' },
            { id: 'nav-about', label: 'About Us', href: '/about' }
          ]
        }
      };

      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      await saveSiteThemeSettings(updated);

      // Verify localStorage persistence
      const saved = getSiteThemeSettings();
      expect(saved.header.logoAltText).toBe('MindSparQ Education & Technology Official Logo');
      expect(saved.header.logoDestination).toBe('/about');
      expect(saved.header.showAnnouncement).toBe(true);
      expect(saved.header.announcementText).toContain('Spring 2026 Admissions');
      expect(saved.header.customNavItems.length).toBe(3);
      expect(saved.header.customNavItems[1].label).toBe('Academic Programs');

      // Verify DOM event broadcasted for live navbar rendering
      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('creates an audit revision snapshot when header settings are updated', async () => {
      const updated: MindSparQThemeSettings = {
        ...DEFAULT_THEME_SETTINGS,
        header: {
          ...DEFAULT_THEME_SETTINGS.header,
          announcementText: 'Updated Header Announcement'
        }
      };

      await saveSiteThemeSettings(updated);

      const versions = await getContentVersions('header', 'global-header');
      expect(versions.length).toBeGreaterThan(0);
      expect(versions[0].title).toBe('Global Header Configuration');
    });
  });

  describe('Test B: Global Footer Editing & Persistence', () => {
    it('allows editing footer columns, contact details, social links, and copyright text', async () => {
      const current = getSiteThemeSettings();
      const updated: MindSparQThemeSettings = {
        ...current,
        footer: {
          ...current.footer,
          brandDescription: 'Empowering future innovators across Nepal with computational thinking.',
          contactPhone: '+977-71-550000',
          contactEmail: 'admissions@mindsparqeducation.com.np',
          contactAddress: 'Main Highway, Butwal-09, Rupandehi, Nepal',
          copyrightText: '© 2026 MindSparQ Education & Technology Pvt. Ltd.',
          columns: [
            {
              id: 'col-acad',
              title: 'Academic Disciplines',
              links: [
                { label: 'Abacus & Mental Math', href: '/programs' },
                { label: 'Robotics & AI', href: '/courses' }
              ]
            }
          ]
        }
      };

      await saveSiteThemeSettings(updated);

      const saved = getSiteThemeSettings();
      expect(saved.footer.contactPhone).toBe('+977-71-550000');
      expect(saved.footer.contactEmail).toBe('admissions@mindsparqeducation.com.np');
      expect(saved.footer.contactAddress).toContain('Butwal-09');
      expect(saved.footer.columns[0].title).toBe('Academic Disciplines');
      expect(saved.footer.columns[0].links[0].label).toBe('Abacus & Mental Math');
    });
  });

  describe('Test C: Center Section Content & Layout Editing', () => {
    it('modifies section heading, content, and CTA safely in draft mode', async () => {
      const page = await getPageContent('about', 'draft');
      expect(page.sections.length).toBeGreaterThan(0);

      const modifiedSections = page.sections.map((sec, idx) => {
        if (idx === 0) {
          return {
            ...sec,
            title: 'Modern Learning for High-Achieving Students',
            content: 'Updated pedagogical mission text with validated rich text.',
            ctaText: 'Explore Our Curriculum',
            ctaUrl: '/programs'
          };
        }
        return sec;
      });

      const saveRes = await savePageDraft('about', {
        sections: modifiedSections,
        title: 'About MindSparQ — Updated Draft'
      }, 'Lead Editor');

      expect(saveRes.success).toBe(true);
      expect(saveRes.data?.title).toBe('About MindSparQ — Updated Draft');
      expect(saveRes.data?.sections[0].title).toBe('Modern Learning for High-Achieving Students');
      expect(saveRes.data?.sections[0].ctaText).toBe('Explore Our Curriculum');
    });

    it('isolates draft changes from published live content until published', async () => {
      // 1. Initial published state
      const initialPublished = await getPageContent('about', 'published');
      const originalTitle = initialPublished.title;

      // 2. Save a new draft
      await savePageDraft('about', {
        title: 'Confidential Unreleased Redesign'
      }, 'Draft Author');

      // 3. Draft reflects new edit
      const draftState = await getPageContent('about', 'draft');
      expect(draftState.title).toBe('Confidential Unreleased Redesign');

      // 4. Published live content remains unmodified
      const publishedState = await getPageContent('about', 'published');
      expect(publishedState.title).toBe(originalTitle);

      // 5. Explicitly publish
      const publishRes = await publishPage('about', 'Publisher');
      expect(publishRes.success).toBe(true);

      // 6. Published content is now updated
      const updatedPublished = await getPageContent('about', 'published');
      expect(updatedPublished.title).toBe('Confidential Unreleased Redesign');
      expect(updatedPublished.status).toBe('published');
    });
  });

  describe('Test D: Add, Reorder, Toggle Visibility, and Delete Section', () => {
    it('supports adding a new section, reordering, and deleting from page outline', async () => {
      const page = await getPageContent('about', 'draft');
      const initialCount = page.sections.length;

      // Add a new section
      const newSection: PageSectionItem = {
        id: 'sec-dynamic-testimonial',
        type: 'cards',
        title: 'Student & Parent Testimonials',
        subtitle: 'Real stories from our learners',
        content: 'Hear from students who conquered international math Olympiads.',
        isVisible: true,
        sortOrder: 0, // Put at top
        items: [
          {
            id: 'item-1',
            title: 'Aarav Sharma',
            description: 'Achieved 1st place in National Abacus Championship.',
            badge: 'Student'
          }
        ]
      };

      const reorderedSections = [
        newSection,
        ...page.sections.map((s, idx) => ({ ...s, sortOrder: idx + 1 }))
      ];

      await savePageDraft('about', { sections: reorderedSections });

      const updatedDraft = await getPageContent('about', 'draft');
      expect(updatedDraft.sections.length).toBe(initialCount + 1);
      expect(updatedDraft.sections[0].id).toBe('sec-dynamic-testimonial');
      expect(updatedDraft.sections[0].title).toBe('Student & Parent Testimonials');

      // Toggle visibility
      const toggled = updatedDraft.sections.map((s) =>
        s.id === 'sec-dynamic-testimonial' ? { ...s, isVisible: false } : s
      );
      await savePageDraft('about', { sections: toggled });

      const hiddenDraft = await getPageContent('about', 'draft');
      expect(hiddenDraft.sections[0].isVisible).toBe(false);

      // Delete section
      const deleted = hiddenDraft.sections.filter((s) => s.id !== 'sec-dynamic-testimonial');
      await savePageDraft('about', { sections: deleted });

      const finalDraft = await getPageContent('about', 'draft');
      expect(finalDraft.sections.length).toBe(initialCount);
      expect(finalDraft.sections.find((s) => s.id === 'sec-dynamic-testimonial')).toBeUndefined();
    });
  });

  describe('Test E: URL Security & Content Sanitization', () => {
    it('rejects unsafe javascript: and data: URLs on links and CTA buttons', () => {
      expect(validateUrlScheme('javascript:alert(1)').isValid).toBe(false);
      expect(validateUrlScheme('data:text/html,<script>alert(1)</script>').isValid).toBe(false);
      expect(validateUrlScheme('vbscript:msgbox(1)').isValid).toBe(false);

      // Valid paths and schemes
      expect(validateUrlScheme('/about').isValid).toBe(true);
      expect(validateUrlScheme('https://mindsparqeducation.com.np/programs').isValid).toBe(true);
      expect(validateUrlScheme('mailto:info@mindsparqeducation.com.np').isValid).toBe(true);
      expect(validateUrlScheme('tel:+9779800000000').isValid).toBe(true);
    });

    it('rejects saving a page draft containing dangerous link protocols', async () => {
      const page = await getPageContent('about', 'draft');
      const taintedSections: PageSectionItem[] = [
        {
          ...page.sections[0],
          ctaUrl: 'javascript:stealCredentials()'
        }
      ];

      const res = await savePageDraft('about', { sections: taintedSections });
      expect(res.success).toBe(false);
      expect(res.error?.message).toContain('Unsafe URL scheme');
    });

    it('sanitizes script tags from rich text and markdown body content', () => {
      const unsafeInput = '<p>Normal content</p><script>evil()</script><iframe src="malicious.com"></iframe>';
      const clean = sanitizeRichText(unsafeInput);
      expect(clean).not.toContain('<script');
      expect(clean).not.toContain('evil()');
      expect(clean).not.toContain('<iframe');
      expect(clean).toContain('Normal content');
    });
  });

  describe('Test F: Revision Snapshotting & Recovery Rollback', () => {
    it('creates version history on publish and restores earlier version snapshots faithfully', async () => {
      // 1. Publish baseline version 1
      await savePageDraft('about', { title: 'Baseline Title V1' });
      const pub1 = await publishPage('about', 'Alice');
      expect(pub1.success).toBe(true);

      // 2. Publish modified version 2
      await savePageDraft('about', { title: 'Accidental Overwrite V2' });
      const pub2 = await publishPage('about', 'Bob');
      expect(pub2.success).toBe(true);

      // 3. Inspect version history
      const history = await getContentVersions('page', 'about');
      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history[0].title).toBe('Accidental Overwrite V2');
      expect(history[1].title).toBe('Baseline Title V1');

      // 4. Restore version 1 snapshot
      const v1 = history[1];
      const restoreRes = await restoreContentVersion(v1);
      expect(restoreRes.success).toBe(true);

      // 5. Verify the restored snapshot is loaded into active draft
      const restoredDraft = await getPageContent('about', 'draft');
      expect(restoredDraft.title).toBe('Baseline Title V1');

      // 6. Verify version history tracked the restoration
      const updatedHistory = await getContentVersions('page', 'about');
      expect(updatedHistory.length).toBeGreaterThanOrEqual(3);
      expect(updatedHistory[0].change_summary).toContain('Restored');
    });
  });

  describe('Test G: Pages Directory Inventory', () => {
    it('lists all public routes with status and routing targets', async () => {
      const inventory = await getPagesInventory();
      expect(inventory.length).toBeGreaterThan(0);
      const about = inventory.find((p) => p.slug === 'about');
      expect(about).toBeDefined();
      expect(about?.route).toBe('/about');
      expect(about?.name).toBe('About MindSparQ');
    });
  });
});
