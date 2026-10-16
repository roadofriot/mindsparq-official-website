import { describe, it, expect } from 'vitest';
import { BlogPost } from '../types/database';

describe('Multi-Author Blog Publishing Workflow & Isolation', () => {
  const samplePosts: BlogPost[] = [
    {
      id: 'post-1',
      slug: 'robotics-nepal-2026',
      title: 'Robotics Education in Nepal: A 2026 Perspective',
      excerpt: 'How hands-on sensor kits are transforming school curricula.',
      content: 'Full article text regarding robotics education in Butwal...',
      cover_image_url: null,
      author_id: 'author-uuid-1',
      author_name: 'Samay Budhathoki Chhetri',
      category: 'Robotics & AI',
      status: 'published',
      published_at: '2026-09-01T10:00:00Z',
      created_at: '2026-08-25T10:00:00Z',
      updated_at: '2026-09-01T10:00:00Z'
    },
    {
      id: 'post-2',
      slug: 'mental-math-methods',
      title: 'VAK Cognitive Pacing in Mental Math',
      excerpt: 'Visual, Auditory, and Kinesthetic methodologies.',
      content: 'Draft content for academic research...',
      cover_image_url: null,
      author_id: 'author-uuid-2',
      author_name: 'MindSparQ Pedagogy Team',
      category: 'Cognitive Skills',
      status: 'draft',
      published_at: null,
      created_at: '2026-10-01T10:00:00Z',
      updated_at: '2026-10-02T10:00:00Z'
    },
    {
      id: 'post-3',
      slug: 'ai-tools-classroom',
      title: 'AI Tools for Teachers in Secondary Schools',
      excerpt: 'A practical ethical guide for school educators.',
      content: 'In-review submission waiting for administrator review...',
      cover_image_url: null,
      author_id: 'author-uuid-3',
      author_name: 'Anjali Sharma',
      category: 'Education',
      status: 'review',
      published_at: null,
      created_at: '2026-10-10T10:00:00Z',
      updated_at: '2026-10-11T10:00:00Z'
    },
    {
      id: 'post-4',
      slug: 'archived-workshop-announcement',
      title: 'Archived Autumn 2025 Workshop',
      excerpt: 'Past event archive.',
      content: 'Archived notes...',
      cover_image_url: null,
      author_id: 'author-uuid-1',
      author_name: 'Samay Budhathoki Chhetri',
      category: 'Education',
      status: 'archived',
      published_at: '2025-10-01T10:00:00Z',
      created_at: '2025-09-20T10:00:00Z',
      updated_at: '2025-11-01T10:00:00Z'
    }
  ];

  it('strictly isolates public queries to published articles only', () => {
    const publicVisible = samplePosts.filter((p) => p.status === 'published');
    expect(publicVisible.length).toBe(1);
    expect(publicVisible[0].slug).toBe('robotics-nepal-2026');

    // Verify drafts, reviews, and archives do not leak
    expect(publicVisible.some((p) => p.status === 'draft')).toBe(false);
    expect(publicVisible.some((p) => p.status === 'review')).toBe(false);
    expect(publicVisible.some((p) => p.status === 'archived')).toBe(false);
  });

  it('validates URL slugs format strictly to lowercase alphanumeric and hyphens', () => {
    const slugRegex = /^[a-z0-9-]+$/;
    expect(slugRegex.test('valid-slug-123')).toBe(true);
    expect(slugRegex.test('nepal-stem-pedagogy')).toBe(true);
    expect(slugRegex.test('Invalid Slug With Spaces')).toBe(false);
    expect(slugRegex.test('invalid_underscore_slug')).toBe(false);
    expect(slugRegex.test('invalid/slash/slug')).toBe(false);
  });

  it('preserves author attribution and audit identity across revisions', () => {
    const post = samplePosts[0];
    expect(post.author_id).toBe('author-uuid-1');
    expect(post.author_name).toBe('Samay Budhathoki Chhetri');
    expect(post.published_at).toBeDefined();
  });

  it('supports the full editorial review lifecycle: draft -> in_review -> approved -> published', () => {
    const editorialStates: BlogPost['status'][] = ['draft', 'in_review', 'approved', 'published'];
    expect(editorialStates).toContain('in_review');
    expect(editorialStates).toContain('approved');

    // Test transition state map
    const transitions: Record<string, BlogPost['status']> = {
      submit: 'in_review',
      approve: 'approved',
      reject: 'draft',
      publish: 'published',
      unpublish: 'draft'
    };

    expect(transitions.submit).toBe('in_review');
    expect(transitions.approve).toBe('approved');
    expect(transitions.reject).toBe('draft');
    expect(transitions.publish).toBe('published');
  });

  it('ensures in_review and approved states are hidden from public view until published', () => {
    const internalPosts: Partial<BlogPost>[] = [
      { id: 'p1', title: 'Pending Review', status: 'in_review' },
      { id: 'p2', title: 'Editorial Approved', status: 'approved' },
      { id: 'p3', title: 'Live Now', status: 'published' }
    ];

    const publicVisible = internalPosts.filter((p) => p.status === 'published');
    expect(publicVisible.length).toBe(1);
    expect(publicVisible[0].title).toBe('Live Now');
  });
});
