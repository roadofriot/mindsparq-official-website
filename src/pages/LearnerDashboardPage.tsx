import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserEnrollments } from '../services/courseService';
import { getUserBookmarks } from '../services/blogService';
import { updateOwnProfile } from '../services/userService';
import { Enrollment, Bookmark } from '../types/database';
import { BookOpen, Bookmark as BookmarkIcon, User, ArrowRight, CheckCircle2, Shield, LogOut } from 'lucide-react';

export const LearnerDashboardPage: React.FC = () => {
  const { user, profile, roles, isStaff, signOut, refreshProfile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile editing
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio || '');
    }
  }, [profile]);

  useEffect(() => {
    let mounted = true;
    Promise.all([getUserEnrollments(), getUserBookmarks()])
      .then(([enrs, bkms]) => {
        if (!mounted) return;
        setEnrollments(enrs);
        setBookmarks(bkms);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    const { error } = await updateOwnProfile(displayName, bio);
    if (!error) {
      await refreshProfile();
      setProfileMsg('Profile updated successfully.');
    } else {
      setProfileMsg('Failed to update profile: ' + error.message);
    }
    setSavingProfile(false);
  };

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Header Banner */}
      <section
        style={{
          padding: 'var(--space-12) 0 var(--space-8)',
          background: 'radial-gradient(circle at top left, rgba(14, 165, 233, 0.1), transparent 70%)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <span
                  style={{
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary-50)',
                    color: 'var(--color-primary-600)',
                    fontSize: 'var(--font-xs)',
                    fontWeight: 700,
                    textTransform: 'uppercase'
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
              <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-text)' }}>
                Welcome back, {profile?.display_name || user?.email?.split('@')[0]}
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
                {user?.email} • Member since {new Date(profile?.created_at || Date.now()).getFullYear()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              {isStaff && (
                <Link
                  to="/admin"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                >
                  <Shield size={16} /> Admin Console
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout */}
      <div className="container" style={{ marginTop: 'var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
          {/* Left Column: Enrolled Courses & Bookmarks */}
          <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Enrolled Courses */}
            <div
              className="card"
              style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <BookOpen size={20} style={{ color: 'var(--color-primary-600)' }} />
                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
                  Enrolled Courses ({enrollments.length})
                </h2>
              </div>

              {loading ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>Loading course progress...</p>
              ) : enrollments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                    You have not enrolled in any free courses yet.
                  </p>
                  <Link to="/courses" className="btn btn-primary">
                    Explore Course Catalog
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {enrollments.map((enr) => {
                    const c = enr.course;
                    if (!c) return null;
                    return (
                      <div
                        key={enr.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-4)',
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: 'var(--color-surface-hover)',
                          border: '1px solid var(--color-border)',
                          flexWrap: 'wrap',
                          gap: 'var(--space-3)'
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: 'var(--font-xs)',
                              fontWeight: 700,
                              color: '#10b981',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)'
                            }}
                          >
                            Active Enrollment
                          </span>
                          <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--color-text)', margin: '4px 0 2px' }}>
                            {c.title}
                          </h3>
                          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                            Enrolled: {new Date(enr.enrolled_at).toLocaleDateString()}
                          </span>
                        </div>

                        <Link
                          to={`/courses/${c.slug}`}
                          className="btn btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-xs)' }}
                        >
                          <span>Resume Learning</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bookmarks */}
            <div
              className="card"
              style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <BookmarkIcon size={20} style={{ color: 'var(--color-primary-600)' }} />
                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
                  Saved Content & Bookmarks ({bookmarks.length})
                </h2>
              </div>

              {loading ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>Loading saved items...</p>
              ) : bookmarks.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
                  You have not bookmarked any articles or courses yet. Use the bookmark icon on any article to save it for quick reference.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {bookmarks.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)', fontWeight: 500 }}>
                        {b.target_type === 'blog_post' ? 'Saved Blog Article' : 'Saved Course'}
                      </span>
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Profile & Settings */}
          <div style={{ maxWidth: '400px' }}>
            <div
              className="card"
              style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <User size={20} style={{ color: 'var(--color-primary-600)' }} />
                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
                  Profile Settings
                </h2>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label
                    htmlFor="displayName"
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-sm)',
                      fontWeight: 500,
                      marginBottom: 'var(--space-1)',
                      color: 'var(--color-text)'
                    }}
                  >
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label
                    htmlFor="bio"
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-sm)',
                      fontWeight: 500,
                      marginBottom: 'var(--space-1)',
                      color: 'var(--color-text)'
                    }}
                  >
                    Short Bio (Optional)
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    maxLength={300}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your learning journey or interests..."
                    className="input-field"
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-sm)',
                      fontWeight: 500,
                      marginBottom: 'var(--space-1)',
                      color: 'var(--color-text)'
                    }}
                  >
                    Assigned Platform Roles
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {roles.map((r) => (
                      <span
                        key={r}
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-surface-hover)',
                          border: '1px solid var(--color-border)',
                          fontSize: 'var(--font-xs)',
                          textTransform: 'capitalize'
                        }}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {profileMsg && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      fontSize: 'var(--font-xs)',
                      color: profileMsg.includes('Failed') ? '#ef4444' : '#10b981',
                      marginBottom: 'var(--space-3)'
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>{profileMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
