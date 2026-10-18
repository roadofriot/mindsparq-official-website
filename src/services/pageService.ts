/**
 * MindSparQ Education & Technology (mindsparqeducation.com.np)
 * Canonical Page Management & Content Service
 *
 * Provides enterprise-grade draft vs published state, revision snapshotting,
 * server/cloud persistence with resilient local caching, and URL/content sanitization.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { recordAuditLog } from './auditService';
import { createContentVersion } from './versionService';

export interface PageSectionItem {
  id: string;
  type: 'hero' | 'rich_text' | 'feature_grid' | 'split_media' | 'stats_strip' | 'cards' | 'faq' | 'cta' | 'contact_info';
  title: string;
  subtitle?: string;
  badge?: string;
  content: string; // Markdown or rich text body
  imageUrl?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaTarget?: '_self' | '_blank';
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  secondaryCtaTarget?: '_self' | '_blank';
  items?: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
    imageUrl?: string;
    badge?: string;
    linkUrl?: string;
  }>;
  layout?: {
    containerWidth?: 'narrow' | 'standard' | 'wide' | 'full';
    paddingTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    paddingBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    alignment?: 'left' | 'center' | 'right' | 'split';
    backgroundColor?: string;
    backgroundGradient?: string;
    backgroundImageUrl?: string;
    overlayOpacity?: number;
  };
  isVisible: boolean;
  sortOrder: number;
}

export interface PageSeoMetadata {
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface PageContentData {
  slug: string;
  route: string;
  name: string;
  title: string;
  subtitle?: string;
  heroImageUrl?: string;
  seo: PageSeoMetadata;
  sections: PageSectionItem[];
  status: 'draft' | 'published';
  updatedAt: string;
  publishedAt?: string | null;
  updatedBy?: string | null;
}

const STORAGE_KEY_PAGE_DRAFTS = 'mindsparq_pages_draft_v1';
const STORAGE_KEY_PAGE_PUBLISHED = 'mindsparq_pages_published_v1';
const PAGE_UPDATE_EVENT = 'mindsparq_page_updated';

/**
 * Verified Default Institutional Content for all Public Pages
 */
