import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { recordAuditLog } from './auditService';

export type CustomBlockType =
  | 'default'
  | 'rich_text'
  | 'feature_grid'
  | 'split_media'
  | 'stats_strip'
  | 'video_showcase'
  | 'faq_accordion'
  | 'cta_banner';

export interface SectionLayoutStyle {
  containerWidth?: 'narrow' | 'standard' | 'wide' | 'full'; // 960px | 1200px | 1440px | 100%
  minHeight?: 'auto' | 'compact' | 'medium' | 'screen' | 'custom'; // auto | 360px | 520px | 100vh | custom px
  customHeightPx?: number;
  paddingTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl'; // 0 | 24px | 48px | 80px | 120px
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  alignment?: 'left' | 'center' | 'right' | 'split';
  headingScale?: 'sm' | 'md' | 'lg' | 'display';
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImageUrl?: string;
  backgroundOverlayOpacity?: number; // 0 to 1
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  ctaButtonTarget?: '_self' | '_blank';
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
}

export interface SiteSection {
  id: string;
  key: string;
  name: string;
  title: string;
  subtitle: string;
  badge?: string;
  is_visible: boolean;
  sort_order: number;
  block_type?: CustomBlockType;
  layout_style?: SectionLayoutStyle;
  content_json: Record<string, any>;
}

export const DEFAULT_SECTION_LAYOUT: SectionLayoutStyle = {
  containerWidth: 'standard',
  minHeight: 'auto',
  paddingTop: 'md',
  paddingBottom: 'md',
  alignment: 'center',
  headingScale: 'md',
  backgroundOverlayOpacity: 0.4
};

export interface GlobalDesignSettings {
  brandPalette: 'ocean-blue' | 'cyber-cyan' | 'emerald-stem' | 'royal-indigo' | 'electric-amber';
  borderRadius: 'standard' | 'sleek-pill' | 'modern-soft';
  fontFamily: 'Inter' | 'Outfit' | 'Plus Jakarta Sans' | 'System';
  animationIntensity: 'smooth' | 'subtle' | 'none';
}

const STORAGE_KEY_SECTIONS = 'mindsparq_site_sections';
const STORAGE_KEY_DESIGN = 'mindsparq_design_settings';

export const DEFAULT_DESIGN_SETTINGS: GlobalDesignSettings = {
  brandPalette: 'ocean-blue',
  borderRadius: 'standard',
  fontFamily: 'Inter',
  animationIntensity: 'smooth'
};

