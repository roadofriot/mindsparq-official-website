import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedCourses } from '../services/courseService';
import { Course } from '../types/database';
import { BookOpen, Clock, BarChart3, Search, Sparkles, ArrowRight } from 'lucide-react';
import { updatePageSeo } from '../utils/seo';

// Fallback seed courses if database is not yet populated
const FALLBACK_COURSES: Course[] = [
  {
    id: 'fallback-course-1',
    slug: 'foundations-of-robotics-and-computational-thinking',
    title: 'Foundations of Robotics & Computational Thinking',
    summary: 'A beginner-friendly practical introduction to the fundamental logic behind sensors, algorithms, and interactive hardware.',
    description: 'Explore what makes a machine a robot and understand the loop of Sense, Think, Act with project-based examples.',
    cover_image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    level: 'Beginner',
    estimated_duration: '4 Weeks (Self-paced)',
    visibility: 'public',
    access_type: 'free',
    status: 'published',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fallback-course-2',
    slug: 'mental-arithmetic-and-abacus-speed-mastery',
    title: 'Mental Arithmetic & Abacus Speed Mastery',
    summary: 'Accelerate your calculation reflexes from physical bead manipulation to high-speed visual mental math (Anzan).',
    description: 'Learn rapid whole-brain calculation strategies that cultivate deep numerical intuition and lasting academic confidence.',
    cover_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    level: 'All Levels',
    estimated_duration: '6 Weeks (Self-paced)',
    visibility: 'public',
    access_type: 'free',
    status: 'published',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');

  useEffect(() => {
    updatePageSeo({
      title: 'Course Catalog & Curriculum Tracks',
      description: 'Hands-on curriculum tracks in robotics, AI ethics, abacus speed arithmetic, and foundational programming in Nepal.',
      canonicalPath: '/courses',
      ogType: 'website'
    });

    let mounted = true;
    getPublishedCourses()
      .then((data) => {
        if (!mounted) return;
        if (data && data.length > 0) {
          setCourses(data);
        } else {
          setCourses(FALLBACK_COURSES);
        }
      })
      .catch(() => {
        if (mounted) setCourses(FALLBACK_COURSES);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
    const matchesAge =
      selectedAgeGroup === 'all' ||
      !c.age_group ||
      c.age_group === selectedAgeGroup ||
      c.age_group === 'all_ages';

    return matchesSearch && matchesLevel && matchesAge;
  });

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Header Banner */}
      <section
        style={{
          padding: 'var(--space-16) 0 var(--space-12)',
          background: 'radial-gradient(ellipse at top, rgba(14, 165, 233, 0.12), transparent 70%)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-3)'
            }}
          >
            <Sparkles size={14} /> Learning Platform
          </div>
          <h1 style={{ fontSize: 'var(--font-4xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
            Course Catalog & Learning Modules
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-lg)', lineHeight: 1.6 }}>
            Explore verified, structured curricula in Robotics, Mental Math, Vedic Math, and Applied AI. Free enrollment with tracked lesson progression.
          </p>
        </div>
      </section>

      {/* Pill-Style Search & Level Filter Bar */}
      <section className="container" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Search Input with Icon */}
          <div style={{ position: 'relative', flex: '1 1 320px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search courses by topic, skill, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 16px 0 46px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Level Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>
              Level:
            </span>
            {['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((level) => {
              const isSelected = selectedLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  style={{
                    padding: '7px 18px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: isSelected ? '#2563eb' : 'var(--color-border)',
                    backgroundColor: isSelected ? '#2563eb' : 'var(--color-surface-elevated)',
                    color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    boxShadow: isSelected ? '0 2px 10px rgba(37, 99, 235, 0.35)' : 'none'
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>

          {/* Age Group Filter Row */}
          <div style={{ width: '100%', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>
              Target Age:
            </span>
            {[
              { id: 'all', label: 'All Age Groups' },
              { id: 'elementary', label: '🎒 Elementary (Ages 6-10)' },
              { id: 'middle_school', label: '🚀 Middle School (Ages 11-14)' },
              { id: 'high_school', label: '⚡ High School (Ages 15+)' }
            ].map((group) => {
              const isSelected = selectedAgeGroup === group.id;
              return (
                <button
                  key={group.id}
                  id={`filter-age-${group.id}`}
                  onClick={() => setSelectedAgeGroup(group.id)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-primary-600)' : 'var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-50)' : 'var(--color-surface-elevated)',
                    color: isSelected ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--color-border)',
                borderTopColor: 'var(--color-primary-600)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto var(--space-4)'
              }}
            />
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading course catalog...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-16) var(--space-4)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)'
            }}
          >
            <BookOpen size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
              No matching courses found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Try adjusting your search criteria or resetting filters.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedLevel('All'); setSelectedAgeGroup('all'); }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                }}
              >
                {/* Cover Image */}
                <div style={{ position: 'relative', height: '200px', backgroundColor: 'var(--color-surface-hover)' }}>
                  {course.cover_image_url ? (
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                      <BookOpen size={48} />
                    </div>
                  )}
                  {/* Badges */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(16, 185, 129, 0.9)',
                        color: '#ffffff',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 700,
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      FREE ENROLLMENT
                    </span>
                    {course.age_group && course.age_group !== 'all_ages' && (
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(14, 165, 233, 0.9)',
                          color: '#ffffff',
                          fontSize: 'var(--font-xs)',
                          fontWeight: 700,
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        {course.age_group === 'elementary'
                          ? 'Ages 6-10'
                          : course.age_group === 'middle_school'
                          ? 'Ages 11-14'
                          : 'Ages 15+'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Metadata */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      fontSize: 'var(--font-xs)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-3)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BarChart3 size={14} /> {course.level}
                    </span>
                    {course.estimated_duration && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {course.estimated_duration}
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: 'var(--font-xl)',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      marginBottom: 'var(--space-2)',
                      lineHeight: 1.3
                    }}
                  >
                    {course.title}
                  </h3>

                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--font-sm)',
                      lineHeight: 1.6,
                      marginBottom: 'var(--space-6)',
                      flex: 1
                    }}
                  >
                    {course.summary}
                  </p>

                  <Link
                    to={`/courses/${course.slug}`}
                    className="btn btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--space-2)',
                      width: '100%',
                      padding: 'var(--space-3)'
                    }}
                  >
                    <span>View Curriculum</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
