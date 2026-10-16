import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getEnrolledCoursesWithProgress,
  EnrolledCourseProgress
} from '../services/courseService';
import {
  getEnrichedUserBookmarks,
  toggleBookmark,
  EnrichedBookmark
} from '../services/blogService';
import { updateOwnProfile } from '../services/userService';
import {
  BookOpen,
  Bookmark as BookmarkIcon,
  User,
  ArrowRight,
  CheckCircle2,
  Shield,
  LogOut,
  Trophy,
  PlayCircle,
  Compass,
  Clock,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  Tag,
  Award,
  Video,
  FileText
} from 'lucide-react';

const INTEREST_OPTIONS = [
  'Artificial Intelligence & ML',
  'Robotics & Scratch Programming',
  'Python for Beginners',
  'Full-Stack Web Development',
  'STEM & Maker Innovations',
  'Data Science & Analytics',
  'Mobile App Design'
];

const AVATAR_PRESETS = [
  { id: 'robot', label: 'Robo Bot', emoji: '🤖', bg: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' },
  { id: 'rocket', label: 'Rocket', emoji: '🚀', bg: 'linear-gradient(135deg, #f97316, #fb923c)' },
  { id: 'spark', label: 'Genius', emoji: '⚡', bg: 'linear-gradient(135deg, #eab308, #fde047)' },
  { id: 'code', label: 'Coder', emoji: '💻', bg: 'linear-gradient(135deg, #10b981, #34d399)' },
  { id: 'scholar', label: 'Scholar', emoji: '🎓', bg: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  { id: 'star', label: 'Pioneer', emoji: '🌟', bg: 'linear-gradient(135deg, #ec4899, #f472b6)' }
];

export const LearnerDashboardPage: React.FC = () => {
  const { user, profile, roles, isStaff, signOut, refreshProfile } = useAuth();
  const [coursesProgress, setCoursesProgress] = useState<EnrolledCourseProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<EnrichedBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'courses' | 'bookmarks' | 'profile'>('courses');
  const [courseFilter, setCourseFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Profile Form
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(profile?.avatar_path || 'robot');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Load initial profile & interests
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      if (profile.avatar_path) {
        if (AVATAR_PRESETS.some((p) => p.id === profile.avatar_path)) {
          setSelectedAvatar(profile.avatar_path);
        } else {
          setSelectedAvatar('custom');
          setCustomAvatarUrl(profile.avatar_path);
        }
      }
    }
    // Load local stored interests if any
    try {
      const stored = localStorage.getItem(`mindsparq_interests_${user?.id}`);
      if (stored) {
        setSelectedInterests(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load interests:', e);
    }
  }, [profile, user?.id]);

  // Load enrolled courses with progress & enriched bookmarks
  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [progressData, bookmarksData] = await Promise.all([
          getEnrolledCoursesWithProgress(),
          getEnrichedUserBookmarks()
        ]);

        if (mounted) {
          setCoursesProgress(progressData);
          setBookmarks(bookmarksData);
        }
      } catch (err) {
        console.error('[MindSparQ Learner] Error loading dashboard data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleInterest = (tag: string) => {
    setSelectedInterests((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      if (user?.id) {
        try {
          localStorage.setItem(`mindsparq_interests_${user.id}`, JSON.stringify(next));
        } catch (e) {
          console.warn('Could not save interests:', e);
        }
      }
      return next;
    });
  };

  const handleRemoveBookmark = async (b: EnrichedBookmark) => {
    const { error } = await toggleBookmark(b.bookmark.target_type, b.bookmark.target_id);
    if (!error) {
      setBookmarks((prev) => prev.filter((item) => item.bookmark.id !== b.bookmark.id));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    const finalAvatar = selectedAvatar === 'custom' ? customAvatarUrl.trim() : selectedAvatar;
    const { error } = await updateOwnProfile(displayName, bio, finalAvatar || undefined);

    if (!error) {
      await refreshProfile();
      setProfileMsg({ text: 'Profile updated successfully!', isError: false });
    } else {
      setProfileMsg({ text: 'Failed to update profile: ' + error.message, isError: true });
    }
    setSavingProfile(false);
  };

  // Metrics calculation
  const totalCourses = coursesProgress.length;
  const completedCourses = coursesProgress.filter((c) => c.isCompleted).length;
  const totalLessonsCompleted = coursesProgress.reduce((sum, c) => sum + c.completedLessons, 0);
  const totalLessonsAcrossCourses = coursesProgress.reduce((sum, c) => sum + c.totalLessons, 0);
  const overallProgressPercent = totalLessonsAcrossCourses > 0
    ? Math.round((totalLessonsCompleted / totalLessonsAcrossCourses) * 100)
    : 0;

  // Filtered courses
  const filteredCourses = coursesProgress.filter((cp) => {
    if (courseFilter === 'in_progress') return !cp.isCompleted;
    if (courseFilter === 'completed') return cp.isCompleted;
    return true;
  });

  return (
    <div style={{ paddingBottom: 'var(--space-20)', minHeight: '80vh' }}>
      {/* Header Banner */}
      <section
        style={{
          padding: 'var(--space-12) 0 var(--space-8)',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 100%)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              {/* Avatar circle */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  background: AVATAR_PRESETS.find((a) => a.id === selectedAvatar)?.bg || 'var(--color-primary-600)',
                  boxShadow: '0 8px 24px -4px rgba(14, 165, 233, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {selectedAvatar === 'custom' && customAvatarUrl ? (
                  <img
                    src={customAvatarUrl}
                    alt={displayName}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  AVATAR_PRESETS.find((a) => a.id === selectedAvatar)?.emoji || '🎓'
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-primary-50)',
                      color: 'var(--color-primary-600)',
                      fontSize: 'var(--font-xs)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Learner Portal
                  </span>
                  {isStaff && (
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        color: '#d97706',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 700
                      }}
                    >
                      Staff Privileges Active
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-text)', margin: '4px 0' }}>
                  Welcome back, {profile?.display_name || user?.email?.split('@')[0]}!
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', margin: 0 }}>
                  {user?.email} • Student ID: {user?.id.slice(0, 8)} • Member since {new Date(profile?.created_at || Date.now()).getFullYear()}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <Link
                to="/courses"
                id="learner-browse-catalog-btn"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <Compass size={16} /> Course Catalog
              </Link>
              {isStaff && (
                <Link
                  to="/admin"
                  id="learner-admin-console-btn"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                >
                  <Shield size={16} /> Admin Console
                </Link>
              )}
              <button
                onClick={() => signOut()}
                id="learner-sign-out-btn"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              marginTop: 'var(--space-8)'
            }}
          >
            <div
              className="card"
              style={{
                padding: 'var(--space-4) var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(14, 165, 233, 0.12)',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BookOpen size={22} />
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Enrolled Courses
                </span>
                <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
                  {totalCourses}
                </div>
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: 'var(--space-4) var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Lessons Completed
                </span>
                <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
                  {totalLessonsCompleted}
                </div>
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: 'var(--space-4) var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(234, 179, 8, 0.12)',
                  color: '#eab308',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trophy size={22} />
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Completed Courses
                </span>
                <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
                  {completedCourses}
                </div>
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: 'var(--space-4) var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(139, 92, 246, 0.12)',
                  color: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BookmarkIcon size={22} />
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Saved Items
                </span>
                <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
                  {bookmarks.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <div className="container" style={{ marginTop: 'var(--space-8)' }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 'var(--space-2)',
            marginBottom: 'var(--space-6)'
          }}
        >
          <button
            id="tab-btn-courses"
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <BookOpen size={16} /> My Courses & Learning Journey
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeTab === 'courses' ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-hover)',
                fontSize: 'var(--font-xs)'
              }}
            >
              {totalCourses}
            </span>
          </button>

          <button
            id="tab-btn-bookmarks"
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`btn ${activeTab === 'bookmarks' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <BookmarkIcon size={16} /> Saved Articles & Bookmarks
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeTab === 'bookmarks' ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-hover)',
                fontSize: 'var(--font-xs)'
              }}
            >
              {bookmarks.length}
            </span>
          </button>

          <button
            id="tab-btn-profile"
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <User size={16} /> Profile & Interests
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: COURSES & PROGRESS */}
        {/* ============================================================== */}
        {activeTab === 'courses' && (
          <div>
            {/* Filter Pills */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)'
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {(['all', 'in_progress', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    id={`filter-${f}-courses-btn`}
                    type="button"
                    onClick={() => setCourseFilter(f)}
                    style={{
                      padding: 'var(--space-1) var(--space-4)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid',
                      borderColor: courseFilter === f ? 'var(--color-primary-600)' : 'var(--color-border)',
                      backgroundColor: courseFilter === f ? 'var(--color-primary-50)' : 'transparent',
                      color: courseFilter === f ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                      fontSize: 'var(--font-xs)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {f === 'all' ? 'All Enrolled' : f.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {totalCourses > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                  <span>Overall Curriculum Mastery:</span>
                  <div style={{ width: '100px', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${overallProgressPercent}%`,
                        height: '100%',
                        backgroundColor: '#10b981',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  </div>
                  <strong style={{ color: 'var(--color-text)' }}>{overallProgressPercent}%</strong>
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '3px solid var(--color-border)',
                    borderTopColor: 'var(--color-primary-600)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto var(--space-3)'
                  }}
                />
                <p style={{ color: 'var(--color-text-secondary)' }}>Loading your courses and lesson progress...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: 'var(--space-12) var(--space-6)',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                <BookOpen size={48} style={{ color: 'var(--color-primary-600)', margin: '0 auto var(--space-4)', opacity: 0.6 }} />
                <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                  {courseFilter === 'all'
                    ? 'You have not enrolled in any courses yet'
                    : `No courses currently ${courseFilter.replace('_', ' ')}`}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: '440px', margin: '0 auto var(--space-6)', fontSize: 'var(--font-sm)' }}>
                  Explore our hands-on curriculum in Robotics, Scratch, Python, and AI designed for young innovators. All courses are completely free!
                </p>
                <Link to="/courses" className="btn btn-primary" id="explore-catalog-cta">
                  <Compass size={16} /> Explore Full Catalog
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {filteredCourses.map((cp) => {
                  const c = cp.course;
                  const isExpanded = expandedCourseId === c.id;

                  return (
                    <div
                      key={cp.enrollment.id}
                      className="card"
                      style={{
                        padding: 'var(--space-6)',
                        borderRadius: 'var(--radius-xl)',
                        border: cp.isCompleted
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : '1px solid var(--color-border)',
                        transition: 'box-shadow 0.2s ease'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: 'var(--space-4)'
                        }}
                      >
                        <div style={{ display: 'flex', gap: 'var(--space-4)', flex: '1 1 360px' }}>
                          {c.cover_image_url ? (
                            <img
                              src={c.cover_image_url}
                              alt={c.title}
                              style={{
                                width: '96px',
                                height: '96px',
                                borderRadius: 'var(--radius-lg)',
                                objectFit: 'cover',
                                flexShrink: 0
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '96px',
                                height: '96px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(139, 92, 246, 0.2))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-primary-600)',
                                flexShrink: 0
                              }}
                            >
                              <BookOpen size={36} />
                            </div>
                          )}

                          <div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                              <span
                                style={{
                                  fontSize: 'var(--font-xs)',
                                  fontWeight: 700,
                                  color: cp.isCompleted ? '#10b981' : 'var(--color-primary-600)',
                                  backgroundColor: cp.isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-primary-50)',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)'
                                }}
                              >
                                {cp.isCompleted ? 'Course Completed!' : 'In Progress'}
                              </span>
                              <span
                                style={{
                                  fontSize: 'var(--font-xs)',
                                  color: 'var(--color-text-secondary)',
                                  backgroundColor: 'var(--color-surface-hover)',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)'
                                }}
                              >
                                {c.level}
                              </span>
                              {c.estimated_duration && (
                                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} /> {c.estimated_duration}
                                </span>
                              )}
                            </div>

                            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', margin: '4px 0 6px' }}>
                              <Link to={`/courses/${c.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                {c.title}
                              </Link>
                            </h3>

                            {c.summary && (
                              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', margin: '0 0 var(--space-3)' }}>
                                {c.summary}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* CTA and Resume button */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                          {cp.nextLesson ? (
                            <Link
                              to={`/courses/${c.slug}/lessons/${cp.nextLesson.slug}`}
                              id={`resume-course-${c.slug}`}
                              className="btn btn-primary"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-5)' }}
                            >
                              <PlayCircle size={16} />
                              <span>{cp.isCompleted ? 'Review Lessons' : 'Resume Learning'}</span>
                              <ArrowRight size={14} />
                            </Link>
                          ) : (
                            <Link
                              to={`/courses/${c.slug}`}
                              className="btn btn-primary"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                            >
                              <span>View Course Overview</span>
                              <ArrowRight size={14} />
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => setExpandedCourseId(isExpanded ? null : c.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-text-secondary)',
                              fontSize: 'var(--font-xs)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 0'
                            }}
                          >
                            <span>{isExpanded ? 'Hide Syllabus' : 'View Syllabus & Lessons'}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar Section */}
                      <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', fontSize: 'var(--font-xs)' }}>
                          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                            {cp.totalLessons === 0 ? (
                              'Curriculum modules in preparation'
                            ) : (
                              `${cp.completedLessons} of ${cp.totalLessons} lessons finished`
                            )}
                          </span>
                          <span style={{ fontWeight: 700, color: cp.isCompleted ? '#10b981' : 'var(--color-primary-600)' }}>
                            {cp.progressPercent}% Completed
                          </span>
                        </div>

                        <div
                          style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: 'var(--color-surface-hover)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <div
                            style={{
                              width: `${cp.progressPercent}%`,
                              height: '100%',
                              background: cp.isCompleted
                                ? 'linear-gradient(90deg, #10b981, #059669)'
                                : 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                              borderRadius: 'var(--radius-full)',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>

                        {cp.nextLesson && !cp.isCompleted && (
                          <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                            <Sparkles size={14} style={{ color: '#0ea5e9' }} />
                            <span>Up Next:</span>
                            <Link
                              to={`/courses/${c.slug}/lessons/${cp.nextLesson.slug}`}
                              style={{ color: 'var(--color-primary-600)', fontWeight: 600, textDecoration: 'none' }}
                            >
                              {cp.nextLesson.title}
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Expandable Syllabus Accordion */}
                      {isExpanded && (
                        <div
                          style={{
                            marginTop: 'var(--space-4)',
                            paddingTop: 'var(--space-4)',
                            borderTop: '1px dashed var(--color-border)'
                          }}
                        >
                          <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
                            Curriculum Structure & Lesson Checklist
                          </h4>

                          {cp.modules.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-xs)' }}>
                              Lessons are currently being scheduled for this course.
                            </p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                              {cp.modules.map((mod, mIdx) => (
                                <div
                                  key={mod.id}
                                  style={{
                                    backgroundColor: 'var(--color-surface-hover)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--space-3) var(--space-4)',
                                    border: '1px solid var(--color-border)'
                                  }}
                                >
                                  <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                                    MODULE {mIdx + 1}: {mod.title}
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {(mod.lessons || []).map((less, lIdx) => (
                                      <div
                                        key={less.id}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: 'var(--space-2)',
                                          backgroundColor: 'var(--color-surface)',
                                          borderRadius: 'var(--radius-md)',
                                          border: '1px solid var(--color-border)'
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                          {less.lesson_type === 'video' ? (
                                            <Video size={14} style={{ color: 'var(--color-primary-600)' }} />
                                          ) : (
                                            <FileText size={14} style={{ color: 'var(--color-primary-600)' }} />
                                          )}
                                          <Link
                                            to={`/courses/${c.slug}/lessons/${less.slug}`}
                                            style={{
                                              fontSize: 'var(--font-xs)',
                                              fontWeight: 600,
                                              color: 'var(--color-text)',
                                              textDecoration: 'none'
                                            }}
                                          >
                                            {mIdx + 1}.{lIdx + 1} {less.title}
                                          </Link>
                                        </div>

                                        {less.duration_minutes && (
                                          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                                            {less.duration_minutes}m
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SAVED ARTICLES & BOOKMARKS */}
        {/* ============================================================== */}
        {activeTab === 'bookmarks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                  Bookmarked Learning Resources ({bookmarks.length})
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-xs)', margin: '4px 0 0' }}>
                  Quickly jump back to educational blog articles and course materials you saved.
                </p>
              </div>

              <Link to="/blog" className="btn btn-secondary" style={{ fontSize: 'var(--font-xs)' }}>
                Browse Blog Library
              </Link>
            </div>

            {loading ? (
              <p style={{ color: 'var(--color-text-secondary)' }}>Loading saved bookmarks...</p>
            ) : bookmarks.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: 'var(--space-12) var(--space-6)',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                <BookmarkIcon size={48} style={{ color: 'var(--color-primary-600)', margin: '0 auto var(--space-4)', opacity: 0.5 }} />
                <h4 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                  No bookmarks saved yet
                </h4>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: '420px', margin: '0 auto var(--space-6)', fontSize: 'var(--font-sm)' }}>
                  When reading blog tutorials or checking out courses, tap the bookmark icon to save materials to this personalized queue.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
                  <Link to="/blog" className="btn btn-primary">
                    Explore Articles
                  </Link>
                  <Link to="/courses" className="btn btn-secondary">
                    Explore Courses
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                {bookmarks.map((b) => (
                  <div
                    key={b.bookmark.id}
                    className="card"
                    style={{
                      padding: 'var(--space-5)',
                      borderRadius: 'var(--radius-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <span
                          style={{
                            fontSize: 'var(--font-xs)',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: b.bookmark.target_type === 'blog_post' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                            color: b.bookmark.target_type === 'blog_post' ? 'var(--color-primary-600)' : '#8b5cf6'
                          }}
                        >
                          {b.categoryOrLevel}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveBookmark(b)}
                          title="Remove bookmark"
                          id={`remove-bookmark-${b.bookmark.id}`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <h4 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--color-text)', margin: '4px 0 8px' }}>
                        {b.title}
                      </h4>

                      {b.summary && (
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-xs)', lineHeight: 1.5, margin: '0 0 var(--space-4)' }}>
                          {b.summary.slice(0, 110)}...
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                        Saved {new Date(b.bookmark.created_at).toLocaleDateString()}
                      </span>

                      <Link
                        to={b.url}
                        className="btn btn-secondary"
                        style={{ fontSize: 'var(--font-xs)', padding: 'var(--space-1) var(--space-3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>Open</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PROFILE & PREFERENCES */}
        {/* ============================================================== */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
            {/* Form */}
            <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <User size={20} style={{ color: 'var(--color-primary-600)' }} />
                <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                  Personal Learner Profile
                </h3>
              </div>

              <form onSubmit={handleSaveProfile}>
                {/* Avatar Choice */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                    Choose Avatar Character
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        id={`avatar-preset-${preset.id}`}
                        onClick={() => setSelectedAvatar(preset.id)}
                        style={{
                          height: '52px',
                          borderRadius: 'var(--radius-lg)',
                          border: selectedAvatar === preset.id ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                          background: preset.bg,
                          fontSize: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: selectedAvatar === preset.id ? '0 0 0 3px rgba(14, 165, 233, 0.3)' : 'none'
                        }}
                        title={preset.label}
                      >
                        {preset.emoji}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <input
                      type="text"
                      placeholder="Or enter custom image URL (https://...)"
                      value={customAvatarUrl}
                      onChange={(e) => {
                        setCustomAvatarUrl(e.target.value);
                        setSelectedAvatar('custom');
                      }}
                      className="input-field"
                      style={{ flex: 1, fontSize: 'var(--font-xs)' }}
                    />
                  </div>
                </div>

                {/* Display Name */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor="learner-display-name" style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
                    Full Display Name
                  </label>
                  <input
                    id="learner-display-name"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Bio */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor="learner-bio" style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
                    Learner Bio & Goals (Optional)
                  </label>
                  <textarea
                    id="learner-bio"
                    rows={3}
                    maxLength={300}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us what you love to build or study..."
                    className="input-field"
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', display: 'block', textAlign: 'right', marginTop: '2px' }}>
                    {bio.length} / 300
                  </span>
                </div>

                {/* Learning Interests Tags */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                    <Tag size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Topics of Interest
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {INTEREST_OPTIONS.map((tag) => {
                      const isSelected = selectedInterests.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          id={`interest-tag-${tag.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                          onClick={() => handleToggleInterest(tag)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-xs)',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--color-primary-600)' : 'var(--color-border)',
                            backgroundColor: isSelected ? 'var(--color-primary-50)' : 'var(--color-surface-hover)',
                            color: isSelected ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {profileMsg && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      fontSize: 'var(--font-xs)',
                      color: profileMsg.isError ? '#ef4444' : '#10b981',
                      marginBottom: 'var(--space-4)',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: profileMsg.isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="save-profile-btn"
                  disabled={savingProfile}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: 'var(--space-3)' }}
                >
                  {savingProfile ? 'Saving Details...' : 'Save Profile Details'}
                </button>
              </form>
            </div>

            {/* Account Metadata / Verification card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <Award size={20} style={{ color: '#10b981' }} />
                  <h4 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                    Account Standing & Verification
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Registered Email</span>
                    <strong style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text)' }}>{user?.email}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Account Status</span>
                    <span style={{ fontSize: 'var(--font-xs)', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Active Student
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Assigned Roles</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {roles.map((r) => (
                        <span
                          key={r}
                          style={{
                            padding: '1px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-xs)',
                            backgroundColor: 'var(--color-surface-hover)',
                            border: '1px solid var(--color-border)',
                            textTransform: 'capitalize'
                          }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Member Since</span>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text)' }}>
                      {new Date(profile?.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Institution Accreditation Banner */}
              <div
                className="card"
                style={{
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-xl)',
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <h5 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                  MindSparQ Certificate Policy
                </h5>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Completing 100% of the lessons in any track grants a verified MindSparQ Certificate of Completion, recognized in our STEM partner programs.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