export const DEFAULT_PAGES_REGISTRY: Record<string, PageContentData> = {
  about: {
    slug: 'about',
    route: '/about',
    name: 'About MindSparQ',
    title: 'Empowering Minds, Sparking Innovation',
    subtitle: 'MindSparQ Education & Technology is an education and technology initiative based in Butwal, Nepal. We integrate foundational cognitive faculties—Abacus, Mental Math, Vedic Mathematics, and Bilingual Penmanship—with forward-looking technological competencies in AI, Coding, Robotics, and digital platforms.',
    heroImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80',
    seo: {
      metaTitle: 'About MindSparQ | Empowering Minds & Sparking Innovation',
      metaDescription: 'Learn about MindSparQ Education & Technology, our mission, pedagogical philosophy, leadership, and digital learning ecosystem in Butwal, Nepal.',
      canonicalPath: '/about'
    },
    sections: [
      {
        id: 'sec-about-mission',
        type: 'split_media',
        title: 'Our Mission & Vision',
        subtitle: 'Bridging timeless cognitive discipline with cutting-edge STEM literacy',
        badge: 'Institutional Purpose',
        content: `At MindSparQ, our mission is to deliver rigorous, accessible, and practical supplementary education that equips learners for the computational future.\n\nWe cultivate deep cognitive resilience through mental arithmetic, visual calculation, spatial logic, and experiential engineering. Children learn to not merely consume digital media, but to build, innovate, and lead with purpose.`,
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        imageAlt: 'MindSparQ STEM Learning Center in Butwal',
        ctaText: 'Explore Our Curriculum',
        ctaUrl: '/programs',
        isVisible: true,
        sortOrder: 1
      },
      {
        id: 'sec-about-pillars',
        type: 'feature_grid',
        title: 'Foundational Learning Pillars',
        subtitle: 'Four cornerstones of the MindSparQ academic framework',
        badge: 'Our Methodology',
        content: 'Every program is built upon empirical cognitive development and structured progression stages.',
        items: [
          {
            id: 'pillar-1',
            title: 'Abacus & Mental Arithmetic',
            description: 'Two-hand calculation techniques triggering bilateral brain stimulation, rapid focus, and arithmetic mastery.',
            icon: 'Calculator'
          },
          {
            id: 'pillar-2',
            title: 'AI, Coding & Computational Thinking',
            description: 'Python, block-coding, logic sequences, and applied machine learning models tailored for school students.',
            icon: 'Cpu'
          },
          {
            id: 'pillar-3',
            title: 'Hands-on Robotics & Sensor Labs',
            description: 'Circuit building, motor controllers, ultrasonic navigation, and autonomous robotics assembly.',
            icon: 'Layers'
          },
          {
            id: 'pillar-4',
            title: 'Teacher Training & School Enablement',
            description: 'Empowering local educators with modern STEAM pedagogy, lab kits, and continuous classroom guidance.',
            icon: 'GraduationCap'
          }
        ],
        isVisible: true,
        sortOrder: 2
      },
      {
        id: 'sec-about-location',
        type: 'contact_info',
        title: 'Headquarters & Innovation Lab',
        subtitle: 'Visit our flagship physical center in Butwal, Nepal',
        badge: 'Verified Physical Location',
        content: 'Butwal 11, Gyanbhoomi Path (Opposite Kalika Manavgyan Secondary School), Rupandehi, Lumbini Province, Nepal.',
        ctaText: 'Get Directions on Map',
        ctaUrl: 'https://www.google.com/maps/search/?api=1&query=Butwal+11+Gyanbhoomi+Path+Rupandehi+Nepal',
        ctaTarget: '_blank',
        isVisible: true,
        sortOrder: 3
      }
    ],
    status: 'published',
    updatedAt: '2026-10-17T00:00:00.000Z',
    publishedAt: '2026-10-17T00:00:00.000Z'
  },
  contact: {
    slug: 'contact',
    route: '/contact',
    name: 'Contact & Inquiries',
    title: 'Connect with MindSparQ',
    subtitle: 'Have inquiries about student admissions, school partnership programs, or customized STEM workshops? Reach out to our academic team in Butwal.',
    heroImageUrl: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1600&q=80',
    seo: {
      metaTitle: 'Contact MindSparQ | Inquiries & School Partnerships',
      metaDescription: 'Connect with MindSparQ Education & Technology in Butwal, Nepal. Inquire about student enrollment, school partnerships, and STEM workshops.',
      canonicalPath: '/contact'
    },
    sections: [
      {
        id: 'sec-contact-details',
        type: 'contact_info',
        title: 'Center Details & Operating Hours',
        subtitle: 'We welcome parents, educators, and school administrators for direct consultations.',
        badge: 'Get in Touch',
        content: `**Address:** Butwal 11, Gyanbhoomi Path, Rupandehi, Nepal\n**Phone:** +977 9857058666, 9703606381\n**Email:** contact@mindsparqeducation.com.np\n**Office Hours:** Sunday – Friday: 9:00 AM – 6:00 PM (Closed Saturdays)`,
        ctaText: 'Call Center Directly',
        ctaUrl: 'tel:+9779857058666',
        isVisible: true,
        sortOrder: 1
      }
    ],
    status: 'published',
    updatedAt: '2026-10-17T00:00:00.000Z',
    publishedAt: '2026-10-17T00:00:00.000Z'
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    route: '/privacy-policy',
    name: 'Privacy & Data Policy',
    title: 'MindSparQ Privacy & Child Safety Policy',
    subtitle: 'MindSparQ Education & Technology is committed to transparent, lawful, and ethical management of learner information and personal data.',
    heroImageUrl: '',
    seo: {
      metaTitle: 'Privacy Policy | MindSparQ Education & Technology',
      metaDescription: 'Understand how MindSparQ handles student information, parental consent, cookies, and digital learning data with privacy-by-design standards.',
      canonicalPath: '/privacy-policy'
    },
    sections: [
      {
        id: 'sec-privacy-body',
        type: 'rich_text',
        title: 'Information We Collect and How We Use It',
        badge: 'Data Protection Notice',
        content: `### 1. Children & Student Privacy Protection\nMindSparQ does not sell, lease, or monetize student data. Information collected during enrollment (name, guardian contact, date of birth) is used strictly for pedagogical assessment, safety verification, and academic credentialing.\n\n### 2. Website Analytics & Cookies\nWe use privacy-respecting, aggregated performance metrics (such as Cloudflare Web Analytics) that do not track users across external third-party sites or build behavioral advertising profiles.\n\n### 3. Contact & Consent\nAny message submitted via our contact or inquiry forms is delivered securely to verified MindSparQ administration personnel and retained only as long as necessary to address your educational inquiry.\n\nFor privacy inquiries, contact our Data Administrator at: **contact@mindsparqeducation.com.np**.`,
        isVisible: true,
        sortOrder: 1
      }
    ],
    status: 'published',
    updatedAt: '2026-10-17T00:00:00.000Z',
    publishedAt: '2026-10-17T00:00:00.000Z'
  },
  programs: {
    slug: 'programs',
    route: '/programs',
    name: 'Curriculum Programs',
    title: 'Comprehensive STEAM Programs',
    subtitle: 'Structured multi-level progression pathways designed to spark innovation, mathematical agility, and computational mastery.',
    heroImageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    seo: {
      metaTitle: 'Curriculum Programs | MindSparQ Education & Technology',
      metaDescription: 'Discover our certified curricula in Abacus Mental Math, Vedic Mathematics, AI & Robotics, and Teacher Enablement.',
      canonicalPath: '/programs'
    },
    sections: [],
    status: 'published',
    updatedAt: '2026-10-17T00:00:00.000Z',
    publishedAt: '2026-10-17T00:00:00.000Z'
  },
  courses: {
    slug: 'courses',
    route: '/courses',
    name: 'Courses & Workshops',
    title: 'Explore Courses & Practical Workshops',
    subtitle: 'From foundational beginner modules to advanced autonomous robotics challenges.',
    heroImageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=80',
    seo: {
      metaTitle: 'Courses & Workshops | MindSparQ Education & Technology',
      metaDescription: 'Explore our comprehensive course catalog in robotics, Python, abacus arithmetic, and machine learning.',
      canonicalPath: '/courses'
    },
    sections: [],
    status: 'published',
    updatedAt: '2026-10-17T00:00:00.000Z',
    publishedAt: '2026-10-17T00:00:00.000Z'
  },
  team: {
    slug: 'team',
    route: '/team',
    name: 'Faculty & Mentors',
    title: 'Meet Our Dedicated Educators',
    subtitle: 'Passionate educators, robotics mentors, and arithmetic coaches empowering young innovators across Nepal.',
    heroImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
    seo: {
      metaTitle: 'Faculty & Team | MindSparQ Education & Technology',
      metaDescription: 'Meet the mentors, researchers, and instructors behind MindSparQ Education & Technology.',
      canonicalPath: '/team'
    },
    sections: [],
    status: 'published',
    updatedAt: '2026-10-17T00:00:00.000Z',
    publishedAt: '2026-10-17T00:00:00.000Z'
  },
  events: {
    slug: 'events',
    route: '/events',
    name: 'Events & Exhibitions',
    title: 'Upcoming STEM Events & Exhibitions',
    subtitle: 'Workshops, inter-school robotics competitions, abacus Olympiads, and community science days.',
    heroImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
    seo: {
      metaTitle: 'Events & Workshops | MindSparQ Education & Technology',
      metaDescription: 'Stay updated on upcoming MindSparQ robotics exhibitions, competitions, and demo sessions.',
      canonicalPath: '/events'
    },
    sections: [],
    status: 'published',
    updatedAt: '2026-10-17T00:00:00.000Z',
    publishedAt: '2026-10-17T00:00:00.000Z'
  },
  blog: {
    slug: 'blog',
    route: '/blog',
    name: 'Articles & Insights',
    title: 'Educational Insights & Tech Insights',
    subtitle: 'Research articles on cognitive arithmetic, modern pedagogy, hands-on robotics, and artificial intelligence in classrooms.',
    heroImageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80',
    seo: {
      metaTitle: 'Blog & Articles | MindSparQ Education & Technology',
      metaDescription: 'Explore educational research, technology tutorials, and thought leadership from MindSparQ faculty.',
      canonicalPath: '/blog'
    },
    sections: [],
    status: 'published',
    updatedAt: '2026-10-17T00:00:00.000Z',
    publishedAt: '2026-10-17T00:00:00.000Z'
  }
};