export const DEFAULT_SECTIONS: SiteSection[] = [
  {
    id: 'sec-hero',
    key: 'hero',
    name: 'Hero Carousel & Announcement',
    title: 'MindSparQ Education & Technology',
    subtitle: 'Empowering Minds, Sparking Innovation in STEAM, Robotics, AI, Abacus & Drone Technology in Butwal-11, Kalikanagar.',
    badge: 'Featured Announcement',
    is_visible: true,
    sort_order: 1,
    content_json: {}
  },
  {
    id: 'sec-focus',
    key: 'focus_strip',
    name: '4 Core Pillars Strip',
    title: 'Next-Gen Cognitive & Tech Foundation',
    subtitle: 'From mental arithmetic to building autonomous drones and artificial intelligence models.',
    badge: 'Our Pillars',
    is_visible: true,
    sort_order: 2,
    content_json: {
      pillars: ['Abacus Mental Math', 'AI & Coding', 'Robotics Engineering', 'Teacher & Parent Training']
    }
  },
  {
    id: 'sec-about',
    key: 'about_snippet',
    name: 'About MindSparQ Overview',
    title: 'Empowering Young Innovators in Nepal',
    subtitle: 'We bridge foundational cognitive skills with modern technological literacy, preparing children for tomorrow’s global opportunities.',
    badge: 'Why MindSparQ',
    is_visible: true,
    sort_order: 3,
    content_json: {
      location: 'Butwal-11, Kalikanagar (Opposite Kalika Manavgyan Secondary School)',
      establishedYear: '2024'
    }
  },
  {
    id: 'sec-programs',
    key: 'programs_overview',
    name: 'Curriculum Programs Showcase',
    title: 'Explore Our Core STEAM Curriculum',
    subtitle: 'Hands-on programs structured by developmental age, progression levels, and experiential practice.',
    badge: 'Academic Programs',
    is_visible: true,
    sort_order: 4,
    content_json: {}
  },
  {
    id: 'sec-ai-robotics',
    key: 'ai_robotics_feature',
    name: 'AI & Robotics Spotlight',
    title: 'Hands-On Robotics & Applied Artificial Intelligence',
    subtitle: 'Students design, assemble, program, and test real hardware circuits, sensors, and intelligent algorithms.',
    badge: 'Future Tech Lab',
    is_visible: true,
    sort_order: 5,
    content_json: {}
  },
  {
    id: 'sec-who-we-support',
    key: 'who_we_support',
    name: 'Who We Support Section',
    title: 'Designed for Learners, Parents, and Partner Schools',
    subtitle: 'Tailored learning pathways from foundational children to educational institutions seeking modern STEAM curricula.',
    badge: 'Community Ecosystem',
    is_visible: true,
    sort_order: 6,
    content_json: {}
  },
  {
    id: 'sec-learning-approach',
    key: 'learning_approach',
    name: 'Learning Approach & Pedagogy',
    title: 'Experiential, Hands-on, and Project-Driven Pedagogy',
    subtitle: 'We replace passive rote learning with creative exploration, cognitive training, and practical engineering challenges.',
    badge: 'Our Methodology',
    is_visible: true,
    sort_order: 7,
    content_json: {}
  },
  {
    id: 'sec-social-hub',
    key: 'social_community_hub',
    name: 'Social Media & Live Community Hub',
    title: 'Connect With MindSparQ Across Social Media',
    subtitle: 'Follow our daily classroom journeys, robotics experiments, mental math milestones, student spotlights, and instant admissions support across our official channels.',
    badge: 'Live Community & Social Highlights',
    is_visible: true,
    sort_order: 8,
    content_json: {}
  },
  {
    id: 'sec-courses-catalog',
    key: 'courses_catalog',
    name: 'Interactive Course Catalog & Age Hub',
    title: 'Comprehensive STEAM Course Catalog',
    subtitle: 'Search and filter specialized coding, abacus, and robotics courses designed for foundational, middle, and high school learners.',
    badge: 'Course Offerings',
    is_visible: true,
    sort_order: 9,
    content_json: {}
  },
  {
    id: 'sec-school-partnerships',
    key: 'school_partnerships',
    name: 'School Partnerships & Turnkey Labs',
    title: 'Turnkey STEAM Labs & School Partnerships',
    subtitle: 'Deploy comprehensive robotics hardware sets, certified trainers, and structured curricula directly into your school timetable.',
    badge: 'Institutional Synergy & Turnkey Labs',
    is_visible: true,
    sort_order: 10,
    content_json: {}
  },
  {
    id: 'sec-inquiry-cta',
    key: 'inquiry_cta',
    name: 'Direct Inquiry Call-to-Action',
    title: 'Ready to Spark Your Child’s Potential?',
    subtitle: 'Visit our center in Butwal-11, Kalikanagar or call us directly to schedule a free demonstration class.',
    badge: 'Enroll Now',
    is_visible: true,
    sort_order: 11,
    content_json: {
      phone: '+977 9857058666',
      altPhone: '9703606381',
      actionUrl: '/contact'
    }
  }
];

export const PALETTE_CONFIGS: Record<GlobalDesignSettings['brandPalette'], { primary: string; hover: string; soft: string; ring: string }> = {
  'ocean-blue': {
    primary: '#2457D6',
    hover: '#1A44B2',
    soft: 'rgba(36, 87, 214, 0.1)',
    ring: 'rgba(36, 87, 214, 0.45)'
  },
  'cyber-cyan': {
    primary: '#0284C7',
    hover: '#0369A1',
    soft: 'rgba(2, 132, 199, 0.12)',
    ring: 'rgba(2, 132, 199, 0.45)'
  },
  'emerald-stem': {
    primary: '#059669',
    hover: '#047857',
    soft: 'rgba(5, 150, 105, 0.12)',
    ring: 'rgba(5, 150, 105, 0.45)'
  },
  'royal-indigo': {
    primary: '#4F46E5',
    hover: '#4338CA',
    soft: 'rgba(79, 70, 229, 0.12)',
    ring: 'rgba(79, 70, 229, 0.45)'
  },
  'electric-amber': {
    primary: '#D97706',
    hover: '#B45309',
    soft: 'rgba(217, 119, 6, 0.14)',
    ring: 'rgba(217, 119, 6, 0.45)'
  }
};

