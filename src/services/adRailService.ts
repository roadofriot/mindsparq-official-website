/**
 * MindSparQ Ad-Rail & Promotional Slot Service
 * Supports Left/Right Portrait side-rails on wide desktop screens
 * and in-flow promotional cards on mobile screens.
 */

export interface AdSlotConfig {
  slotId: 'site-rail-left' | 'site-rail-right' | 'mobile-inline-promo';
  title: string;
  badge: string;
  badgeNepali?: string;
  imageUrl: string;
  destinationUrl: string;
  altText: string;
  isActive: boolean;
  isSponsored?: boolean;
  sponsorName?: string;
  updatedAt?: string;
}

export const DEFAULT_AD_SLOTS: Record<string, AdSlotConfig> = {
  'site-rail-left': {
    slotId: 'site-rail-left',
    title: 'Abacus & Mental Math Championship 2026',
    badge: 'MindSparQ Feature',
    badgeNepali: 'MindSparQ कार्यक्रम',
    imageUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&h=900&q=80',
    destinationUrl: '/programs#abacus-mental-math',
    altText: 'MindSparQ Abacus & Mental Arithmetic Program — Learn Speed Math & Visual Calculation',
    isActive: true,
    isSponsored: false
  },
  'site-rail-right': {
    slotId: 'site-rail-right',
    title: 'AI, Coding & Robotics Lab Admissions',
    badge: 'Admissions Open',
    badgeNepali: 'भर्ना खुला',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&h=900&q=80',
    destinationUrl: '/programs#ai-coding-robotics',
    altText: 'MindSparQ AI, Coding & Robotics Program — Hands-on STEM Lab in Butwal',
    isActive: true,
    isSponsored: false
  },
  'mobile-inline-promo': {
    slotId: 'mobile-inline-promo',
    title: 'MindSparQ STEM & Mental Math Programs 2026',
    badge: 'Admissions 2026',
    badgeNepali: 'शैक्षिक सत्र २०२६',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&h=450&q=80',
    destinationUrl: '/programs',
    altText: 'MindSparQ Education & Technology Admissions Open in Butwal',
    isActive: true,
    isSponsored: false
  }
};

const STORAGE_KEY_AD_SLOTS = 'mindsparq_ad_rails_config';

export function getAllAdSlots(): Record<string, AdSlotConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AD_SLOTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_AD_SLOTS, ...parsed };
    }
  } catch (err) {
    console.warn('[AdRailService] Failed to load custom ad slots:', err);
  }
  return { ...DEFAULT_AD_SLOTS };
}

export function getAdSlot(slotId: 'site-rail-left' | 'site-rail-right' | 'mobile-inline-promo'): AdSlotConfig {
  const all = getAllAdSlots();
  return all[slotId] || DEFAULT_AD_SLOTS[slotId];
}

export function saveAdSlot(slotId: 'site-rail-left' | 'site-rail-right' | 'mobile-inline-promo', config: Partial<AdSlotConfig>): AdSlotConfig {
  const current = getAllAdSlots();
  const updated: AdSlotConfig = {
    ...DEFAULT_AD_SLOTS[slotId],
    ...current[slotId],
    ...config,
    slotId,
    updatedAt: new Date().toISOString()
  };

  current[slotId] = updated;

  try {
    localStorage.setItem(STORAGE_KEY_AD_SLOTS, JSON.stringify(current));
    // Dispatch custom window event so open components reactively update
    window.dispatchEvent(new CustomEvent('mindsparq-ads-updated', { detail: { slotId, updated } }));
  } catch (err) {
    console.error('[AdRailService] Failed to save ad slot config:', err);
  }

  return updated;
}

export function resetAdSlotsToDefault(): Record<string, AdSlotConfig> {
  try {
    localStorage.removeItem(STORAGE_KEY_AD_SLOTS);
    window.dispatchEvent(new CustomEvent('mindsparq-ads-updated', { detail: { reset: true } }));
  } catch {
    // ignore
  }
  return { ...DEFAULT_AD_SLOTS };
}
