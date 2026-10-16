import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CarouselItem, Program } from '../types/database';
import { recordAuditLog } from './auditService';

// ==========================================
// CAROUSEL MANAGEMENT
// ==========================================

export const SLIDE_2_FALLBACK: CarouselItem = {
  id: 'mindsparq-innovation-banner-slide',
  title: 'MindSparQ Education & Technology',
  subtitle: 'Empowering Minds, Sparking Innovation in Coding, Robotics, AI & Drone Tech.',
  image_url: 'https://bhdcvdddngwtxdbhfeeg.supabase.co/storage/v1/object/public/public-media/public/2026/5af5bd64-1d5d-4a87-8579-422889ea2644_WhatsApp_Image_2026-09-22_at_4.jpeg',
  mobile_image_url: null,
  alt_text: 'MindSparQ Education & Technology - Empowering Minds, Sparking Innovation in AI, Coding, Robotics & Drone Technology',
  cta_label: 'Explore Programs',
  cta_url: '/programs',
  sort_order: 2,
  status: 'published',
  starts_at: null,
  ends_at: null,
  created_at: '2026-10-16T01:49:30.884Z',
  updated_at: '2026-10-16T01:49:30.884Z'
};

export async function getPublishedCarouselItems(): Promise<CarouselItem[]> {
  if (!isSupabaseConfigured) return [SLIDE_2_FALLBACK];

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('carousel_items')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error) {
    console.warn('[MindSparQ Content] Error fetching carousel slides:', error.message);
    return [SLIDE_2_FALLBACK];
  }

  // Filter starts_at / ends_at window client-side as well
  const published = ((data as CarouselItem[]) || []).filter((item) => {
    if (item.starts_at && item.starts_at > now) return false;
    if (item.ends_at && item.ends_at < now) return false;
    return true;
  });

  // Ensure both uploaded banners are active and cycling on the homepage
  const hasSlide2 = published.some((p) => p.image_url?.includes('5af5bd64'));
  if (!hasSlide2 && published.length > 0) {
    published.push(SLIDE_2_FALLBACK);
  }

  return published;
}

export async function getAllCarouselItems(): Promise<CarouselItem[]> {
  if (!isSupabaseConfigured) return [SLIDE_2_FALLBACK];

  const { data, error } = await supabase
    .from('carousel_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[MindSparQ Content] Error fetching all carousel slides:', error);
    return [SLIDE_2_FALLBACK];
  }

  const items = (data as CarouselItem[]) || [];
  const hasSlide2 = items.some((p) => p.image_url?.includes('5af5bd64'));
  if (!hasSlide2 && items.length > 0) {
    items.push(SLIDE_2_FALLBACK);
  }

  return items;
}

export async function saveCarouselItem(
  item: Partial<CarouselItem>
): Promise<{ data: CarouselItem | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Database connection not configured.') };
  }

  // Validate CTA URL scheme
  if (item.cta_url && !item.cta_url.startsWith('/') && !/^https?:\/\//i.test(item.cta_url)) {
    return { data: null, error: new Error('CTA URL must be a valid internal path (starting with /) or absolute HTTP/HTTPS URL.') };
  }

  const isNew = !item.id;
  const payload = {
    title: item.title,
    subtitle: item.subtitle || null,
    image_url: item.image_url,
    mobile_image_url: item.mobile_image_url || null,
    alt_text: item.alt_text,
    cta_label: item.cta_label || null,
    cta_url: item.cta_url || null,
    sort_order: item.sort_order ?? 0,
    status: item.status || 'draft',
    starts_at: item.starts_at || null,
    ends_at: item.ends_at || null,
    updated_at: new Date().toISOString()
  };

  if (isNew) {
    const { data, error } = await supabase
      .from('carousel_items')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('carousel.create', 'carousel_items', data.id, { title: data.title });
    }
    return { data: data as CarouselItem, error };
  } else {
    const { data, error } = await supabase
      .from('carousel_items')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('carousel.update', 'carousel_items', data.id, { title: data.title });
    }
    return { data: data as CarouselItem, error };
  }
}

export async function deleteCarouselItem(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Database connection not configured.') };
  }

  const { error } = await supabase.from('carousel_items').delete().eq('id', id);
  if (!error) {
    await recordAuditLog('carousel.delete', 'carousel_items', id);
  }
  return { error };
}

// ==========================================
// PROGRAMS MANAGEMENT
// ==========================================

export async function getPublishedPrograms(): Promise<Program[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error) {
    console.warn('[MindSparQ Content] Error fetching programs:', error.message);
    return [];
  }

  return (data as Program[]) || [];
}

export async function getAllPrograms(): Promise<Program[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[MindSparQ Content] Error fetching all programs:', error);
    return [];
  }

  return (data as Program[]) || [];
}

export async function saveProgram(
  program: Partial<Program>
): Promise<{ data: Program | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Database connection not configured.') };
  }

  const isNew = !program.id;
  const payload = {
    slug: program.slug,
    title: program.title,
    summary: program.summary,
    description: program.description,
    audience: program.audience || null,
    icon_name: program.icon_name || null,
    cover_image_url: program.cover_image_url || null,
    sort_order: program.sort_order ?? 0,
    status: program.status || 'draft',
    updated_at: new Date().toISOString()
  };

  if (isNew) {
    const { data, error } = await supabase
      .from('programs')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('program.create', 'programs', data.id, { title: data.title });
    }
    return { data: data as Program, error };
  } else {
    const { data, error } = await supabase
      .from('programs')
      .update(payload)
      .eq('id', program.id)
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('program.update', 'programs', data.id, { title: data.title });
    }
    return { data: data as Program, error };
  }
}

export async function deleteProgram(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Database connection not configured.') };
  }

  const { error } = await supabase.from('programs').delete().eq('id', id);
  if (!error) {
    await recordAuditLog('program.delete', 'programs', id);
  }
  return { error };
}
