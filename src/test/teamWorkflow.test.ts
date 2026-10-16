import { describe, it, expect } from 'vitest';
import { TeamProfile, BlogPost } from '../types/database';
import { VERIFIED_FOUNDER_PROFILE } from '../services/teamService';

describe('Team Profiles & Multi-Author Blog Governance Workflow', () => {
  const sampleProfiles: TeamProfile[] = [
    VERIFIED_FOUNDER_PROFILE,
    {
      id: 'profile-teacher-1',
      user_id: 'user-teacher-1',
      slug: 'aarav-sharma',
      display_name: 'Aarav Sharma',
      display_name_nepali: 'आरभ शर्मा',
      public_title: 'Senior Robotics Instructor',
      public_title_nepali: null,
      team_category: 'teaching',
      short_bio: 'Instructor specializing in microcontroller programming and sensor kits.',
      bio: 'Full biography of Aarav Sharma with extensive robotics teaching experience...',
      profile_image_path: null,
      education: 'B.Sc. Computer Science',
      qualifications: ['Certified STEM Educator', 'Arduino Specialist'],
      teaching_subjects: ['Python for Robotics', 'Physical Computing'],
      responsibilities: ['Robotics Curriculum Facilitator'],
      social_links: {
        linkedin: 'https://linkedin.com/in/aarav-sharma',
        github: 'https://github.com/aarav-sharma'
      },
      is_featured_founder: false,
      is_public: true,
      review_status: 'published',
      review_notes: null,
      sort_order: 2,
      submitted_at: '2026-10-15T00:00:00Z',
      reviewed_at: '2026-10-15T12:00:00Z',
      reviewed_by: 'admin-uuid',
      published_at: '2026-10-15T12:00:00Z',
      published_by: 'admin-uuid',
      created_at: '2026-10-15T00:00:00Z',
      updated_at: '2026-10-15T12:00:00Z'
    },
    {
      id: 'profile-draft-1',
      user_id: 'user-draft-1',
      slug: 'bina-thapa',
      display_name: 'Bina Thapa',
      display_name_nepali: null,
      public_title: 'Abacus Instructor Trainee',
      public_title_nepali: null,
      team_category: 'teaching',
      short_bio: 'Undergoing institutional abacus accreditation.',
      bio: 'Private trainee draft...',
      profile_image_path: null,
      education: 'B.Ed. Mathematics',
      qualifications: [],
      teaching_subjects: ['Soroban Level 1'],
      responsibilities: [],
      social_links: {},
      is_featured_founder: false,
      is_public: false,
      review_status: 'draft',
      review_notes: null,
      sort_order: 99,
      submitted_at: null,
      reviewed_at: null,
      reviewed_by: null,
      published_at: null,
      published_by: null,
      created_at: '2026-10-16T00:00:00Z',
      updated_at: '2026-10-16T00:00:00Z'
    },
    {
      id: 'profile-pending-1',
      user_id: 'user-pending-1',
      slug: 'chandan-joshi',
      display_name: 'Chandan Joshi',
      display_name_nepali: null,
      public_title: 'Vedic Math Specialist',
      public_title_nepali: null,
      team_category: 'teaching',
      short_bio: 'Submitted profile awaiting Super Admin review.',
      bio: 'Pedagogical specialist in rapid mental arithmetic calculations...',
      profile_image_path: null,
      education: 'M.Sc. Mathematics',
      qualifications: ['Vedic Math Certified Trainer'],
      teaching_subjects: ['Vedic Sutras', 'Speed Arithmetic'],
      responsibilities: [],
      social_links: {
        linkedin: 'https://linkedin.com/in/chandan-joshi'
      },
      is_featured_founder: false,
      is_public: false,
      review_status: 'pending_review',
      review_notes: null,
      sort_order: 10,
      submitted_at: '2026-10-16T10:00:00Z',
      reviewed_at: null,
      reviewed_by: null,
      published_at: null,
      published_by: null,
      created_at: '2026-10-16T08:00:00Z',
      updated_at: '2026-10-16T10:00:00Z'
    }
  ];

  it('1. Verifies Founder & CEO facts are strictly authentic and verified', () => {
    expect(VERIFIED_FOUNDER_PROFILE.display_name).toBe('Samay Budhathoki Chhetri');
    expect(VERIFIED_FOUNDER_PROFILE.display_name_nepali).toBe('समय बुढाथोकी क्षेत्री');
    expect(VERIFIED_FOUNDER_PROFILE.public_title).toBe('Founder & CEO');
    expect(VERIFIED_FOUNDER_PROFILE.slug).toBe('samay-budhathoki-chhetri');
    expect(VERIFIED_FOUNDER_PROFILE.is_featured_founder).toBe(true);
    expect(VERIFIED_FOUNDER_PROFILE.is_public).toBe(true);
    expect(VERIFIED_FOUNDER_PROFILE.review_status).toBe('published');

    // Research focus verification
    expect(VERIFIED_FOUNDER_PROFILE.bio).toContain('VAK-Based Teaching Strategies');
    expect(VERIFIED_FOUNDER_PROFILE.bio).toContain('Butwal Sub-Metropolitan City');
  });

  it('2. Enforces public isolation: only approved published profiles appear on public surfaces', () => {
    const publicProfiles = sampleProfiles.filter(
      (p) => p.is_public === true && p.review_status === 'published'
    );

    // Only Founder and approved teacher Aarav Sharma should be visible
    expect(publicProfiles.length).toBe(2);
    expect(publicProfiles.map((p) => p.slug)).toEqual([
      'samay-budhathoki-chhetri',
      'aarav-sharma'
    ]);

    // Drafts and pending submissions must NEVER leak to public
    expect(publicProfiles.find((p) => p.slug === 'bina-thapa')).toBeUndefined();
    expect(publicProfiles.find((p) => p.slug === 'chandan-joshi')).toBeUndefined();
  });

  it('3. Validates safe social link protocols (strictly https/http)', () => {
    const validateSocialUrl = (url: string): boolean => {
      if (!url) return false;
      return url.startsWith('https://') || url.startsWith('http://');
    };

    expect(validateSocialUrl('https://linkedin.com/in/aarav-sharma')).toBe(true);
    expect(validateSocialUrl('https://facebook.com/mindsparqeducation')).toBe(true);
    expect(validateSocialUrl('javascript:alert(1)')).toBe(false);
    expect(validateSocialUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(validateSocialUrl('file:///etc/passwd')).toBe(false);
  });

  it('4. Simulates editorial review state machine transitions', () => {
    type Action = 'submit' | 'request_changes' | 'approve' | 'unpublish';

    const transition = (
      currentStatus: TeamProfile['review_status'],
      action: Action
    ): { nextStatus: TeamProfile['review_status']; isPublic: boolean } => {
      switch (action) {
        case 'submit':
          if (currentStatus === 'draft' || currentStatus === 'changes_requested') {
            return { nextStatus: 'pending_review', isPublic: false };
          }
          break;
        case 'request_changes':
          if (currentStatus === 'pending_review') {
            return { nextStatus: 'changes_requested', isPublic: false };
          }
          break;
        case 'approve':
          if (currentStatus === 'pending_review' || currentStatus === 'changes_requested') {
            return { nextStatus: 'published', isPublic: true };
          }
          break;
        case 'unpublish':
          if (currentStatus === 'published') {
            return { nextStatus: 'unpublished', isPublic: false };
          }
          break;
      }
      return { nextStatus: currentStatus, isPublic: false };
    };

    // Draft submits for review
    const s1 = transition('draft', 'submit');
    expect(s1.nextStatus).toBe('pending_review');
    expect(s1.isPublic).toBe(false);

    // Reviewer requests changes with notes
    const s2 = transition(s1.nextStatus, 'request_changes');
    expect(s2.nextStatus).toBe('changes_requested');
    expect(s2.isPublic).toBe(false);

    // Staff author revises and resubmits
    const s3 = transition(s2.nextStatus, 'submit');
    expect(s3.nextStatus).toBe('pending_review');
    expect(s3.isPublic).toBe(false);

    // Reviewer approves and publishes live
    const s4 = transition(s3.nextStatus, 'approve');
    expect(s4.nextStatus).toBe('published');
    expect(s4.isPublic).toBe(true);

    // Super Admin unpublishes if staff leaves
    const s5 = transition(s4.nextStatus, 'unpublish');
    expect(s5.nextStatus).toBe('unpublished');
    expect(s5.isPublic).toBe(false);
  });

  it('5. Links published blog articles to author profile attribution', () => {
    const post: BlogPost = {
      id: 'blog-101',
      slug: 'future-of-coding-education',
      title: 'The Future of Coding Education',
      excerpt: 'Computational thinking for young students.',
      content: 'Article text...',
      cover_image_url: null,
      author_id: 'user-teacher-1',
      author_name: 'Aarav Sharma',
      author_profile_id: 'profile-teacher-1',
      category: 'Technology',
      status: 'published',
      published_at: '2026-10-15T00:00:00Z',
      created_at: '2026-10-14T00:00:00Z',
      updated_at: '2026-10-15T00:00:00Z'
    };

    // Match post to author profile
    const author = sampleProfiles.find((p) => p.id === post.author_profile_id);
    expect(author).toBeDefined();
    expect(author?.display_name).toBe('Aarav Sharma');
    expect(author?.slug).toBe('aarav-sharma');
    expect(author?.public_title).toBe('Senior Robotics Instructor');
  });
});