/**
 * Fetch all configurable homepage sections
 */
export async function getSiteSections(): Promise<SiteSection[]> {
  try {
    // 1. Try cloud database if configured
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('site_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as SiteSection[];
      }
    }

    // 2. Local storage cache
    const cached = localStorage.getItem(STORAGE_KEY_SECTIONS);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // ignore
  }

  return DEFAULT_SECTIONS;
}

/**
 * Save an updated section
 */
export async function saveSiteSection(section: SiteSection): Promise<{ success: boolean; error?: Error }> {
  try {
    // Save to local storage
    const currentSections = await getSiteSections();
    const index = currentSections.findIndex((s) => s.id === section.id || s.key === section.key);
    let updated: SiteSection[];
    if (index >= 0) {
      updated = [...currentSections];
      updated[index] = section;
    } else {
      updated = [...currentSections, section];
    }
    localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(updated));

    // Persist to Supabase if available
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('site_sections')
        .upsert({
          id: section.id,
          key: section.key,
          name: section.name,
          title: section.title,
          subtitle: section.subtitle,
          badge: section.badge,
          is_visible: section.is_visible,
          sort_order: section.sort_order,
          content_json: section.content_json,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('[SiteCustomizer] Cloud save failed, saved locally:', error.message);
      } else {
        await recordAuditLog('section.update', 'site_sections', section.id, { title: section.title, is_visible: section.is_visible });
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err as Error };
  }
}

/**
 * Reorder sections
 */
