import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Event } from '../types/database';
import { recordAuditLog } from './auditService';

export async function getPublishedEvents(): Promise<{ upcoming: Event[]; past: Event[] }> {
  if (!isSupabaseConfigured) {
    return { upcoming: [], past: [] };
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('[MindSparQ Events] Error fetching events:', error);
    return { upcoming: [], past: [] };
  }

  const now = new Date();
  const events = (data as Event[]) || [];

  const upcoming = events.filter((e) => new Date(e.starts_at) >= now);
  const past = events
    .filter((e) => new Date(e.starts_at) < now)
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

  return { upcoming, past };
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Event;
}

export async function getAllEvents(): Promise<Event[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: false });

  if (error) {
    console.error('[MindSparQ Events] Error fetching all events:', error);
    return [];
  }

  return (data as Event[]) || [];
}

export async function saveEvent(
  event: Partial<Event>
): Promise<{ data: Event | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  // Validate registration URL if present
  if (event.registration_url && !/^https?:\/\//i.test(event.registration_url)) {
    return { data: null, error: new Error('Registration URL must be a valid HTTP or HTTPS link.') };
  }

  const isNew = !event.id;
  const payload = {
    slug: event.slug,
    title: event.title,
    summary: event.summary,
    description: event.description,
    cover_image_url: event.cover_image_url || null,
    location_text: event.location_text,
    starts_at: event.starts_at,
    ends_at: event.ends_at || null,
    registration_url: event.registration_url || null,
    status: event.status || 'draft',
    updated_at: new Date().toISOString()
  };

  if (isNew) {
    const { data, error } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('event.create', 'events', data.id, { title: data.title });
    }
    return { data: data as Event, error };
  } else {
    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', event.id)
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('event.update', 'events', data.id, { title: data.title });
    }
    return { data: data as Event, error };
  }
}

export async function deleteEvent(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { error } = await supabase.from('events').delete().eq('id', id);
  if (!error) {
    await recordAuditLog('event.delete', 'events', id);
  }
  return { error };
}