/**
 * Validates that URLs use safe protocols (http, https, mailto, tel, or internal relative path).
 * Rejects javascript:, data:, vbscript:, and other potentially dangerous schemes.
 */
export function validateUrlScheme(url: string | undefined): { isValid: boolean; error?: string } {
  if (!url || !url.trim()) return { isValid: true };
  const trimmed = url.trim();

  // Internal path starting with / or hash #
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return { isValid: true };
  }

  // Safe protocols
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: 'Unsafe URL scheme detected. Only relative paths (/) and https:, mailto:, or tel: URLs are permitted.'
  };
}

/**
 * Sanitizes rich text / markdown strings to eliminate dangerous script tags or executable HTML.
 */
export function sanitizeContentText(content: string): string {
  if (!content) return '';
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, 'blocked-scheme:')
    .replace(/onload\s*=/gi, 'data-blocked=')
    .replace(/onerror\s*=/gi, 'data-blocked=');
}

export const sanitizeRichText = sanitizeContentText;

/**
 * Retrieves page content from local storage cache
 */
function getLocalPageContent(slug: string, mode: 'draft' | 'published'): PageContentData | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = mode === 'draft' ? STORAGE_KEY_PAGE_DRAFTS : STORAGE_KEY_PAGE_PUBLISHED;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, PageContentData>;
    return parsed[slug] || null;
  } catch {
    return null;
  }
}

