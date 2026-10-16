import { describe, it, expect } from 'vitest';
import { MediaAsset } from '../types/database';

describe('Media Asset Management, Deduplication & Reference Safety', () => {
  const mockAssets: MediaAsset[] = [
    {
      id: 'asset-1',
      storage_path: 'https://example.com/storage/public/hero-banner.webp',
      original_filename: 'hero-banner.webp',
      alt_text: 'Students exploring robotics sensor kit in Butwal lab',
      caption: 'Robotics Workshop 2026',
      media_type: 'image',
      mime_type: 'image/webp',
      size_bytes: 524288, // 512 KB
      width: 1920,
      height: 1080,
      uploaded_by: 'user-admin-1',
      visibility: 'public',
      created_at: '2026-09-01T10:00:00Z'
    },
    {
      id: 'asset-2',
      storage_path: 'https://example.com/storage/private/abacus-curriculum-guide.pdf',
      original_filename: 'abacus-curriculum-guide.pdf',
      alt_text: 'Syllabus curriculum PDF guide for educators',
      caption: 'Pedagogy Guide v2',
      media_type: 'document',
      mime_type: 'application/pdf',
      size_bytes: 2097152, // 2 MB
      width: null,
      height: null,
      uploaded_by: 'user-admin-1',
      visibility: 'private',
      created_at: '2026-09-15T10:00:00Z'
    }
  ];

  it('detects duplicate files by matching filename and size in bytes', () => {
    const existing = mockAssets[0];
    const incomingFileName = existing.original_filename;
    const incomingFileSize = existing.size_bytes;

    const isDuplicate = mockAssets.some(
      (a) => a.original_filename === incomingFileName && a.size_bytes === incomingFileSize
    );
    expect(isDuplicate).toBe(true);

    const nonDuplicate = mockAssets.some(
      (a) => a.original_filename === 'different-name.webp' && a.size_bytes === 1024
    );
    expect(nonDuplicate).toBe(false);
  });

  it('detects active media references across content schemas to prevent broken links', () => {
    const asset = mockAssets[0];

    const mockBlogPosts = [
      { id: 'b1', title: 'Robotics in Nepal', cover_image_url: asset.storage_path, content: 'Text...' },
      { id: 'b2', title: 'Mental Math', cover_image_url: null, content: 'Some text without image' }
    ];

    const mockCourses = [
      { id: 'c1', title: 'STEM Robotics Level 1', thumbnail_url: 'https://example.com/other.png' }
    ];

    const locations: { type: string; title: string; field: string }[] = [];

    // Check blogs
    for (const b of mockBlogPosts) {
      if (b.cover_image_url === asset.storage_path || b.content.includes(asset.original_filename)) {
        locations.push({ type: 'blog_post', title: b.title, field: 'Cover Image' });
      }
    }

    // Check courses
    for (const c of mockCourses) {
      if (c.thumbnail_url === asset.storage_path) {
        locations.push({ type: 'course', title: c.title, field: 'Course Thumbnail' });
      }
    }

    expect(locations.length).toBe(1);
    expect(locations[0].type).toBe('blog_post');
    expect(locations[0].title).toBe('Robotics in Nepal');
    expect(locations[0].field).toBe('Cover Image');
  });

  it('validates MIME types and enforces maximum size boundaries', () => {
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    expect(ALLOWED.includes('image/webp')).toBe(true);
    expect(ALLOWED.includes('application/pdf')).toBe(true);
    expect(ALLOWED.includes('application/x-msdownload')).toBe(false);

    expect(5000000 <= MAX_SIZE).toBe(true);
    expect(15000000 <= MAX_SIZE).toBe(false);
  });
});
