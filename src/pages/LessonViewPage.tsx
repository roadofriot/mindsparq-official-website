import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getCourseBySlug,
  getCourseModulesWithLessons,
  getSafeYouTubeEmbedUrl,
  getLessonProgress,
  updateLessonProgress
} from '../services/courseService';
import { Course, CourseModule, Lesson, LessonProgress } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, CheckCircle, Circle, PlayCircle, FileText, BookOpen, AlertTriangle } from 'lucide-react';

export const LessonViewPage: React.FC = () => {
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!courseSlug || !lessonSlug) return;

    setLoading(true);
    getCourseBySlug(courseSlug)
      .then(async (c) => {
        if (!mounted || !c) return;
        setCourse(c);

        const mods = await getCourseModulesWithLessons(c.id);
        if (!mounted) return;
        setModules(mods);

        // Find active lesson
        let foundLesson: Lesson | null = null;
        for (const m of mods) {
          const l = m.lessons?.find((less) => less.slug === lessonSlug);
          if (l) {
            foundLesson = l;
            break;
          }
        }

        if (foundLesson) {
          setCurrentLesson(foundLesson);
          if (user) {
            const prog = await getLessonProgress(foundLesson.id);
            if (mounted) setProgress(prog);
          }
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [courseSlug, lessonSlug, user]);

  const allLessons: Lesson[] = modules.flatMap((m) => m.lessons || []);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleToggleComplete = async () => {
    if (!currentLesson) return;
    setMarking(true);
    const newStatus = progress?.status === 'completed' ? 'in_progress' : 'completed';
    const { error } = await updateLessonProgress(currentLesson.id, newStatus);
    if (!error) {
      setProgress((prev) => ({
        id: prev?.id || 'temp',
        user_id: user?.id || '',
        lesson_id: currentLesson.id,
        status: newStatus,
        last_position_seconds: 0,
        updated_at: new Date().toISOString()
      }));
    }
    setMarking(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary-600)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>Lesson Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          The requested lesson could not be located in this course.
        </p>
        <Link to={`/courses/${courseSlug}`} className="btn btn-primary">
          Back to Course Overview
        </Link>
      </div>
    );
  }

  const isCompleted = progress?.status === 'completed';
  const embedUrl = currentLesson.video_id ? getSafeYouTubeEmbedUrl(currentLesson.video_id) : '';

  return (
    <div style={{ minHeight: 'calc(100vh - var(--header-height))', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <div
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-3) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)'
        }}
      >
        <Link
          to={`/courses/${course.slug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-sm)',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} />
          <span>{course.title}</span>
        </Link>

        {/* Complete Toggle Button */}
        <button
          onClick={handleToggleComplete}
          disabled={marking}
          className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--font-xs)',
            fontWeight: 600
          }}
        >
          {isCompleted ? (
            <>
              <CheckCircle size={16} color="#10b981" />
              <span>Completed</span>
            </>
          ) : (
            <>
              <Circle size={16} />
              <span>Mark as Complete</span>
            </>
          )}
        </button>
      </div>

      {/* Main Lesson Viewport with Sidebar Layout */}
      <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap' }}>
        {/* Content Area */}
        <div style={{ flex: '1 1 700px', padding: 'var(--space-6) var(--space-8)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1
              style={{
                fontSize: 'var(--font-3xl)',
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: 'var(--space-6)'
              }}
            >
              {currentLesson.title}
            </h1>

            {/* Video Player (Safe Allowlisted Embed) */}
            {currentLesson.lesson_type === 'video' && (
              <div style={{ marginBottom: 'var(--space-8)' }}>
                {embedUrl ? (
                  <div
                    style={{
                      position: 'relative',
                      paddingBottom: '56.25%', // 16:9 aspect ratio
                      height: 0,
                      borderRadius: 'var(--radius-xl)',
                      overflow: 'hidden',
                      backgroundColor: '#000000',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    <iframe
                      src={embedUrl}
                      title={currentLesson.title}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 0
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 'var(--space-6)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)'
                    }}
                  >
                    <AlertTriangle size={24} color="#ef4444" />
                    <span style={{ fontSize: 'var(--font-sm)', color: '#ef4444' }}>
                      Video unavailable or provider format not supported. Only verified YouTube videos are permitted.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Body Text */}
            {currentLesson.body_text && (
              <div
                style={{
                  fontSize: 'var(--font-base)',
                  lineHeight: 1.8,
                  color: 'var(--color-text)',
                  whiteSpace: 'pre-line',
                  marginBottom: 'var(--space-12)'
                }}
              >
                {currentLesson.body_text}
              </div>
            )}

            {/* Navigation Buttons: Previous / Next */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--color-border)',
                paddingTop: 'var(--space-6)',
                marginTop: 'var(--space-8)'
              }}
            >
              {prevLesson ? (
                <button
                  type="button"
                  onClick={() => navigate(`/courses/${course.slug}/lessons/${prevLesson.slug}`)}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                >
                  <ArrowLeft size={16} />
                  <span>Previous: {prevLesson.title}</span>
                </button>
              ) : <div />}

              {nextLesson && (
                <button
                  type="button"
                  onClick={() => navigate(`/courses/${course.slug}/lessons/${nextLesson.slug}`)}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                >
                  <span>Next: {nextLesson.title}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modules & Lessons Sidebar */}
        <div
          style={{
            flex: '0 0 340px',
            borderLeft: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--space-6)',
            maxHeight: 'calc(100vh - var(--header-height))',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <BookOpen size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--color-text)' }}>
              Course Navigation
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {modules.map((m, mIdx) => (
              <div key={m.id}>
                <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                  Module {mIdx + 1}: {m.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {m.lessons?.map((less) => {
                    const active = less.id === currentLesson.id;
                    return (
                      <Link
                        key={less.id}
                        to={`/courses/${course.slug}/lessons/${less.slug}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          padding: 'var(--space-2) var(--space-3)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: active ? 'var(--color-primary-50)' : 'transparent',
                          color: active ? 'var(--color-primary-600)' : 'var(--color-text)',
                          fontWeight: active ? 600 : 400,
                          fontSize: 'var(--font-xs)',
                          textDecoration: 'none'
                        }}
                      >
                        {less.lesson_type === 'video' ? <PlayCircle size={14} /> : <FileText size={14} />}
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {less.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
