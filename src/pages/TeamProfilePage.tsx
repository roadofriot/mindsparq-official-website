import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  ArrowRight,
  Briefcase,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { getTeamProfileBySlug } from '../services/teamService';
import { TeamProfile, BlogPost } from '../types/database';
import { SocialIcon } from '../components/ui/SocialIcon';
import { updatePageSeo } from '../utils/seo';

export const TeamProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<TeamProfile | null>(null);
  const [authoredPosts, setAuthoredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    getTeamProfileBySlug(slug)
      .then(({ profile: p, posts }) => {
        if (!isMounted) return;
        setProfile(p);
        setAuthoredPosts(posts);
        setLoading(false);

        if (p) {
          updatePageSeo({
            title: `${p.display_name} — ${p.public_title} | MindSparQ Education & Technology`,
            description: p.short_bio,
            canonicalPath: `/team/${p.slug}`,
            ogType: 'website'
          });
        }
      })
      .catch((err) => {
        console.error('[MindSparQ Team] Error loading profile:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
        <div 
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary-600)',
            borderRadius: '50%',
            margin: '0 auto var(--space-4)',
            animation: 'spin 1s linear infinite'
          }}
        />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Loading profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0' }}>
        <div 
          className="card" 
          style={{ 
            maxWidth: '560px', 
            margin: '0 auto', 
            textAlign: 'center', 
            padding: 'var(--space-12) var(--space-6)',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          <UserCheck size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--space-4)' }} />
          <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
            Profile Not Found
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
            The profile you are looking for may have been moved, updated, or is currently undergoing institutional review.
          </p>
          <Link to="/team" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} />
            <span>Return to Faculty Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const isFounder = profile.is_featured_founder;

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh', paddingBottom: 'var(--space-16)' }}>
      {/* Top Breadcrumb Bar */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link 
            to="/team" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.8125rem', 
              fontWeight: 600, 
              color: 'var(--color-text-secondary)',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={14} />
            <span>All Faculty & Staff</span>
          </Link>
          <span style={{ color: 'var(--color-border)' }}>/</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {profile.display_name}
          </span>
        </div>
      </div>

      <div className="container" style={{ marginTop: 'var(--space-8)' }}>
        {/* Profile Header Hero Card */}
        <div 
          className="card"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: `1px solid ${isFounder ? 'var(--color-primary-500, #3b82f6)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(var(--space-6), 4vw, var(--space-10))',
            marginBottom: 'var(--space-8)',
            boxShadow: isFounder ? '0 10px 30px rgba(37, 99, 235, 0.12)' : 'var(--shadow-sm)'
          }}
        >
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: 'clamp(var(--space-6), 3vw, var(--space-8))' 
            }}
          >
            {/* Avatar Photo Frame */}
            {profile.profile_image_path && !imageError ? (
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: isFounder 
                    ? '3px solid var(--color-primary-500, #3b82f6)' 
                    : '2px solid var(--color-border)',
                  boxShadow: isFounder 
                    ? '0 6px 20px rgba(37, 99, 235, 0.35)' 
                    : '0 2px 10px rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'var(--color-surface-hover)'
                }}
              >
                <img
                  src={profile.profile_image_path}
                  alt={profile.display_name}
                  onError={() => setImageError(true)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: 'var(--radius-full)',
                  background: isFounder 
                    ? 'linear-gradient(135deg, var(--color-primary-600) 0%, #4338ca 100%)' 
                    : 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                  color: isFounder ? '#ffffff' : 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  border: isFounder 
                    ? '3px solid var(--color-primary-500, #3b82f6)' 
                    : '2px solid var(--color-border)',
                  boxShadow: isFounder ? '0 4px 16px rgba(37, 99, 235, 0.35)' : 'none'
                }}
              >
                {profile.display_name.slice(0, 2).toUpperCase()}
              </div>
            )}

            {/* Profile Identity Details */}
            <div style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isFounder ? 'rgba(37, 99, 235, 0.12)' : 'var(--color-surface-hover)',
                    color: isFounder ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <ShieldCheck size={13} style={{ color: '#10b981' }} />
                  <span>Verified Profile</span>
                </span>
                {isFounder && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      color: '#d97706',
                      border: '1px solid rgba(245, 158, 11, 0.25)'
                    }}
                  >
                    Founder & CEO
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 2px', lineHeight: 1.2 }}>
                {profile.display_name}
              </h1>

              {profile.display_name_nepali && (
                <div style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
                  {profile.display_name_nepali}
                </div>
              )}

              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-brand-primary)', margin: '0 0 var(--space-3)' }}>
                {profile.public_title}
              </p>

              {/* Social Channels */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                {profile.social_links.linkedin && (
                  <a
                    href={profile.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${profile.display_name} LinkedIn`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-surface-hover)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <SocialIcon platform="linkedin" size={14} />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.social_links.facebook && (
                  <a
                    href={profile.social_links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${profile.display_name} Facebook`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-surface-hover)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <SocialIcon platform="facebook" size={14} />
                    <span>Facebook</span>
                  </a>
                )}
                {profile.social_links.instagram && (
                  <a
                    href={profile.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${profile.display_name} Instagram`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-surface-hover)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <SocialIcon platform="instagram" size={14} />
                    <span>Instagram</span>
                  </a>
                )}
                {profile.social_links.youtube && (
                  <a
                    href={profile.social_links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${profile.display_name} YouTube`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-surface-hover)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <SocialIcon platform="youtube" size={14} />
                    <span>YouTube</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'start'
          }}
        >
          {/* Main Column: Biography & Detailed Sections */}
          <div style={{ flex: '1 1 540px', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Biography */}
            <div className="card" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
                <BookOpen size={20} style={{ color: 'var(--color-primary-600)' }} />
                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  About {profile.display_name}
                </h2>
              </div>
              <div 
                style={{ 
                  color: 'var(--color-text-secondary)', 
                  fontSize: '0.9375rem', 
                  lineHeight: 1.8, 
                  whiteSpace: 'pre-line' 
                }}
              >
                {profile.bio}
              </div>
            </div>

            {/* Authored Blog Posts & Articles */}
            {authoredPosts.length > 0 && (
              <div className="card" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} style={{ color: 'var(--color-primary-600)' }} />
                    <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                      Published Articles & Pedagogical Insights
                    </h2>
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    {authoredPosts.length} {authoredPosts.length === 1 ? 'Article' : 'Articles'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {authoredPosts.map((post) => (
                    <article
                      key={post.id}
                      style={{
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'border-color var(--transition-fast)'
                      }}
                    >
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary-600)' }}>
                        {post.category}
                      </span>
                      <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, margin: 0 }}>
                        <Link to={`/blog/${post.slug}`} style={{ color: 'var(--color-text)', textDecoration: 'none' }} className="hover-underline">
                          {post.title}
                        </Link>
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        {post.excerpt}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                        </span>
                        <Link to={`/blog/${post.slug}`} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
                          <span>Read Article</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right/Sidebar Column: Credentials & Institutional Verification */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Credentials Card */}
            <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
                <Award size={18} style={{ color: 'var(--color-primary-600)' }} />
                <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 800, margin: 0 }}>
                  Credentials & Expertise
                </h3>
              </div>

              {profile.education && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>
                    Education & Background
                  </span>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 600 }}>
                    {profile.education}
                  </div>
                </div>
              )}

              {profile.qualifications && profile.qualifications.length > 0 && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                    Qualifications & Certifications
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {profile.qualifications.map((q, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.teaching_subjects && profile.teaching_subjects.length > 0 && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                    Disciplines & Teaching Subjects
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {profile.teaching_subjects.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(37, 99, 235, 0.08)',
                          color: 'var(--color-primary-600)'
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.responsibilities && profile.responsibilities.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                    Institutional Roles
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {profile.responsibilities.map((r, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        <Briefcase size={13} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Inquire / School Partnership CTA */}
            <div 
              className="card" 
              style={{ 
                padding: 'var(--space-6)', 
                borderRadius: 'var(--radius-xl)', 
                backgroundColor: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)'
              }}
            >
              <h4 style={{ fontSize: 'var(--font-base)', fontWeight: 800, margin: '0 0 var(--space-2)' }}>
                Collaborate with {profile.display_name}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 var(--space-4)' }}>
                Interested in inviting {profile.display_name} for teacher training, institutional consultation, or curriculum advisory?
              </p>
              <Link 
                to="/contact" 
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '8px 16px' }}
              >
                <span>Initiate Institutional Inquiry</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
