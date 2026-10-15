import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Course, CourseModule, Lesson, Enrollment, LessonProgress } from '../types/database';
import { recordAuditLog } from './auditService';

/**
 * Strict YouTube Video ID Extractor & Allowlist Validator
 * Only allows valid YouTube video IDs (alphanumeric, underscores, hyphens)
 */
export function extractYouTubeVideoId(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle standard youtube.com/watch?v=...
  const watchMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  return null;
}

/**
 * Generates privacy-enhanced embed URL from a verified YouTube video ID
 */
export function getSafeYouTubeEmbedUrl(videoId: string): string {
  const safeId = extractYouTubeVideoId(videoId);
  if (!safeId) return '';
  return `https://www.youtube-nocookie.com/embed/${safeId}?rel=0&modestbranding=1`;
}

// ==========================================
// COURSES
// ==========================================

export async function getPublishedCourses(): Promise<Course[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .in('visibility', ['public', 'unlisted'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[MindSparQ Courses] Error fetching published courses:', error);
    return [];
  }

  return (data as Course[]) || [];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Course;
}

export async function getAllCourses(): Promise<Course[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[MindSparQ Courses] Error fetching all courses:', error);
    return [];
  }

  return (data as Course[]) || [];
}

export async function saveCourse(
  course: Partial<Course>
): Promise<{ data: Course | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  const isNew = !course.id;
  const payload = {
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    description: course.description,
    cover_image_url: course.cover_image_url || null,
    level: course.level || 'Beginner',
    estimated_duration: course.estimated_duration || null,
    visibility: course.visibility || 'public',
    access_type: 'free', // Strictly free courses for this release as specified
    status: course.status || 'draft',
    published_at: course.status === 'published' ? (course.published_at || new Date().toISOString()) : null,
    updated_at: new Date().toISOString()
  };

  if (isNew) {
    const { data, error } = await supabase
      .from('courses')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('course.create', 'courses', data.id, { title: data.title });
    }
    return { data: data as Course, error };
  } else {
    const { data, error } = await supabase
      .from('courses')
      .update(payload)
      .eq('id', course.id)
      .select()
      .single();

    if (!error && data) {
      await recordAuditLog('course.update', 'courses', data.id, { title: data.title });
    }
    return { data: data as Course, error };
  }
}

export async function deleteCourse(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (!error) {
    await recordAuditLog('course.delete', 'courses', id);
  }
  return { error };
}

// ==========================================
// MODULES & LESSONS
// ==========================================

export async function getCourseModulesWithLessons(courseId: string): Promise<CourseModule[]> {
  if (!isSupabaseConfigured) return [];

  const { data: modules, error: modErr } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true });

  if (modErr || !modules) {
    console.error('[MindSparQ Courses] Error fetching course modules:', modErr);
    return [];
  }

  const moduleIds = modules.map((m) => m.id);
  if (moduleIds.length === 0) return [];

  const { data: lessons, error: lessErr } = await supabase
    .from('lessons')
    .select('*')
    .in('module_id', moduleIds)
    .order('sort_order', { ascending: true });

  if (lessErr) {
    console.error('[MindSparQ Courses] Error fetching lessons:', lessErr);
    return modules as CourseModule[];
  }

  return modules.map((mod) => ({
    ...mod,
    lessons: (lessons as Lesson[]).filter((l) => l.module_id === mod.id)
  }));
}

export async function saveCourseModule(
  mod: Partial<CourseModule>
): Promise<{ data: CourseModule | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  const isNew = !mod.id;
  const payload = {
    course_id: mod.course_id,
    title: mod.title,
    description: mod.description || null,
    sort_order: mod.sort_order ?? 0,
    status: mod.status || 'published',
    updated_at: new Date().toISOString()
  };

  if (isNew) {
    const { data, error } = await supabase
      .from('course_modules')
      .insert([payload])
      .select()
      .single();
    return { data: data as CourseModule, error };
  } else {
    const { data, error } = await supabase
      .from('course_modules')
      .update(payload)
      .eq('id', mod.id)
      .select()
      .single();
    return { data: data as CourseModule, error };
  }
}

export async function deleteCourseModule(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) return { error: new Error('Supabase is not configured.') };
  const { error } = await supabase.from('course_modules').delete().eq('id', id);
  return { error };
}

export async function saveLesson(
  lesson: Partial<Lesson>
): Promise<{ data: Lesson | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  let validatedVideoId: string | null = null;
  let videoProvider: 'youtube' | 'vimeo' | null = null;

  if (lesson.lesson_type === 'video' && lesson.video_id) {
    validatedVideoId = extractYouTubeVideoId(lesson.video_id);
    if (!validatedVideoId) {
      return { data: null, error: new Error('Invalid YouTube video URL or ID. Only valid YouTube links are allowed.') };
    }
    videoProvider = 'youtube';
  }

  const isNew = !lesson.id;
  const payload = {
    module_id: lesson.module_id,
    title: lesson.title,
    slug: lesson.slug,
    lesson_type: lesson.lesson_type || 'article',
    body_text: lesson.body_text || null,
    video_provider: videoProvider,
    video_id: validatedVideoId,
    duration_minutes: lesson.duration_minutes || null,
    sort_order: lesson.sort_order ?? 0,
    status: lesson.status || 'published',
    updated_at: new Date().toISOString()
  };

  if (isNew) {
    const { data, error } = await supabase
      .from('lessons')
      .insert([payload])
      .select()
      .single();
    return { data: data as Lesson, error };
  } else {
    const { data, error } = await supabase
      .from('lessons')
      .update(payload)
      .eq('id', lesson.id)
      .select()
      .single();
    return { data: data as Lesson, error };
  }
}

export async function deleteLesson(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) return { error: new Error('Supabase is not configured.') };
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  return { error };
}

// ==========================================
// ENROLLMENT & PROGRESS
// ==========================================

export async function isUserEnrolled(courseId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .maybeSingle();

  return Boolean(data);
}

export async function enrollInCourse(courseId: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: new Error('Please sign in to enroll in this course.') };
  }

  const { error } = await supabase
    .from('enrollments')
    .insert([
      {
        course_id: courseId,
        user_id: user.id,
        status: 'active'
      }
    ]);

  if (!error) {
    await recordAuditLog('course.enroll', 'enrollments', courseId, { user_id: user.id });
  }

  return { error };
}

export async function getUserEnrollments(): Promise<Enrollment[]> {
  if (!isSupabaseConfigured) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('enrollments')
    .select('*, course:courses(*)')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false });

  if (error) {
    console.error('[MindSparQ Courses] Error fetching user enrollments:', error);
    return [];
  }

  return (data as Enrollment[]) || [];
}

export async function getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
  if (!isSupabaseConfigured) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('user_id', user.id)
    .maybeSingle();

  return (data as LessonProgress) || null;
}

export async function updateLessonProgress(
  lessonId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  lastPositionSeconds: number = 0
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: new Error('User not authenticated.') };
  }

  const { error } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        status,
        last_position_seconds: Math.max(0, Math.floor(lastPositionSeconds)),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,lesson_id' }
    );

  return { error };
}
