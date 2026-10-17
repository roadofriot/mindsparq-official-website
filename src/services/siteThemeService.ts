/**
 * MindSparQ Enterprise Theme, Layout & Global Frame Customizer Service
 * 
 * Provides centralized, reactive state management for:
 * - Dynamic Header geometry (height, logo scale, sticky positioning, CTA button)
 * - Top Announcement Bar (message, CTA link, background palette, dismissal)
 * - Navigation Menu hierarchy
 * - Footer layout (brand blurb, dynamic link columns, registered center notice, copyright)
 * - Global Typography & Design Tokens (fonts, primary brand hue, container widths, radii)
 */

export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface HeaderConfig {
  height: number;                // 56px to 96px (default: 68)
  logoHeight: number;            // 28px to 64px (default: 42)
  isSticky: boolean;             // Sticky positioning vs static flow
  showAnnouncement: boolean;     // Top announcement banner toggle
  announcementText: string;      // Banner announcement message
  announcementLink: string;      // Target URL or CTA link
  announcementBg: string;        // Hex or gradient color
  announcementDismissible: boolean;
  ctaButtonText: string;         // e.g. "Enroll Now" or "Book a Free Demo"
  ctaButtonLink: string;         // e.g. "/contact" or "/courses"
  showCtaButton: boolean;        // Toggle CTA button visibility
  customNavItems: NavMenuItem[];
}

export interface FooterColumn {
  id: string;
  title: string;
  links: Array<{ label: string; href: string }>;
}

export interface FooterConfig {
  brandDescription: string;
  registeredCenterText: string;
  contactPhone: string;
  contactEmail: string;
  copyrightText: string;         // Supports {year} dynamic placeholder
  showVisitorCount: boolean;
  showSocialBadges: boolean;
  columns: FooterColumn[];
  backgroundTheme: 'surface' | 'slate' | 'navy' | 'black';
}

export type HeadingFontOption = 'Inter' | 'Outfit' | 'Plus Jakarta Sans' | 'Roboto' | 'Merriweather' | 'System';
export type BodyFontOption = 'Inter' | 'Roboto' | 'Plus Jakarta Sans' | 'System';
export type BorderRadiusOption = 'sharp' | 'modern' | 'rounded' | 'squircle';

export interface GlobalTypographyConfig {
  headingFont: HeadingFontOption;
  bodyFont: BodyFontOption;
  fontScale: 'compact' | 'standard' | 'spacious';
  containerMaxWidth: '1120px' | '1200px' | '1280px' | '1440px' | '1600px';
  borderRadiusPreset: BorderRadiusOption;
  primaryColor: string;
}

export interface MindSparQThemeSettings {
  header: HeaderConfig;
  footer: FooterConfig;
  typography: GlobalTypographyConfig;
  updatedAt: string;
}

export const THEME_STORAGE_KEY = 'mindsparq_theme_settings_v1';
export const THEME_UPDATE_EVENT = 'mindsparq_theme_updated';

/**
 * Enterprise Production Defaults
 */
export const DEFAULT_THEME_SETTINGS: MindSparQThemeSettings = {
  header: {
    height: 68,
    logoHeight: 42,
    isSticky: true,
    showAnnouncement: false,
    announcementText: '🚀 Spring Admissions Open for Advanced Robotics & AI Foundations — Limited Seats!',
    announcementLink: '/courses',
    announcementBg: '#2457D6',
    announcementDismissible: true,
    ctaButtonText: 'Enroll Now',
    ctaButtonLink: '/contact',
    showCtaButton: true,
    customNavItems: [
      { id: 'nav-home', label: 'Home', href: '/' },
      { id: 'nav-about', label: 'About', href: '/about' },
      { id: 'nav-programs', label: 'Programs', href: '/programs' },
      { id: 'nav-courses', label: 'Courses', href: '/courses' },
      { id: 'nav-team', label: 'Faculty', href: '/team' },
      { id: 'nav-events', label: 'Events', href: '/events' },
      { id: 'nav-blog', label: 'Blog', href: '/blog' },
      { id: 'nav-contact', label: 'Contact', href: '/contact' }
    ]
  },
  footer: {
    brandDescription: 'Empowering Minds, Sparking Innovation. Structured cognitive mathematics, robotics logic, and applied AI education in Nepal.',
    registeredCenterText: 'Ward No. 11, Kalikanagar, Butwal, Rupandehi, Lumbini Province, Nepal',
    contactPhone: '+977 9857058666',
    contactEmail: 'mindsparqeducation@gmail.com',
    copyrightText: '© {year} MindSparQ Education & Technology. All rights reserved. Butwal, Nepal.',
    showVisitorCount: true,
    showSocialBadges: true,
    backgroundTheme: 'surface',
    columns: [
      {
        id: 'col-programs',
        title: 'Programs',
        links: [
          { label: 'Abacus & Mental Math', href: '/programs' },
          { label: 'Vedic Mathematics', href: '/programs' },
          { label: 'Robotics & AI', href: '/programs' },
          { label: 'Teacher Training', href: '/programs' }
        ]
      },
      {
        id: 'col-platform',
        title: 'Platform',
        links: [
          { label: 'Explore Courses', href: '/courses' },
          { label: 'Upcoming Events', href: '/events' },
          { label: 'Tech & Ed Blog', href: '/blog' },
          { label: 'Student Login', href: '/login' }
        ]
      },
      {
        id: 'col-company',
        title: 'Institutional',
        links: [
          { label: 'About MindSparQ', href: '/about' },
          { label: 'Faculty & Mentors', href: '/team' },
          { label: 'Contact & Inquiries', href: '/contact' },
          { label: 'Privacy Policy', href: '/privacy' }
        ]
      }
    ]
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    fontScale: 'standard',
    containerMaxWidth: '1200px',
    borderRadiusPreset: 'modern',
    primaryColor: '#2457D6'
  },
  updatedAt: new Date().toISOString()
};