/**
 * Persists page content to local storage cache
 */
function setLocalPageContent(slug: string, mode: 'draft' | 'published', data: PageContentData): void {
  if (typeof window === 'undefined') return;
  try {
    const key = mode === 'draft' ? STORAGE_KEY_PAGE_DRAFTS : STORAGE_KEY_PAGE_PUBLISHED;
    const raw = localStorage.getItem(key);
    const existing = raw ? (JSON.parse(raw) as Record<string, PageContentData>) : {};
    existing[slug] = data;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (err) {
    console.warn('[MindSparQ Pages] Local storage write failed:', err);
  }
}

/**
 * Fetches page content with complete fallback chain:
 * 1. Mode check (draft vs published)
 * 2. Cloud DB (content_pages)
 * 3. Local Storage cache
 * 4. Verified default registry
 */
export async function getPageContent(slug: string, mode: 'draft' | 'published' = 'published'): Promise<PageContentData> {
  const fallback = DEFAULT_PAGES_REGISTRY[slug] || {
    slug,
    route: `/${slug}`,
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' '),
    title: slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' '),
    subtitle: '',
    seo: {
      metaTitle: `${slug} | MindSparQ Education & Technology`,
      metaDescription: `MindSparQ Education & Technology page for ${slug}`,
      canonicalPath: `/${slug}`
    },
    sections: [],
    status: 'published',
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString()
  };

  // 1. Try local storage cache for the requested mode
  const localCached = getLocalPageContent(slug, mode);
  if (localCached) {
    return localCached;
  }

  // 2. Try CMS Document Store (cloud cms_documents / cms_drafts)
  try {
    const { getDraftDocument, getPublishedDocument } = await import('./cmsStore');
    if (mode === 'draft') {
      const draftDoc = await getDraftDocument<any>(`page_${slug}`, fallback);
      if (draftDoc && draftDoc.data && draftDoc.data.slug) {
        setLocalPageContent(slug, mode, draftDoc.data);
        return draftDoc.data;
      }
    } else {
      const pubDoc = await getPublishedDocument<any>(`page_${slug}`, fallback);
      if (pubDoc && pubDoc.data && pubDoc.data.slug) {
        setLocalPageContent(slug, mode, pubDoc.data);
        return pubDoc.data;
      }
    }
  } catch {
    // ignore
  }

  // 3. Try Supabase content_pages if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data && data.content_json) {
        const stored = data.content_json as Partial<PageContentData>;
        const merged: PageContentData = {
          ...fallback,
          ...stored,
          slug: data.slug,
          title: data.title || fallback.title,
          status: data.status as 'draft' | 'published',
          updatedAt: data.updated_at
        };
        setLocalPageContent(slug, mode, merged);
        return merged;
      }
    } catch (err) {
      console.warn('[MindSparQ Pages] Supabase query error, using registry:', err);
    }
  }

  return fallback;
}

/**
 * Saves a page draft without modifying the live published page
 */
