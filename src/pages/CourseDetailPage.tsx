import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseBySlug, getCourseModulesWithLessons, isUserEnrolled, enrollInCourse } from '../services/courseService';
import { Course, CourseModule } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, BarChart3, CheckCircle2, PlayCircle, FileText, ArrowRight, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { updatePageSeo, generateCourseSchema, injectJsonLd, removeJsonLd } from '../utils/seo';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    if (!slug) return;

    getCourseBySlug(slug)
      .then(async (c) => {
        if (!mounted) return;
        if (c) {
          setCourse(c);

          updatePageSeo({
            title: c.title,
            description: c.summary || c.description,
            canonicalPath: `/courses/${c.slug}`,
            ogType: 'course',
            ogImage: c.cover_image_url || undefined
          });

          injectJsonLd(generateCourseSchema({
            title: c.title,
            description: c.summary || c.description,
            slug: c.slug,
            thumbnail_url: c.cover_image_url
          }), 'course-detail-jsonld');

          const mods = await getCourseModulesWithLessons(c.id);
          if (mounted) {
            setModules(mods);
            // Default open first module
            if (mods.length > 0) {
              setOpenModules({ [mods[0].id]: true });
            }
          }
          if (user) {
            const isEnr = await isUserEnrolled(c.id);
            if (mounted) setEnrolled(isEnr);
          }
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      removeJsonLd('course-detail-jsonld');
    };
  }, [slug, user]);

  const toggleModule = (id: string) => {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate(`/auth?returnUrl=/courses/${slug}`);
      return;
    }
    if (!course) return;

    setEnrolling(true);
    const { error } = await enrollInCourse(course.id);
    if (!error) {
      setEnrolled(true);
      // If there's a first lesson, navigate to it
      const firstLesson = modules[0]?.lessons?.[0];
      if (firstLesson) {
        navigate(`/courses/${course.slug}/lessons/${firstLesson.slug}`);
      }
    } else {
      alert('Enrollment error: ' + error.message);
    }
    setEnrolling(false);
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

  if (!course) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>Course Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          The requested course does not exist or may have been archived.
        </p>
        <Link to="/courses" className="btn btn-primary">
          Browse All Courses
        </Link>
      </div>
    );
  }

  const firstLesson = modules[0]?.lessons?.[0];

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Course Hero Header */}
      <section
        style={{
          padding: 'var(--space-16) 0 var(--space-12)',
          background: 'radial-gradient(circle at top right, rgba(14, 165, 233, 0.1), transparent 70%)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-8)' }}>
            <div style={{ maxWidth: '800px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-3)'
                }}
              >
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    fontSize: 'var(--font-xs)',
                    fontWeight: 700
                  }}
                >
                  FREE ACCESS
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
                  <BarChart3 size={16} /> {course.level}
                </span>
                {course.estimated_duration && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
                    <Clock size={16} /> {course.estimated_duration}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: 'var(--font-4xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-4)', lineHeight: 1.2 }}>
                {course.title}
              </h1>

              <p style={{ fontSize: 'var(--font-lg)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
                {course.summary}
              </p>

              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                {enrolled ? (
                  firstLesson ? (
                    <Link
                      to={`/courses/${course.slug}/lessons/${firstLesson.slug}`}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-6)' }}
                    >
                      <PlayCircle size={18} />
                      <span>Continue Learning</span>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: '#10b981', fontWeight: 600 }}>
                      <CheckCircle2 size={20} /> You are enrolled in this course
                    </div>
                  )
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-6)' }}
                  >
                    <BookOpen size={18} />
                    <span>{enrolling ? 'Enrolling...' : 'Enroll in Free Course'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Overview & Syllabus */}
      <section className="container" style={{ marginTop: 'var(--space-12)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-12)' }}>
          {/* Main: Curriculum Outline */}
          <div style={{ flex: '1 1 600px' }}>
            <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-6)' }}>
              Course Syllabus & Learning Modules
            </h2>

            {modules.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-8)',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                No modules have been published for this course yet. Check back soon!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {modules.map((mod, modIdx) => (
                  <div
                    key={mod.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-surface)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Module Header Bar */}
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-4) var(--space-5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
                          Module {modIdx + 1}
                        </span>
                        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', margin: '4px 0 0' }}>
                          {mod.title}
                        </h3>
                        {mod.description && (
                          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            {mod.description}
                          </p>
                        )}
                      </div>
                      {openModules[mod.id] ? <ChevronUp size={20} color="var(--color-text-secondary)" /> : <ChevronDown size={20} color="var(--color-text-secondary)" />}
                    </button>

                    {/* Lessons List inside module */}
                    {openModules[mod.id] && (
                      <div style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)' }}>
                        {mod.lessons && mod.lessons.length > 0 ? (
                          mod.lessons.map((lesson, lessIdx) => (
                            <div
                              key={lesson.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--space-3) var(--space-5)',
                                borderBottom: lessIdx < mod.lessons!.length - 1 ? '1px solid var(--color-border)' : 'none'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                {lesson.lesson_type === 'video' ? (
                                  <PlayCircle size={18} style={{ color: 'var(--color-primary-600)' }} />
                                ) : (
                                  <FileText size={18} style={{ color: 'var(--color-text-secondary)' }} />
                                )}
                                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)', fontWeight: 500 }}>
                                  {lesson.title}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                {lesson.duration_minutes && (
                                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                                    {lesson.duration_minutes} mins
                                  </span>
                                )}
                                {enrolled ? (
                                  <Link
                                    to={`/courses/${course.slug}/lessons/${lesson.slug}`}
                                    style={{
                                      fontSize: 'var(--font-xs)',
                                      fontWeight: 600,
                                      color: 'var(--color-primary-600)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '2px'
                                    }}
                                  >
                                    <span>Open</span>
                                    <ArrowRight size={14} />
                                  </Link>
                                ) : (
                                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                                    Enrolled only
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
                            Lessons coming soon.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Course Description & What You'll Learn */}
          <div style={{ maxWidth: '400px' }}>
            <div
              className="card"
              style={{
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-xl)',
                position: 'sticky',
                top: 'calc(var(--header-height) + 20px)'
              }}
            >
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
                About this Course
              </h3>
              <div
                style={{
                  fontSize: 'var(--font-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  marginBottom: 'var(--space-6)'
                }}
              >
                {course.description}
              </div>

              <div
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  gap: 'var(--space-3)'
                }}
              >
                <ShieldCheck size={24} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong>Verified Curriculum:</strong> Designed and reviewed by MindSparQ's educational faculty in Butwal, Nepal. Safe for all age groups.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
