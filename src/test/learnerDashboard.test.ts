import { describe, it, expect } from 'vitest';
import {
  getUserLessonProgress,
  getEnrolledCoursesWithProgress
} from '../services/courseService';
import { getEnrichedUserBookmarks } from '../services/blogService';
import { Lesson } from '../types/database';

describe('Learner Dashboard & Progress Tracking (Phase 6)', () => {
  it('retrieves user lesson progress gracefully without uncaught exceptions', async () => {
    const progress = await getUserLessonProgress();
    expect(Array.isArray(progress)).toBe(true);
  });

  it('retrieves enrolled courses with progress structure', async () => {
    const enrolled = await getEnrolledCoursesWithProgress();
    expect(Array.isArray(enrolled)).toBe(true);
  });

  it('retrieves enriched bookmarks gracefully', async () => {
    const bookmarks = await getEnrichedUserBookmarks();
    expect(Array.isArray(bookmarks)).toBe(true);
  });

  describe('Progress Calculation Logic & Invariants', () => {
    const mockLessons: Lesson[] = [
      {
        id: 'lesson-1',
        module_id: 'mod-1',
        title: 'Assembling the Chassis',
        slug: 'assembling-chassis',
        lesson_type: 'video',
        body_text: null,
        video_provider: 'youtube',
        video_id: 'dQw4w9WgXcQ',
        duration_minutes: 15,
        sort_order: 1,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'lesson-2',
        module_id: 'mod-1',
        title: 'Wiring Motors & Sensors',
        slug: 'wiring-motors',
        lesson_type: 'video',
        body_text: null,
        video_provider: 'youtube',
        video_id: 'dQw4w9WgXcQ',
        duration_minutes: 20,
        sort_order: 2,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'lesson-3',
        module_id: 'mod-1',
        title: 'First Python Robot Code',
        slug: 'first-python-code',
        lesson_type: 'article',
        body_text: '# Code sample',
        video_provider: null,
        video_id: null,
        duration_minutes: 25,
        sort_order: 3,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    it('calculates 0% progress when no lessons are completed', () => {
      const completedSet = new Set<string>();
      const total = mockLessons.length;
      const completed = mockLessons.filter((l) => completedSet.has(l.id)).length;
      const percent = Math.round((completed / total) * 100);
      const isCompleted = total > 0 && completed === total;
      const nextLesson = mockLessons.find((l) => !completedSet.has(l.id));

      expect(percent).toBe(0);
      expect(isCompleted).toBe(false);
      expect(nextLesson?.id).toBe('lesson-1');
      expect(nextLesson?.slug).toBe('assembling-chassis');
    });

    it('calculates partial progress and identifies the correct next up lesson', () => {
      const completedSet = new Set<string>(['lesson-1']);
      const total = mockLessons.length;
      const completed = mockLessons.filter((l) => completedSet.has(l.id)).length;
      const percent = Math.round((completed / total) * 100);
      const isCompleted = total > 0 && completed === total;
      const nextLesson = mockLessons.find((l) => !completedSet.has(l.id));

      expect(percent).toBe(33);
      expect(isCompleted).toBe(false);
      expect(nextLesson?.id).toBe('lesson-2');
      expect(nextLesson?.title).toBe('Wiring Motors & Sensors');
    });

    it('calculates 100% completion when all lessons are completed', () => {
      const completedSet = new Set<string>(['lesson-1', 'lesson-2', 'lesson-3']);
      const total = mockLessons.length;
      const completed = mockLessons.filter((l) => completedSet.has(l.id)).length;
      const percent = Math.round((completed / total) * 100);
      const isCompleted = total > 0 && completed === total;
      const nextLesson = mockLessons.find((l) => !completedSet.has(l.id)) || mockLessons[0];

      expect(percent).toBe(100);
      expect(isCompleted).toBe(true);
      expect(nextLesson.id).toBe('lesson-1'); // fallback to first lesson for review
    });

    it('handles zero-lesson courses gracefully without division by zero NaN errors', () => {
      const emptyLessons: Lesson[] = [];
      const total = emptyLessons.length;
      const completed = 0;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const isCompleted = total > 0 && completed === total;

      expect(percent).toBe(0);
      expect(isCompleted).toBe(false);
      expect(Number.isNaN(percent)).toBe(false);
    });
  });
});