export async function reorderSiteSections(orderedIds: string[]): Promise<boolean> {
  try {
    const current = await getSiteSections();
    const updated = current.map((sec) => {
      const newOrder = orderedIds.indexOf(sec.id);
      return newOrder >= 0 ? { ...sec, sort_order: newOrder + 1 } : sec;
    }).sort((a, b) => a.sort_order - b.sort_order);

    localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      for (const item of updated) {
        await supabase.from('site_sections').update({ sort_order: item.sort_order }).eq('id', item.id);
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Reset all sections to factory default
 */
export async function resetDefaultSections(): Promise<SiteSection[]> {
  localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(DEFAULT_SECTIONS));
  return DEFAULT_SECTIONS;
}

/**
 * Delete a custom section
 */
export async function deleteSiteSection(id: string): Promise<boolean> {
  try {
    const current = await getSiteSections();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY_SECTIONS, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      await supabase.from('site_sections').delete().eq('id', id);
      await recordAuditLog('section.delete', 'site_sections', id, {});
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a new custom block template
 */
export function createCustomBlockTemplate(blockType: CustomBlockType): SiteSection {
  const timestamp = Date.now();
  const id = `custom-block-${timestamp}`;

  switch (blockType) {
    case 'rich_text':
      return {
        id,
        key: `rich_text_${timestamp}`,
        name: 'Custom Editorial & Rich Text Block',
        title: 'Modern Learning Philosophy at MindSparQ',
        subtitle: 'Hands-on pedagogy combining cognitive arithmetic and modern engineering foundations in Rupandehi.',
        badge: 'Innovation Highlight',
        is_visible: true,
        sort_order: 99,
        block_type: 'rich_text',
        layout_style: { ...DEFAULT_SECTION_LAYOUT, alignment: 'left' },
        content_json: {
          markdownBody: `### Experiential STEAM Education
At MindSparQ, we believe that education must ignite curiosity. Students participate in hands-on workshops where theoretical concepts are directly transformed into functional robotic models and rapid mental calculations.

* **Child-Centric Mentorship**: Personalized pacing according to cognitive learning styles.
* **Modern Equipment**: High-grade robotics kits, microcontrollers, and visual programming.
* **Verified Outcomes**: Enhanced concentration, spatial memory, and analytical reasoning.`
        }
      };

    case 'feature_grid':
      return {
        id,
        key: `feature_grid_${timestamp}`,
        name: 'Feature Grid (3-Column Showcase)',
        title: 'Why Parents & Schools Choose MindSparQ',
        subtitle: 'Our evidence-backed multi-sensory teaching strategies empower children to excel academically and technologically.',
        badge: 'Core Advantages',
        is_visible: true,
        sort_order: 99,
        block_type: 'feature_grid',
        layout_style: { ...DEFAULT_SECTION_LAYOUT, containerWidth: 'wide' },
        content_json: {
          features: [
            {
              title: 'VAK Multi-Sensory Pedagogy',
              description: 'Visual, Auditory, and Kinesthetic learning integration proven to boost retention and conceptual confidence.',
              icon: 'Eye'
            },
            {
              title: 'Hands-on STEM Prototyping',
              description: 'Real microcontrollers, ultrasonic sensors, and autonomous drone flight controllers built from scratch.',
              icon: 'Cpu'
            },
            {
              title: 'International Abacus Standards',
              description: 'Structured 8-level mental arithmetic curriculum preparing students for national and international Olympiads.',
              icon: 'Award'
            }
          ]
        }
      };

    case 'split_media':
      return {
        id,
        key: `split_media_${timestamp}`,
        name: 'Split Media & Narrative Banner',
        title: 'Experience The MindSparQ Robotics Lab',
        subtitle: 'Located right in Kalikanagar, our learning center provides state-of-the-art workstations, 3D printers, and test tracks.',
        badge: 'Interactive Lab Tour',
        is_visible: true,
        sort_order: 99,
        block_type: 'split_media',
        layout_style: { ...DEFAULT_SECTION_LAYOUT, alignment: 'split' },
        content_json: {
          mediaPosition: 'right', // 'left' | 'right'
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
          bulletPoints: [
            'Dedicated hardware testing benches for every student',
            'Safe, low-voltage robotics and electronic components',
            'Experienced trainers certified in cognitive child development'
          ]
        }
      };

    case 'stats_strip':
      return {
        id,
        key: `stats_strip_${timestamp}`,
        name: 'Key Metrics & Statistics Strip',
        title: 'MindSparQ By The Numbers',
        subtitle: 'Measurable educational impact delivered to students and schools across Lumbini Province.',
        badge: 'Our Track Record',
        is_visible: true,
        sort_order: 99,
        block_type: 'stats_strip',
        layout_style: { ...DEFAULT_SECTION_LAYOUT, containerWidth: 'standard', paddingTop: 'sm', paddingBottom: 'sm' },
        content_json: {
          stats: [
            { number: '1,200+', label: 'Active Learners' },
            { number: '15+', label: 'Partner Schools' },
            { number: '98%', label: 'Parent Satisfaction' },
            { number: '8 Levels', label: 'Abacus Mastery' }
          ]
        }
      };

    case 'video_showcase':
      return {
        id,
        key: `video_showcase_${timestamp}`,
        name: 'Featured Video Showcase',
        title: 'Watch MindSparQ Students in Action',
        subtitle: 'See how young learners solve complex mental arithmetic calculations and program autonomous robotic rovers.',
        badge: 'Video Documentary',
        is_visible: true,
        sort_order: 99,
        block_type: 'video_showcase',
        layout_style: { ...DEFAULT_SECTION_LAYOUT, containerWidth: 'standard' },
        content_json: {
          youtubeVideoId: 'dQw4w9WgXcQ'
        }
      };

    case 'faq_accordion':
      return {
        id,
        key: `faq_accordion_${timestamp}`,
        name: 'Frequently Asked Questions (FAQ)',
        title: 'Common Questions From Parents & Guardians',
        subtitle: 'Everything you need to know about age groups, class schedules, batch sizes, and admissions.',
        badge: 'FAQ & Guidance',
        is_visible: true,
        sort_order: 99,
        block_type: 'faq_accordion',
        layout_style: { ...DEFAULT_SECTION_LAYOUT, containerWidth: 'narrow' },
        content_json: {
          faqs: [
            {
              question: 'What is the ideal age to start Abacus Mental Math?',
              answer: 'Children between ages 5 and 13 benefit the most from abacus training as brain neuroplasticity and visual calculation pathways develop most rapidly during these foundational years.'
            },
            {
              question: 'Do students need prior coding or computer experience for Robotics?',
              answer: 'No prior experience is required. Our beginner tracks start with intuitive visual block programming (Scratch) before progressing to C++ and Python syntax.'
            },
            {
              question: 'Where is the MindSparQ center located in Butwal?',
              answer: 'Our main center is conveniently located in Butwal-11, Kalikanagar (Opposite Kalika Manavgyan Secondary School), Rupandehi.'
            }
          ]
        }
      };

    case 'cta_banner':
    default:
      return {
        id,
        key: `cta_banner_${timestamp}`,
        name: 'Call-to-Action Announcement Banner',
        title: 'Admissions Open for Winter STEAM Bootcamp',
        subtitle: 'Limited seats per batch to guarantee individual attention. Book your child’s diagnostic assessment today.',
        badge: 'Limited Enrollment',
        is_visible: true,
        sort_order: 99,
        block_type: 'cta_banner',
        layout_style: {
          ...DEFAULT_SECTION_LAYOUT,
          containerWidth: 'standard',
          ctaButtonText: 'Register for Demo Class',
          ctaButtonUrl: '/contact',
          secondaryButtonText: 'Call +977 9857058666',
          secondaryButtonUrl: 'tel:+9779857058666'
        },
        content_json: {}
      };
  }
}

/**
 * Global Design Settings
 */
export function getDesignSettings(): GlobalDesignSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DESIGN);
    if (saved) {
      return { ...DEFAULT_DESIGN_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_DESIGN_SETTINGS;
}

export function saveDesignSettings(settings: GlobalDesignSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_DESIGN, JSON.stringify(settings));
    applyDesignSettingsToDOM(settings);
    recordAuditLog('design.update', 'global_design', 'theme', settings as unknown as Record<string, unknown>).catch(() => {});
  } catch {
    // ignore
  }
}

/**
 * Dynamically applies design tokens to CSS custom properties in document.documentElement
 */
export function applyDesignSettingsToDOM(settings: GlobalDesignSettings = getDesignSettings()): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const palette = PALETTE_CONFIGS[settings.brandPalette] || PALETTE_CONFIGS['ocean-blue'];

  // Apply colors
  root.style.setProperty('--color-brand-primary', palette.primary);
  root.style.setProperty('--color-primary-600', palette.primary);
  root.style.setProperty('--color-brand-primary-hover', palette.hover);
  root.style.setProperty('--color-brand-primary-soft', palette.soft);
  root.style.setProperty('--color-focus-ring', palette.ring);

  // Apply border radius
  if (settings.borderRadius === 'sleek-pill') {
    root.style.setProperty('--radius-sm', '8px');
    root.style.setProperty('--radius-md', '16px');
    root.style.setProperty('--radius-lg', '24px');
    root.style.setProperty('--radius-xl', '32px');
  } else if (settings.borderRadius === 'modern-soft') {
    root.style.setProperty('--radius-sm', '4px');
    root.style.setProperty('--radius-md', '8px');
    root.style.setProperty('--radius-lg', '12px');
    root.style.setProperty('--radius-xl', '18px');
  } else {
    // Standard
    root.style.setProperty('--radius-sm', '6px');
    root.style.setProperty('--radius-md', '10px');
    root.style.setProperty('--radius-lg', '16px');
    root.style.setProperty('--radius-xl', '24px');
  }

  // Apply font family
  if (settings.fontFamily === 'Outfit') {
    root.style.setProperty('--font-sans', "'Outfit', 'Inter', -apple-system, sans-serif");
    root.style.setProperty('--font-heading', "'Outfit', sans-serif");
  } else if (settings.fontFamily === 'Plus Jakarta Sans') {
    root.style.setProperty('--font-sans', "'Plus Jakarta Sans', 'Inter', sans-serif");
    root.style.setProperty('--font-heading', "'Plus Jakarta Sans', sans-serif");
  } else {
    root.style.setProperty('--font-sans', "'Inter', -apple-system, sans-serif");
    root.style.setProperty('--font-heading', "'Inter', sans-serif");
  }

  // Apply animation intensity
  if (settings.animationIntensity === 'none') {
    root.style.setProperty('--transition-fast', '0ms');
    root.style.setProperty('--transition-normal', '0ms');
    root.style.setProperty('--transition-slow', '0ms');
  } else if (settings.animationIntensity === 'subtle') {
    root.style.setProperty('--transition-fast', '100ms ease');
    root.style.setProperty('--transition-normal', '180ms ease');
    root.style.setProperty('--transition-slow', '250ms ease');
  } else {
    root.style.setProperty('--transition-fast', '150ms ease-out');
    root.style.setProperty('--transition-normal', '250ms ease');
    root.style.setProperty('--transition-slow', '350ms cubic-bezier(0.16, 1, 0.3, 1)');
  }
}
