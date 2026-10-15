import { describe, it, expect } from 'vitest';
import { extractYouTubeVideoId, getSafeYouTubeEmbedUrl } from '../services/courseService';

describe('YouTube Video ID Validation & Privacy Embeds', () => {
  it('extracts raw 11-character video IDs', () => {
    expect(extractYouTubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('12345678901')).toBe('12345678901');
  });

  it('extracts video ID from standard youtube.com/watch?v= URLs', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ&feature=share')).toBe('dQw4w9WgXcQ');
  });

  it('extracts video ID from youtu.be shortlinks', () => {
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeVideoId('http://youtu.be/dQw4w9WgXcQ?t=10')).toBe('dQw4w9WgXcQ');
  });

  it('extracts video ID from embed links', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('rejects invalid or potentially malicious URLs', () => {
    expect(extractYouTubeVideoId('javascript:alert(1)')).toBeNull();
    expect(extractYouTubeVideoId('https://malicious-site.com/video.mp4')).toBeNull();
    expect(extractYouTubeVideoId('https://vimeo.com/123456')).toBeNull();
    expect(extractYouTubeVideoId('')).toBeNull();
    expect(extractYouTubeVideoId(null)).toBeNull();
  });

  it('generates privacy-enhanced embed URLs from valid IDs', () => {
    const embedUrl = getSafeYouTubeEmbedUrl('dQw4w9WgXcQ');
    expect(embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1');
  });

  it('returns empty string when generating embed for invalid input', () => {
    expect(getSafeYouTubeEmbedUrl('invalid-input')).toBe('');
  });
});
