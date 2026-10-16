import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TeamProfile, BlogPost } from '../types/database';
import { recordAuditLog } from './auditService';

// Verified Founder & CEO baseline fallback
export const VERIFIED_FOUNDER_PROFILE: TeamProfile = {
  id: 'founder-samay-budhathoki-chhetri',
  user_id: null,
  slug: 'samay-budhathoki-chhetri',
  display_name: 'Samay Budhathoki Chhetri',
  display_name_nepali: 'समय बुढाथोकी क्षेत्री',
  public_title: 'Founder & CEO',
  public_title_nepali: 'संस्थापक तथा प्रमुख कार्यकारी अधिकृत',
  team_category: 'leadership',
  short_bio: 'Founder and Chief Executive Officer of MindSparQ Education & Technology. Spearheading the fusion of foundational cognitive development (Abacus, Mental Math) with applied AI, coding, and robotics education across Nepal.',
  bio: `Samay Budhathoki Chhetri (also known as Sonu Chhetri) is an educational innovator, curriculum developer, and the Founder & CEO of MindSparQ Education & Technology, based in Butwal-11, Gyanbhoomi Path, Rupandehi, Nepal.

His academic research investigates "The Effectiveness of VAK-Based Teaching Strategies in Enhancing Learning Outcomes Among Secondary School Students in Butwal Sub-Metropolitan City, Nepal." He champions an evidence-backed pedagogy uniting multimodal tactile and visual learning with 21st-century technological tools.

Under his leadership, MindSparQ has developed structured training frameworks for schools, educators, and young learners, emphasizing computational thinking, ethical artificial intelligence, hands-on robotics, and cognitive agility.`,
  profile_image_path: null,
  education: 'Master of Education / Educational Research',
  qualifications: [
    'Certified Abacus Master Trainer',
    'VAK Pedagogical Researcher',
    'STEM & Robotics Curriculum Developer'
  ],
  teaching_subjects: [
    'Abacus & Mental Arithmetic',
    'Vedic Mathematics',
    'AI & Computational Thinking',
    'Educational Methodology'
  ],
  responsibilities: [
    'Institutional Leadership & Strategy',
    'Curriculum Rigor & Pedagogical Research',
    'School & Institutional Partnerships',
    'Teacher Empowerment Programs'
  ],
  social_links: {
    facebook: 'https://facebook.com/mindsparqeducation',
    instagram: 'https://instagram.com/mindsparqeducation',
    linkedin: 'https://linkedin.com/company/mindsparqeducation',
    youtube: 'https://youtube.com/@mindsparqeducation'
  },
  is_featured_founder: true,
  is_public: true,
  review_status: 'published',
  review_notes: null,
  sort_order: 1,
  submitted_at: '2026-10-16T00:00:00Z',
  reviewed_at: '2026-10-16T00:00:00Z',
  reviewed_by: null,
  published_at: '2026-10-16T00:00:00Z',
  published_by: null,
  created_at: '2026-10-16T00:00:00Z',
  updated_at: '2026-10-16T00:00:00Z'
};

/**
 * Fetch all approved and publicly published team profiles
 */
export async function getPublicTeamProfiles(): Promise<TeamProfile[]> {
  if (!isSupabaseConfigured) {
    return [VERIFIED_FOUNDER_PROFILE];
  }

  try {
    const { data, error } = await supabase
      .from('team_profiles')
      .select('*')
      .eq('is_public', true)
      .eq('review_status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[MindSparQ Team] Database error fetching team profiles, using fallback:', error.message);
      return [VERIFIED_FOUNDER_PROFILE];
    }

    if (!data || data.length === 0) {
      return [VERIFIED_FOUNDER_PROFILE];
    }

    return data as TeamProfile[];
  } catch (err) {
    console.error('[MindSparQ Team] Unexpected error in getPublicTeamProfiles:', err);
    return [VERIFIED_FOUNDER_PROFILE];
  }
}

/**
 * Fetch an approved team profile by slug, including their published articles
 */
export async function getTeamProfileBySlug(slug: string): Promise<{ profile: TeamProfile | null; posts: BlogPost[] }> {
  if (slug === VERIFIED_FOUNDER_PROFILE.slug && !isSupabaseConfigured) {
    return { profile: VERIFIED_FOUNDER_PROFILE, posts: [] };
  }

  if (!isSupabaseConfigured) {
    return { profile: null, posts: [] };
  }

  try {
    const { data, error } = await supabase
      .from('team_profiles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      if (slug === VERIFIED_FOUNDER_PROFILE.slug) {
        return { profile: VERIFIED_FOUNDER_PROFILE, posts: [] };
      }
      return { profile: null, posts: [] };
    }

    const profile = data as TeamProfile;

    // Fetch published articles authored by this profile
    const { data: postsData } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .or(`author_profile_id.eq.${profile.id},author_name.ilike.%${profile.display_name}%`)
      .order('published_at', { ascending: false });

    return {
      profile,
      posts: (postsData as BlogPost[]) || []
    };
  } catch (err) {
    console.error('[MindSparQ Team] Error fetching profile by slug:', err);
    if (slug === VERIFIED_FOUNDER_PROFILE.slug) {
      return { profile: VERIFIED_FOUNDER_PROFILE, posts: [] };
    }
    return { profile: null, posts: [] };
  }
}

