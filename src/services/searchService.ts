import { getSiteSections, SiteSection } from './siteCustomizerService';
import { getAllCourses } from './courseService';
import { getAllPosts } from './blogService';
import { getPublicTeamProfiles, DEFAULT_TEAM_PROFILES } from './teamService';
import { getMediaAssets } from './mediaService';
import { getAllEvents } from './eventService';

export type SearchCategory =
  | 'all'
  | 'section'
  | 'course'
  | 'blog'
  | 'team'
  | 'media'
  | 'event'
  | 'navigation'
  | 'settings';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  snippet: string;
  category: 'section' | 'course' | 'blog' | 'team' | 'media' | 'event' | 'navigation' | 'settings';
  categoryLabel: string;
  locationPath: string;
  targetRoute: string;
  badgeColor: string;
  matchScore: number;
}

const STATIC_ADMIN_NAV_ITEMS = [
  {
    id: 'nav-overview',
    title: 'Admin Overview & Dashboard',
    subtitle: 'System health, quick stats, content metrics, and key links',
    content: 'admin dashboard analytics overview total courses users published articles comments',
    locationPath: 'System > Overview',
    targetRoute: '/admin',
    category: 'navigation' as const,
    categoryLabel: 'Navigation',
    badgeColor: '#3b82f6'
  },
  {
    id: 'nav-sections',
    title: 'Visual Section Customizer',
    subtitle: 'Homepage sections, custom blocks, layout dimensions, and reordering',
    content: 'sections visual customizer layout height width padding align hero pillars about who we support',
    locationPath: 'Visual CMS > Section Customizer',
    targetRoute: '/admin/sections',
    category: 'navigation' as const,
    categoryLabel: 'Visual CMS',
    badgeColor: '#0ea5e9'
  },
  {
    id: 'nav-design',
    title: 'Global Design Settings & Tokens',
    subtitle: 'Brand palettes, typography scales, corner radii, and theme styles',
    content: 'design tokens fonts colors typography ocean blue cyber cyan border radius branding styling',
    locationPath: 'Appearance > Design Tokens',
    targetRoute: '/admin/design',
    category: 'navigation' as const,
    categoryLabel: 'Appearance',
    badgeColor: '#8b5cf6'
  },
  {
    id: 'nav-carousel',
    title: 'Homepage Carousel Manager',
    subtitle: 'Hero banners, callout headlines, slide images, and action buttons',
    content: 'carousel hero slider banner slides active slides announcement headlines',
    locationPath: 'Appearance > Carousel',
    targetRoute: '/admin/carousel',
    category: 'navigation' as const,
    categoryLabel: 'Appearance',
    badgeColor: '#ec4899'
  },
  {
    id: 'nav-ads',
    title: 'Ad Rails & Promotional Slots',
    subtitle: 'Left and right side-rail promotion containers and banners',
    content: 'ad rails skyscraper promotions banners side slots marketing sponsors',
    locationPath: 'Marketing > Ad Rails',
    targetRoute: '/admin/ads',
    category: 'navigation' as const,
    categoryLabel: 'Marketing',
    badgeColor: '#f59e0b'
  },
  {
    id: 'nav-ai',
    title: 'AI Studio & Chatbot Assistant',
    subtitle: 'Gemini 3.8 & 4 Argon prompt presets, direct answer engine, and site assistant',
    content: 'ai studio gemini copilot assistant chatbot prompts generate analyze voice speech',
    locationPath: 'AI Studio > Copilot',
    targetRoute: '/admin/ai-assistant',
    category: 'navigation' as const,
    categoryLabel: 'AI Engine',
    badgeColor: '#6366f1'
  },
  {
    id: 'nav-blog',
    title: 'Blog & Editorial Articles',
    subtitle: 'Publish articles, review revisions, manage markdown content, and tags',
    content: 'blog posts articles markdown editorial review revisions draft published authors',
    locationPath: 'Editorial > Articles',
    targetRoute: '/admin/blog',
    category: 'navigation' as const,
    categoryLabel: 'Editorial',
    badgeColor: '#10b981'
  },
  {
    id: 'nav-courses',
    title: 'Courses & Lessons Management',
    subtitle: 'Curriculum syllabus, age group filters, video embeds, and resource attachments',
    content: 'courses curriculum lessons syllabus video resources downloads modules elementary middle school',
    locationPath: 'Learning > Courses',
    targetRoute: '/admin/courses',
    category: 'navigation' as const,
    categoryLabel: 'Learning',
    badgeColor: '#06b6d4'
  },
  {
    id: 'nav-programs',
    title: 'STEAM Curriculum Programs',
    subtitle: 'Multi-level experiential programs, learning paths, and progression ladders',
    content: 'programs steam abacus mental math robotics coding ai experiential education progression',
    locationPath: 'Learning > Programs',
    targetRoute: '/admin/programs',
    category: 'navigation' as const,
    categoryLabel: 'Learning',
    badgeColor: '#14b8a6'
  },
  {
    id: 'nav-media',
    title: 'Media Library & Digital Assets',
    subtitle: 'Image gallery, asset deduplication, PDF syllabus files, and usage inspector',
    content: 'media library upload images photos pdf assets deduplication storage files',
    locationPath: 'Assets > Media Library',
    targetRoute: '/admin/media',
    category: 'navigation' as const,
    categoryLabel: 'Assets',
    badgeColor: '#f97316'
  },
  {
    id: 'nav-events',
    title: 'Events & Workshops Manager',
    subtitle: 'Upcoming competitions, parent orientations, teacher masterclasses, and venues',
    content: 'events workshops masterclasses competitions dates venue registration butwal kalikanagar',
    locationPath: 'Community > Events',
    targetRoute: '/admin/events',
    category: 'navigation' as const,
    categoryLabel: 'Community',
    badgeColor: '#e11d48'
  },
  {
    id: 'nav-team',
    title: 'Faculty & Team Profiles',
    subtitle: 'Leadership, research leads, master trainers, bios, and qualifications',
    content: 'team faculty profiles samay budhathoki chhetri sonu teachers staff bios research',
    locationPath: 'Institutional > Team',
    targetRoute: '/admin/team',
    category: 'navigation' as const,
    categoryLabel: 'Institutional',
    badgeColor: '#84cc16'
  },
  {
    id: 'nav-users',
    title: 'User Roles & Access Governance',
    subtitle: '6-tier RBAC matrix, admin permissions, and account moderation',
    content: 'users roles permissions rbac access super admin owner editor contributor learner',
    locationPath: 'Governance > Access Control',
    targetRoute: '/admin/users',
    category: 'navigation' as const,
    categoryLabel: 'Governance',
    badgeColor: '#ef4444'
  },
  {
    id: 'nav-settings',
    title: 'System Settings & Social Integrations',
    subtitle: 'Social media URLs, SEO verification, contact info, and system configuration',
    content: 'settings social links facebook instagram youtube linkedin contact phone email location',
    locationPath: 'System > Settings',
    targetRoute: '/admin/settings',
    category: 'navigation' as const,
    categoryLabel: 'Settings',
    badgeColor: '#64748b'
  },
  {
    id: 'nav-audit',
    title: 'Security Audit & Compliance Logs',
    subtitle: 'Immutable PostgreSQL audit trail of all staff actions and role modifications',
    content: 'audit logs security compliance history records timestamps staff events',
    locationPath: 'Security > Audit Logs',
    targetRoute: '/admin/audit',
    category: 'navigation' as const,
    categoryLabel: 'Security',
    badgeColor: '#dc2626'
  }
];