/**
 * Dynamically loads Google Fonts if custom typography is selected
 */
function ensureGoogleFontLoaded(fontFamily: string): void {
  if (typeof document === 'undefined') return;
  const standardFonts = ['Inter', 'Roboto', 'System'];
  if (standardFonts.includes(fontFamily)) return;

  const fontId = `google-font-${fontFamily.toLowerCase().replace(/\s+/g, '-')}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

/**
 * Injects dynamic design tokens into the DOM root
 */
export function applyThemeToDocument(settings: MindSparQThemeSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // 1. Heading & Body Typography
  const headingFont = settings.typography.headingFont;
  const bodyFont = settings.typography.bodyFont;
  
  ensureGoogleFontLoaded(headingFont);
  if (bodyFont !== headingFont) {
    ensureGoogleFontLoaded(bodyFont);
  }

  const headingFontStack = headingFont === 'System' 
    ? `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    : `'${headingFont}', -apple-system, BlinkMacSystemFont, sans-serif`;

  const bodyFontStack = bodyFont === 'System'
    ? `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    : `'${bodyFont}', 'Mukta', -apple-system, BlinkMacSystemFont, sans-serif`;

  root.style.setProperty('--font-heading', headingFontStack);
  root.style.setProperty('--font-sans', bodyFontStack);

  // 2. Container Geometry
  root.style.setProperty('--container-max', settings.typography.containerMaxWidth);
  root.style.setProperty('--header-height', `${settings.header.height}px`);

  // 3. Border Radii
  switch (settings.typography.borderRadiusPreset) {
    case 'sharp':
      root.style.setProperty('--radius-sm', '2px');
      root.style.setProperty('--radius-md', '4px');
      root.style.setProperty('--radius-lg', '8px');
      root.style.setProperty('--radius-xl', '12px');
      break;
    case 'rounded':
      root.style.setProperty('--radius-sm', '8px');
      root.style.setProperty('--radius-md', '14px');
      root.style.setProperty('--radius-lg', '20px');
      root.style.setProperty('--radius-xl', '28px');
      break;
    case 'squircle':
      root.style.setProperty('--radius-sm', '10px');
      root.style.setProperty('--radius-md', '18px');
      root.style.setProperty('--radius-lg', '24px');
      root.style.setProperty('--radius-xl', '36px');
      break;
    case 'modern':
    default:
      root.style.setProperty('--radius-sm', '6px');
      root.style.setProperty('--radius-md', '10px');
      root.style.setProperty('--radius-lg', '16px');
      root.style.setProperty('--radius-xl', '24px');
      break;
  }

  // 4. Primary Brand Color
  if (settings.typography.primaryColor) {
    root.style.setProperty('--color-brand-primary', settings.typography.primaryColor);
    root.style.setProperty('--color-primary-600', settings.typography.primaryColor);
  }
}

/**
 * Retrieves the active theme settings with fallback to defaults
 */
export function getSiteThemeSettings(): MindSparQThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_THEME_SETTINGS;

  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<MindSparQThemeSettings>;
    return {
      header: {
        ...DEFAULT_THEME_SETTINGS.header,
        ...(parsed.header || {})
      },
      footer: {
        ...DEFAULT_THEME_SETTINGS.footer,
        ...(parsed.footer || {})
      },
      typography: {
        ...DEFAULT_THEME_SETTINGS.typography,
        ...(parsed.typography || {})
      },
      updatedAt: parsed.updatedAt || new Date().toISOString()
    };
  } catch (err) {
    console.error('Failed to load theme settings from storage:', err);
    return DEFAULT_THEME_SETTINGS;
  }
}

/**
 * Saves and broadcasts updated theme settings across the browser
 */
export function saveSiteThemeSettings(settings: MindSparQThemeSettings): void {
  if (typeof window === 'undefined') return;

  const payload: MindSparQThemeSettings = {
    ...settings,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to persist theme settings:', err);
  }

  // Apply to active document DOM
  applyThemeToDocument(payload);

  // Broadcast event to reactive listeners
  window.dispatchEvent(new CustomEvent(THEME_UPDATE_EVENT, { detail: payload }));
}

/**
 * Restores defaults and clears custom overrides
 */
export function resetSiteThemeSettings(): MindSparQThemeSettings {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  applyThemeToDocument(DEFAULT_THEME_SETTINGS);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(THEME_UPDATE_EVENT, { detail: DEFAULT_THEME_SETTINGS }));
  }

  return DEFAULT_THEME_SETTINGS;
}
