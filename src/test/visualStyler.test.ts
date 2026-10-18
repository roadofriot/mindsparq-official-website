import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSiteSections,
  saveSiteSection,
  deleteSiteSection,
  createCustomBlockTemplate,
  DEFAULT_SECTIONS,
  DEFAULT_SECTION_LAYOUT
} from '../services/siteCustomizerService';

describe('WordPress-Grade Visual Section & Layout Studio', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads factory default sections when local storage is empty', async () => {
    const sections = await getSiteSections();
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[0].key).toBe(DEFAULT_SECTIONS[0].key);
  });

  it('creates valid custom block templates for all supported block types', () => {
    const richTextBlock = createCustomBlockTemplate('rich_text');
    expect(richTextBlock.block_type).toBe('rich_text');
    expect(richTextBlock.content_json.markdownBody).toBeDefined();

    const featureGridBlock = createCustomBlockTemplate('feature_grid');
    expect(featureGridBlock.block_type).toBe('feature_grid');
    expect(Array.isArray(featureGridBlock.content_json.features)).toBe(true);

    const splitMediaBlock = createCustomBlockTemplate('split_media');
    expect(splitMediaBlock.block_type).toBe('split_media');
    expect(splitMediaBlock.content_json.imageUrl).toBeDefined();

    const statsBlock = createCustomBlockTemplate('stats_strip');
    expect(statsBlock.block_type).toBe('stats_strip');
    expect(statsBlock.content_json.stats.length).toBeGreaterThan(0);

    const videoBlock = createCustomBlockTemplate('video_showcase');
    expect(videoBlock.block_type).toBe('video_showcase');
    expect(videoBlock.content_json.youtubeVideoId).toBeDefined();

    const faqBlock = createCustomBlockTemplate('faq_accordion');
    expect(faqBlock.block_type).toBe('faq_accordion');
    expect(faqBlock.content_json.faqs.length).toBeGreaterThan(0);
  });

  it('saves and updates custom section layout properties', async () => {
    const customBlock = createCustomBlockTemplate('cta_banner');
    customBlock.layout_style = {
      ...DEFAULT_SECTION_LAYOUT,
      containerWidth: 'wide',
      minHeight: 'medium',
      paddingTop: 'lg',
      paddingBottom: 'lg',
      alignment: 'center',
      ctaButtonText: 'Start Free Trial',
      ctaButtonUrl: '/trial'
    };

    const saveRes = await saveSiteSection(customBlock);
    expect(saveRes.success).toBe(true);

    const reloaded = await getSiteSections('draft');
    const found = reloaded.find((s) => s.id === customBlock.id);
    expect(found).toBeDefined();
    expect(found?.layout_style?.containerWidth).toBe('wide');
    expect(found?.layout_style?.minHeight).toBe('medium');
    expect(found?.layout_style?.ctaButtonText).toBe('Start Free Trial');
  });

  it('deletes a custom section successfully', async () => {
    const customBlock = createCustomBlockTemplate('stats_strip');
    await saveSiteSection(customBlock);

    let reloaded = await getSiteSections('draft');
    expect(reloaded.some((s) => s.id === customBlock.id)).toBe(true);

    const deleted = await deleteSiteSection(customBlock.id);
    expect(deleted).toBe(true);

    reloaded = await getSiteSections('draft');
    expect(reloaded.some((s) => s.id === customBlock.id)).toBe(false);
  });
});