/**
 * Extracts a contextual snippet highlighting the query term within the source text
 */
function extractContextualSnippet(text: string, query: string, maxLength: number = 140): string {
  if (!text) return '';
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const lowerText = cleanText.toLowerCase();
  const lowerQuery = query.toLowerCase();

  const matchIdx = lowerText.indexOf(lowerQuery);
  if (matchIdx === -1) {
    return cleanText.slice(0, maxLength) + (cleanText.length > maxLength ? '...' : '');
  }

  const start = Math.max(0, matchIdx - 40);
  const end = Math.min(cleanText.length, matchIdx + query.length + 80);

  let snippet = cleanText.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < cleanText.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Computes a relevance score based on match location (title > subtitle > body content)
 */
function computeScore(title: string, subtitle: string | undefined, body: string, query: string): number {
  const q = query.toLowerCase().trim();
  let score = 0;

  const t = (title || '').toLowerCase();
  const s = (subtitle || '').toLowerCase();
  const b = (body || '').toLowerCase();

  if (t === q) score += 100;
  else if (t.startsWith(q)) score += 70;
  else if (t.includes(q)) score += 50;

  if (s.includes(q)) score += 30;
  if (b.includes(q)) score += 15;

  return score;
}

/**
 * Universal Search across all content, sections, courses, blog posts, media, team, and events
 */
export async function searchAdminContent(
  query: string,
  categoryFilter: SearchCategory = 'all'
): Promise<SearchResultItem[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const results: SearchResultItem[] = [];

  try {
    // 1. Static Admin Navigation & Features
    if (categoryFilter === 'all' || categoryFilter === 'navigation' || categoryFilter === 'settings') {
      for (const item of STATIC_ADMIN_NAV_ITEMS) {
        const fullSearchable = `${item.title} ${item.subtitle} ${item.content}`.toLowerCase();
        if (fullSearchable.includes(trimmed)) {
          const score = computeScore(item.title, item.subtitle, item.content, trimmed);
          results.push({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            snippet: extractContextualSnippet(`${item.subtitle} — ${item.content}`, trimmed),
            category: item.category,
            categoryLabel: item.categoryLabel,
            locationPath: item.locationPath,
            targetRoute: item.targetRoute,
            badgeColor: item.badgeColor,
            matchScore: score + 10 // Navigation boost for quick access
          });
        }
      }
    }

    // 2. Site Sections & Blocks
    if (categoryFilter === 'all' || categoryFilter === 'section') {
      try {
        const sections: SiteSection[] = await getSiteSections();
        for (const sec of sections) {
          const contentStr = JSON.stringify(sec.content_json || {});
          const searchable = `${sec.name} ${sec.title} ${sec.subtitle} ${sec.badge || ''} ${contentStr}`.toLowerCase();

          if (searchable.includes(trimmed)) {
            const score = computeScore(sec.title || sec.name, sec.subtitle, contentStr, trimmed);
            results.push({
              id: `sec-${sec.id}`,
              title: sec.name || sec.title,
              subtitle: sec.title !== sec.name ? sec.title : sec.subtitle,
              snippet: extractContextualSnippet(`${sec.title} | ${sec.subtitle} ${contentStr}`, trimmed),
              category: 'section',
              categoryLabel: 'Homepage Section',
              locationPath: `Homepage > ${sec.name}`,
              targetRoute: `/admin/sections?edit=${encodeURIComponent(sec.key || sec.id)}`,
              badgeColor: '#0ea5e9',
              matchScore: score
            });
          }
        }
      } catch (err) {
        console.warn('[searchService] Error querying site sections:', err);
      }
    }

    // 3. Courses & Curriculum
    if (categoryFilter === 'all' || categoryFilter === 'course') {
      try {
        const courses = await getAllCourses();
        for (const course of courses) {
          const searchable = `${course.title} ${course.level} ${course.age_group || ''} ${course.summary || ''} ${course.description || ''}`.toLowerCase();

          if (searchable.includes(trimmed)) {
            const score = computeScore(course.title, `Age: ${course.age_group || 'All'} · ${course.level}`, `${course.summary || ''} ${course.description || ''}`, trimmed);
            results.push({
              id: `course-${course.id}`,
              title: course.title,
              subtitle: `${course.level.toUpperCase()} · ${course.age_group ? `Age: ${course.age_group}` : 'All Ages'} · ${course.status}`,
              snippet: extractContextualSnippet(`${course.summary || ''} ${course.description || ''}`, trimmed),
              category: 'course',
              categoryLabel: 'Course Catalog',
              locationPath: `Curriculum > ${course.title}`,
              targetRoute: `/admin/courses?edit=${encodeURIComponent(course.id)}`,
              badgeColor: '#06b6d4',
              matchScore: score
            });
          }
        }
      } catch (err) {
        console.warn('[searchService] Error querying courses:', err);
      }
    }

    // 4. Blog Posts & Articles
    if (categoryFilter === 'all' || categoryFilter === 'blog') {
      try {
        const posts = await getAllPosts();
        for (const post of posts) {
          const searchable = `${post.title} ${post.excerpt || ''} ${post.content || ''} ${post.author_name || ''} ${post.category || ''}`.toLowerCase();

          if (searchable.includes(trimmed)) {
            const score = computeScore(post.title, post.excerpt, post.content || '', trimmed);
            results.push({
              id: `blog-${post.id}`,
              title: post.title,
              subtitle: `Author: ${post.author_name || 'Staff'} · Category: ${post.category || 'General'} · ${post.status}`,
              snippet: extractContextualSnippet(`${post.excerpt || ''} ${post.content || ''}`, trimmed),
              category: 'blog',
              categoryLabel: 'Blog Article',
              locationPath: `Blog > ${post.title}`,
              targetRoute: `/admin/blog?edit=${encodeURIComponent(post.id)}`,
              badgeColor: '#10b981',
              matchScore: score
            });
          }
        }
      } catch (err) {
        console.warn('[searchService] Error querying blog posts:', err);
      }
    }

    // 5. Team Profiles & Faculty
    if (categoryFilter === 'all' || categoryFilter === 'team') {
      try {
        const profiles = await getPublicTeamProfiles();
        const pool = profiles.length > 0 ? profiles : DEFAULT_TEAM_PROFILES;
        for (const member of pool) {
          const subjects = Array.isArray(member.teaching_subjects) ? member.teaching_subjects.join(' ') : '';
          const searchable = `${member.display_name} ${member.display_name_nepali || ''} ${member.public_title} ${member.short_bio || ''} ${member.bio || ''} ${member.education || ''} ${subjects}`.toLowerCase();

          if (searchable.includes(trimmed)) {
            const score = computeScore(member.display_name, member.public_title, `${member.short_bio || ''} ${member.bio || ''}`, trimmed);
            results.push({
              id: `team-${member.id}`,
              title: member.display_name,
              subtitle: `${member.public_title} (${member.display_name_nepali || ''})`,
              snippet: extractContextualSnippet(`${member.short_bio || ''} ${member.bio || ''} ${subjects}`, trimmed),
              category: 'team',
              categoryLabel: 'Faculty Profile',
              locationPath: `Faculty > ${member.display_name}`,
              targetRoute: `/admin/team?edit=${encodeURIComponent(member.id)}`,
              badgeColor: '#84cc16',
              matchScore: score
            });
          }
        }
      } catch (err) {
        console.warn('[searchService] Error querying team profiles:', err);
      }
    }

    // 6. Media Library Assets
    if (categoryFilter === 'all' || categoryFilter === 'media') {
      try {
        const assets = await getMediaAssets();
        for (const asset of assets) {
          const searchable = `${asset.original_filename} ${asset.alt_text || ''} ${asset.caption || ''} ${asset.mime_type || ''}`.toLowerCase();

          if (searchable.includes(trimmed)) {
            const score = computeScore(asset.original_filename, asset.mime_type, `${asset.alt_text || ''} ${asset.caption || ''}`, trimmed);
            results.push({
              id: `media-${asset.id}`,
              title: asset.original_filename,
              subtitle: `${asset.mime_type} · ${Math.round((asset.size_bytes || 0) / 1024)} KB · ${asset.media_type}`,
              snippet: extractContextualSnippet(`Original: ${asset.original_filename} Alt: ${asset.alt_text || ''} Caption: ${asset.caption || ''}`, trimmed),
              category: 'media',
              categoryLabel: 'Media Asset',
              locationPath: `Media Library > ${asset.original_filename}`,
              targetRoute: `/admin/media?highlight=${encodeURIComponent(asset.id)}`,
              badgeColor: '#f97316',
              matchScore: score
            });
          }
        }
      } catch (err) {
        console.warn('[searchService] Error querying media assets:', err);
      }
    }

    // 7. Events & Workshops
    if (categoryFilter === 'all' || categoryFilter === 'event') {
      try {
        const events = await getAllEvents();
        for (const ev of events) {
          const searchable = `${ev.title} ${ev.summary || ''} ${ev.description || ''} ${ev.location_text || ''} ${ev.status}`.toLowerCase();

          if (searchable.includes(trimmed)) {
            const score = computeScore(ev.title, `Location: ${ev.location_text || 'Butwal'} · Status: ${ev.status}`, `${ev.summary || ''} ${ev.description || ''}`, trimmed);
            results.push({
              id: `event-${ev.id}`,
              title: ev.title,
              subtitle: `Location: ${ev.location_text || 'Butwal'} · Starts: ${new Date(ev.starts_at).toLocaleDateString()}`,
              snippet: extractContextualSnippet(`${ev.summary || ''} ${ev.description || ''} Location: ${ev.location_text || ''}`, trimmed),
              category: 'event',
              categoryLabel: 'Event & Workshop',
              locationPath: `Events > ${ev.title}`,
              targetRoute: `/admin/events?edit=${encodeURIComponent(ev.id)}`,
              badgeColor: '#e11d48',
              matchScore: score
            });
          }
        }
      } catch (err) {
        console.warn('[searchService] Error querying events:', err);
      }
    }

    // Sort by relevance score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    return results;
  } catch (globalErr) {
    console.error('[searchService] Unexpected error performing search:', globalErr);
    return results;
  }
}
