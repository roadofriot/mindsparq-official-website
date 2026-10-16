/**
 * MindSparQ Education & Technology (mindsparqeducation.com.np)
 * Enterprise SEO & OpenGraph Meta Management Engine
 */

export interface SeoOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'course';
  noIndex?: boolean;
}

const DEFAULT_TITLE = 'MindSparQ Education & Technology | Butwal, Nepal';
const DEFAULT_DESCRIPTION =
  'Empowering young minds through mental arithmetic, robotics, computational thinking, and STEM education in Nepal.';
const DEFAULT_OG_IMAGE = 'https://mindsparqeducation.com.np/images/og-mindsparq-default.jpg';
const SITE_URL = 'https://mindsparqeducation.com.np';

/**
 * Updates dynamic head tags for search engines, OpenGraph previews, and Twitter cards.
 */
export function updatePageSeo(options: SeoOptions): void {
  if (typeof document === 'undefined') return;

  // 1. Title Tag
  const fullTitle = options.title
    ? `${options.title} | MindSparQ Education & Technology`
    : DEFAULT_TITLE;
  document.title = fullTitle;

  // 2. Meta Description
  const description = options.description || DEFAULT_DESCRIPTION;
  setMetaTag('name', 'description', description);

  // 3. Keywords
  if (options.keywords && options.keywords.length > 0) {
    setMetaTag('name', 'keywords', options.keywords.join(', '));
  }

  // 4. Robots indexing directive
  if (options.noIndex) {
    setMetaTag('name', 'robots', 'noindex, nofollow');
  } else {
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large');
  }

  // 5. Canonical URL
  const canonicalUrl = options.canonicalPath
    ? `${SITE_URL}${options.canonicalPath.startsWith('/') ? options.canonicalPath : `/${options.canonicalPath}`}`
    : SITE_URL;
  setCanonicalTag(canonicalUrl);

  // 6. OpenGraph Meta Tags
  setMetaTag('property', 'og:title', fullTitle);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:type', options.ogType || 'website');
  setMetaTag('property', 'og:image', options.ogImage || DEFAULT_OG_IMAGE);
  setMetaTag('property', 'og:site_name', 'MindSparQ Education & Technology');
  setMetaTag('property', 'og:locale', 'en_NP');

  // 7. Twitter Card Meta Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', fullTitle);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', options.ogImage || DEFAULT_OG_IMAGE);
}

function setMetaTag(attributeKey: 'name' | 'property', attributeValue: string, content: string): void {
  let element = document.querySelector(`meta[${attributeKey}="${attributeValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeKey, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonicalTag(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Organization Schema.org JSON-LD
 */
export function generateOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'MindSparQ Education & Technology',
    alternateName: 'MindSparQ Nepal',
    url: 'https://mindsparqeducation.com.np',
    logo: 'https://mindsparqeducation.com.np/favicon.svg',
    description:
      'Pioneering computational thinking, mental arithmetic (abacus), and STEM robotics education in Butwal, Nepal.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Butwal',
      addressRegion: 'Lumbini Province',
      addressCountry: 'NP'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+977-9800000000',
      contactType: 'Admissions and Customer Service',
      availableLanguage: ['Nepali', 'English']
    },
    sameAs: [
      'https://www.facebook.com/mindsparqeducation',
      'https://www.linkedin.com/company/mindsparq-education',
      'https://www.youtube.com/@mindsparqeducation'
    ]
  };
}

/**
 * Course Schema.org JSON-LD
 */
export function generateCourseSchema(course: {
  title: string;
  description: string;
  slug: string;
  thumbnail_url?: string | null;
  price_npr?: number;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'MindSparQ Education & Technology',
      sameAs: 'https://mindsparqeducation.com.np'
    },
    url: `https://mindsparqeducation.com.np/courses/${course.slug}`,
    image: course.thumbnail_url || DEFAULT_OG_IMAGE,
    offers: {
      '@type': 'Offer',
      price: course.price_npr || 0,
      priceCurrency: 'NPR',
      category: 'STEM & Cognitive Training'
    }
  };
}

/**
 * Article / Blog Posting Schema.org JSON-LD
 */
export function generateArticleSchema(post: {
  title: string;
  excerpt: string;
  slug: string;
  cover_image_url?: string | null;
  author_name: string;
  published_at?: string | null;
  updated_at?: string | null;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `https://mindsparqeducation.com.np/blog/${post.slug}`,
    image: post.cover_image_url || DEFAULT_OG_IMAGE,
    author: {
      '@type': 'Person',
      name: post.author_name
    },
    publisher: {
      '@type': 'Organization',
      name: 'MindSparQ Education & Technology',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mindsparqeducation.com.np/favicon.svg'
      }
    },
    datePublished: post.published_at || new Date().toISOString(),
    dateModified: post.updated_at || post.published_at || new Date().toISOString()
  };
}

/**
 * Injects or updates a JSON-LD structured script tag in the document head.
 */
export function injectJsonLd(schema: Record<string, unknown>, scriptId = 'jsonld-structured-data'): void {
  if (typeof document === 'undefined') return;

  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(schema);
}

/**
 * Removes injected JSON-LD script from document head when component unmounts.
 */
export function removeJsonLd(scriptId = 'jsonld-structured-data'): void {
  if (typeof document === 'undefined') return;
  const script = document.getElementById(scriptId);
  if (script && script.parentNode) {
    script.parentNode.removeChild(script);
  }
}
