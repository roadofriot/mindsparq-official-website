import { describe, it, expect, beforeEach } from 'vitest';
import {
  updatePageSeo,
  generateOrganizationSchema,
  generateCourseSchema,
  generateArticleSchema,
  injectJsonLd,
  removeJsonLd
} from '../utils/seo';

describe('SEO & Sitemap Pipeline', () => {
  beforeEach(() => {
    document.title = '';
    removeJsonLd();
  });

  it('updates document title, description, canonical, and OpenGraph tags', () => {
    updatePageSeo({
      title: 'Robotics for Kids',
      description: 'Hands-on robotics curriculum in Butwal.',
      canonicalPath: '/courses/robotics-explorers',
      ogType: 'course',
      ogImage: 'https://example.com/robotics.jpg'
    });

    expect(document.title).toContain('Robotics for Kids');
    expect(document.title).toContain('MindSparQ Education & Technology');

    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute('content')).toBe('Hands-on robotics curriculum in Butwal.');

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    expect(canonicalLink?.getAttribute('href')).toBe('https://mindsparqeducation.com.np/courses/robotics-explorers');

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute('content')).toContain('Robotics for Kids');

    const ogType = document.querySelector('meta[property="og:type"]');
    expect(ogType?.getAttribute('content')).toBe('course');

    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
  });

  it('enforces noindex and nofollow when noIndex option is specified', () => {
    updatePageSeo({
      title: 'Private Preview Canvas',
      noIndex: true
    });

    const robotsMeta = document.querySelector('meta[name="robots"]');
    expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('generates compliant Schema.org Organization structured data', () => {
    const org = generateOrganizationSchema();
    expect(org['@context']).toBe('https://schema.org');
    expect(org['@type']).toBe('EducationalOrganization');
    expect(org.name).toBe('MindSparQ Education & Technology');
    expect(org.url).toBe('https://mindsparqeducation.com.np');
  });

  it('generates compliant Schema.org Course structured data', () => {
    const courseSchema = generateCourseSchema({
      title: 'Mental Arithmetic Level 1',
      description: 'Abacus calculation techniques for speed and focus.',
      slug: 'mental-arithmetic-level-1',
      price_npr: 3500
    });

    expect(courseSchema['@type']).toBe('Course');
    expect(courseSchema.name).toBe('Mental Arithmetic Level 1');
    expect(courseSchema.url).toBe('https://mindsparqeducation.com.np/courses/mental-arithmetic-level-1');
  });

  it('generates compliant Schema.org BlogPosting structured data', () => {
    const articleSchema = generateArticleSchema({
      title: 'VAK Methods in Action',
      excerpt: 'Visual, Auditory, Kinesthetic pacing in modern classrooms.',
      slug: 'vak-methods-in-action',
      author_name: 'Samay Budhathoki Chhetri',
      published_at: '2026-09-01T10:00:00Z'
    });

    expect(articleSchema['@type']).toBe('BlogPosting');
    expect(articleSchema.headline).toBe('VAK Methods in Action');
    expect(articleSchema.url).toBe('https://mindsparqeducation.com.np/blog/vak-methods-in-action');
  });

  it('injects and cleans up JSON-LD scripts dynamically in head', () => {
    const data = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'MindSparQ' };
    injectJsonLd(data, 'test-jsonld');

    const script = document.getElementById('test-jsonld') as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.type).toBe('application/ld+json');
    expect(JSON.parse(script.text)).toEqual(data);

    removeJsonLd('test-jsonld');
    expect(document.getElementById('test-jsonld')).toBeNull();
  });
});