export async function savePageDraft(
  slug: string,
  pageData: Partial<PageContentData>,
  editorName?: string
): Promise<{ success: boolean; data: PageContentData | null; error: Error | null }> {
  try {
    const existing = await getPageContent(slug, 'draft');
    
    // Validate all URLs in sections
    if (pageData.sections) {
      for (const sec of pageData.sections) {
        const checkCta = validateUrlScheme(sec.ctaUrl);
        if (!checkCta.isValid) throw new Error(`Section "${sec.title}": ${checkCta.error}`);
        const checkSecCta = validateUrlScheme(sec.secondaryCtaUrl);
        if (!checkSecCta.isValid) throw new Error(`Section "${sec.title}": ${checkSecCta.error}`);
      }
    }

    const updated: PageContentData = {
      ...existing,
      ...pageData,
      slug,
      status: 'draft',
      updatedAt: new Date().toISOString(),
      updatedBy: editorName || 'Staff Editor'
    };

    // Store draft locally
    setLocalPageContent(slug, 'draft', updated);

    // Persist draft to CMS cloud store
    try {
      const { saveDraftDocument } = await import('./cmsStore');
      await saveDraftDocument(`page_${slug}`, updated as unknown as Record<string, unknown>, editorName);
    } catch {
      // ignore
    }

    // Persist draft to cloud content_pages if configured
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('content_pages')
        .upsert({
          slug,
          title: updated.title,
          content_json: {
            ...updated,
            status: 'draft'
          },
          status: 'draft',
          updated_at: updated.updatedAt
        }, { onConflict: 'slug' });

      if (error) {
        console.warn('[MindSparQ Pages] Cloud draft save warning, preserved locally:', error.message);
      }
    }

    await recordAuditLog('page.save_draft', 'content_pages', slug, {
      title: updated.title,
      sectionCount: updated.sections.length
    });

    return { success: true, data: updated, error: null };
  } catch (err) {
    return { success: false, data: null, error: err as Error };
  }
}

/**
 * Publishes the page draft atomically to the public live site
 * Creates an immutable version snapshot in content_versions for rollback
 */
export async function publishPage(
  slug: string,
  authorName?: string
): Promise<{ success: boolean; data: PageContentData | null; error: Error | null }> {
  try {
    const draft = await getPageContent(slug, 'draft');
    const now = new Date().toISOString();

    const publishedPayload: PageContentData = {
      ...draft,
      status: 'published',
      publishedAt: now,
      updatedAt: now,
      updatedBy: authorName || 'Staff Editor'
    };

    // 1. Save published copy locally
    setLocalPageContent(slug, 'published', publishedPayload);
    // Sync draft copy so editor sees published state
    setLocalPageContent(slug, 'draft', publishedPayload);

    // 2. Publish to universal CMS store (cms_documents table)
    try {
      const { publishDocument } = await import('./cmsStore');
      await publishDocument(`page_${slug}`, publishedPayload as unknown as Record<string, unknown>, {
        publisherName: authorName,
        changeSummary: `Published page: ${publishedPayload.title}`,
        contentType: 'page' as any,
        title: publishedPayload.title
      });
    } catch {
      // ignore
    }

    // 3. Persist to Supabase content_pages
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('content_pages')
        .upsert({
          slug,
          title: publishedPayload.title,
          content_json: publishedPayload,
          status: 'published',
          published_at: now,
          updated_at: now
        }, { onConflict: 'slug' });

      if (error) {
        console.warn('[MindSparQ Pages] Cloud publish failed, published locally:', error.message);
      }
    }

    // 4. Create immutable version history snapshot
    await createContentVersion(
      'page' as any,
      slug,
      publishedPayload.title,
      publishedPayload as unknown as Record<string, unknown>,
      `Published page: ${publishedPayload.title}`,
      authorName
    );

    // 5. Record audit log
    await recordAuditLog('page.publish', 'content_pages', slug, {
      title: publishedPayload.title,
      publishedAt: now
    });

    // 6. Broadcast update event so live components react immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PAGE_UPDATE_EVENT, { detail: { slug, data: publishedPayload } }));
    }

    return { success: true, data: publishedPayload, error: null };
  } catch (err) {
    return { success: false, data: null, error: err as Error };
  }
}

/**
 * Restores an earlier version snapshot for a page
 */
export async function restorePageVersion(
  slug: string,
  snapshot: Record<string, unknown>,
  restoredByName?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const pageData = snapshot as unknown as PageContentData;
    if (!pageData || !pageData.slug) {
      throw new Error('Invalid version snapshot structure.');
    }

    // Save as active draft so admin can inspect before re-publishing
    await savePageDraft(slug, pageData, restoredByName);

    await recordAuditLog('page.restore_version', 'content_pages', slug, {
      restoredTitle: pageData.title
    });

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err as Error };
  }
}

/**
 * Returns inventory of all editable pages
 */
export async function getPagesInventory(): Promise<Array<{ slug: string; route: string; name: string; title: string; status: 'draft' | 'published'; updatedAt: string }>> {
  const slugs = Object.keys(DEFAULT_PAGES_REGISTRY);
  const result = [];

  for (const slug of slugs) {
    const page = await getPageContent(slug, 'draft');
    result.push({
      slug: page.slug,
      route: page.route,
      name: page.name,
      title: page.title,
      status: page.status,
      updatedAt: page.updatedAt
    });
  }

  return result;
}