/**
 * Fetch all profiles across review statuses (Admin / Reviewer queue)
 */
export async function getAllTeamProfiles(): Promise<TeamProfile[]> {
  if (!isSupabaseConfigured) {
    return [VERIFIED_FOUNDER_PROFILE];
  }

  try {
    const { data, error } = await supabase
      .from('team_profiles')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[MindSparQ Team] Error fetching all profiles:', error.message);
      return [VERIFIED_FOUNDER_PROFILE];
    }

    return (data as TeamProfile[]) || [];
  } catch (err) {
    console.error('[MindSparQ Team] Error in getAllTeamProfiles:', err);
    return [VERIFIED_FOUNDER_PROFILE];
  }
}

/**
 * Fetch current user's staff profile
 */
export async function getMyTeamProfile(userId: string): Promise<TeamProfile | null> {
  if (!isSupabaseConfigured || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('team_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[MindSparQ Team] Error loading my profile:', error.message);
      return null;
    }

    return (data as TeamProfile) || null;
  } catch (err) {
    console.error('[MindSparQ Team] Error in getMyTeamProfile:', err);
    return null;
  }
}

/**
 * Save or update team profile draft (Staff editing permitted fields)
 */
export async function saveTeamProfileDraft(
  profile: Partial<TeamProfile>,
  userId?: string
): Promise<{ data: TeamProfile | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const isNew = !profile.id;

    // Validate slug formatting
    const rawSlug = profile.slug || profile.display_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';
    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '');

    const payload = {
      ...profile,
      slug: cleanSlug,
      user_id: profile.user_id || userId || null,
      updated_at: new Date().toISOString()
    };

    if (isNew) {
      payload.created_at = new Date().toISOString();
      payload.review_status = payload.review_status || 'draft';
      payload.is_public = false; // Initial drafts cannot be public without approval

      const { data, error } = await supabase
        .from('team_profiles')
        .insert(payload)
        .select()
        .single();

      if (error) return { data: null, error: new Error(error.message) };

      await recordAuditLog(
        'CREATE_TEAM_PROFILE_DRAFT',
        'team_profile',
        data.id,
        { display_name: data.display_name, slug: data.slug }
      );

      return { data: data as TeamProfile, error: null };
    } else {
      const { data, error } = await supabase
        .from('team_profiles')
        .update(payload)
        .eq('id', profile.id!)
        .select()
        .single();

      if (error) return { data: null, error: new Error(error.message) };

      await recordAuditLog(
        'UPDATE_TEAM_PROFILE_DRAFT',
        'team_profile',
        profile.id!,
        { display_name: data.display_name }
      );

      return { data: data as TeamProfile, error: null };
    }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error saving draft') };
  }
}

/**
 * Staff submits profile draft for Super Admin review
 */
export async function submitProfileForReview(profileId: string): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('team_profiles')
      .update({
        review_status: 'pending_review',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (error) return { success: false, error: new Error(error.message) };

    await recordAuditLog(
      'SUBMIT_TEAM_PROFILE_REVIEW',
      'team_profile',
      profileId,
      { review_status: 'pending_review' }
    );

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Error submitting review') };
  }
}

/**
 * Super Admin / Reviewer action on a profile
 */
export async function reviewTeamProfile(
  profileId: string,
  action: 'approve' | 'request_changes' | 'publish' | 'unpublish',
  reviewerUserId: string,
  notes?: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    let updateFields: Partial<TeamProfile> = {
      updated_at: new Date().toISOString()
    };

    if (action === 'approve' || action === 'publish') {
      updateFields = {
        ...updateFields,
        is_public: true,
        review_status: 'published',
        published_at: new Date().toISOString(),
        published_by: reviewerUserId,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerUserId,
        review_notes: notes || null
      };
    } else if (action === 'request_changes') {
      updateFields = {
        ...updateFields,
        review_status: 'changes_requested',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerUserId,
        review_notes: notes || 'Changes requested by editorial administrator.'
      };
    } else if (action === 'unpublish') {
      updateFields = {
        ...updateFields,
        is_public: false,
        review_status: 'unpublished',
        review_notes: notes || null
      };
    }

    const { error } = await supabase
      .from('team_profiles')
      .update(updateFields)
      .eq('id', profileId);

    if (error) return { success: false, error: new Error(error.message) };

    await recordAuditLog(
      `REVIEW_PROFILE_${action.toUpperCase()}`,
      'team_profile',
      profileId,
      { action, notes, reviewerUserId }
    );

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Error reviewing profile') };
  }
}

/**
 * Delete a profile (Super Admin action)
 */
export async function deleteTeamProfile(profileId: string): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('team_profiles')
      .delete()
      .eq('id', profileId);

    if (error) return { success: false, error: new Error(error.message) };

    await recordAuditLog(
      'DELETE_TEAM_PROFILE',
      'team_profile',
      profileId,
      {}
    );

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Error deleting profile') };
  }
}
