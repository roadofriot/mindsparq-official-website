import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ArrowRight, 
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Sparkles,
  MapPin,
  Award
} from 'lucide-react';
import { getPublicTeamProfiles } from '../services/teamService';
import { TeamProfile } from '../types/database';
import { SocialIcon } from '../components/ui/SocialIcon';
import { updatePageSeo } from '../utils/seo';
import { PageBanner } from '../components/ui/PageBanner';

/**
 * Robust Faculty Avatar that renders the high-res portrait image
 * with graceful fallback to professional stylized initials on error.
 */
const FacultyAvatar: React.FC<{
  src: string | null;
  name: string;
  isFounder?: boolean;
  size?: number;
}> = ({ src, name, isFounder = false, size = 72 }) => {
  const [imageError, setImageError] = useState(false);

  const initials = name
    .replace(/^Er\.\s+|^Dr\.\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || name.slice(0, 2).toUpperCase();

  if (src && !imageError) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          flexShrink: 0,
          border: isFounder 
            ? '3px solid var(--color-primary-500, #3b82f6)' 
            : '2px solid var(--color-border)',
          boxShadow: isFounder 
            ? '0 6px 18px rgba(37, 99, 235, 0.28)' 
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
          backgroundColor: 'var(--color-surface-hover)'
        }}
      >
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: 'var(--radius-full)',
        background: isFounder 
          ? 'linear-gradient(135deg, var(--color-primary-600) 0%, #4338ca 100%)' 
          : 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        color: isFounder ? '#ffffff' : 'var(--color-primary-600)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size > 80 ? '1.75rem' : '1.25rem',
        fontWeight: 800,
        flexShrink: 0,
        border: isFounder 
          ? '3px solid var(--color-primary-500, #3b82f6)' 
          : '2px solid var(--color-border)'
      }}
    >
      {initials}
    </div>
  );
};

export const TeamPage: React.FC = () => {
  const [profiles, setProfiles] = useState<TeamProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updatePageSeo({
      title: 'Meet Our Team & Faculty | MindSparQ Education & Technology',
      description: 'Meet the passionate researchers, certified abacus master trainers, robotics curriculum architects, and academic mentors driving 21st-century learning at MindSparQ in Butwal, Nepal.',
      canonicalPath: '/team',
      ogType: 'website'
    });

    let isMounted = true;
    getPublicTeamProfiles()
      .then((data) => {
        if (isMounted) {
          setProfiles(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('[MindSparQ Team] Failed to load team profiles:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Faculty & Staff' },
    { key: 'leadership', label: 'Leadership' },
    { key: 'teaching', label: 'Teaching Team' },
    { key: 'program_leads', label: 'Program Leads' },
    { key: 'operations', label: 'Operations & Support' }
  ];

  const getCategoryCount = (key: string) => {
    if (key === 'all') return profiles.length;
    return profiles.filter((p) => p.team_category === key).length;
  };

  const filteredProfiles = profiles.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.team_category === selectedCategory;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'leadership':
        return { label: 'Leadership', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' };
      case 'teaching':
        return { label: 'Teaching Faculty', color: '#059669', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'program_leads':
        return { label: 'Program Lead', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' };
      case 'operations':
        return { label: 'Operations & Support', color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' };
      default:
        return { label: 'Faculty', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh', paddingBottom: 'var(--space-16)' }}>
      {/* Page Hero Banner */}
      <PageBanner
        eyebrowIcon={<Users size={14} />}
        eyebrowText="The People Behind MindSparQ"
        title="Meet Our Team & Faculty"
        subtitle="MindSparQ is built by researchers, seasoned educators, and technology specialists united by a single vision: unlocking students' genuine cognitive faculties and sparking technological innovation throughout Nepal."
        backgroundImageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
        badges={[
          { label: 'Executive Leadership', variant: 'primary' },
          { label: 'Abacus & STEM Faculty', variant: 'primary' },
          { label: 'Robotics Curriculum Architects', variant: 'accent' },
          { label: 'Academic Outreach Leads', variant: 'neutral' }
        ]}
      />

      {/* Main Container */}
      <div className="container" style={{ marginTop: 'var(--space-10)' }}>
        {/* Trust & Academic Pillars Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-10)',
            padding: 'var(--space-4) var(--space-6)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} style={{ color: '#10b981', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                100% Institutionally Vetted
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Direct governance standards
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={20} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Certified Master Trainers
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Abacus, Vedic Math & STEM
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} style={{ color: '#8b5cf6', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                VAK Multi-Sensory Pedagogy
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Scientific cognitive foundation
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={20} style={{ color: '#0ea5e9', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Butwal Center Faculty
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Gyanbhoomi Path, Butwal-11
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters with Counts */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexWrap: 'wrap', 
            gap: '10px', 
            marginBottom: 'var(--space-10)' 
          }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            const count = getCategoryCount(cat.key);

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${isActive ? 'var(--color-primary-600)' : 'var(--color-border)'}`,
                  backgroundColor: isActive ? 'var(--color-primary-600)' : 'var(--color-surface)',
                  color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.28)' : 'none'
                }}
              >
                <span>{cat.label}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-surface-hover)',
                    color: isActive ? '#ffffff' : 'var(--color-text-muted)'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
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
              Loading faculty directory...
            </p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          /* Empty State */
          <div 
            className="card" 
            style={{ 
              textAlign: 'center', 
              padding: 'var(--space-12) var(--space-6)', 
              maxWidth: '540px', 
              margin: '0 auto',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <Users size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
              No profiles listed yet in this section
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
              Our faculty roster is continuously updated as new instructors complete their rigorous onboarding and verification.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="btn btn-secondary"
              style={{ padding: '8px 18px', fontSize: '0.8125rem' }}
            >
              View All Faculty
            </button>
          </div>
        ) : (
          /* Profile Cards Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {filteredProfiles.map((member) => {
              const isFounder = member.is_featured_founder;
              const catBadge = getCategoryBadge(member.team_category);

              return (
                <article
                  key={member.id}
                  className="card"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid ${isFounder ? 'var(--color-primary-500, #3b82f6)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-xl)',
                    padding: 'clamp(var(--space-5), 3vw, var(--space-6))',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-4)',
                    boxShadow: isFounder 
                      ? '0 10px 30px rgba(37, 99, 235, 0.15)' 
                      : 'var(--shadow-sm)',
                    position: 'relative',
                    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Decorative top accent for Founder */}
                  {isFounder && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)'
                      }}
                    />
                  )}

                  {/* Top: Avatar, Badges & Identity */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <FacultyAvatar
                      src={member.profile_image_path}
                      name={member.display_name}
                      isFounder={isFounder}
                      size={72}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                        {isFounder ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'rgba(37, 99, 235, 0.12)',
                              color: 'var(--color-primary-600)',
                              border: '1px solid rgba(37, 99, 235, 0.25)'
                            }}
                          >
                            <Sparkles size={11} />
                            <span>Founder & CEO</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.03em',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: catBadge.bg,
                              color: catBadge.color
                            }}
                          >
                            {catBadge.label}
                          </span>
                        )}

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: '#10b981'
                          }}
                          title="Verified MindSparQ Faculty"
                        >
                          <ShieldCheck size={12} />
                          <span>Verified</span>
                        </span>
                      </div>

                      <h2 
                        style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: 800, 
                          color: 'var(--color-text)', 
                          margin: 0, 
                          lineHeight: 1.3
                        }}
                      >
                        <Link 
                          to={`/team/${member.slug}`} 
                          style={{ color: 'inherit', textDecoration: 'none' }}
                          className="hover-underline"
                        >
                          {member.display_name}
                        </Link>
                      </h2>

                      {member.display_name_nepali && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                          {member.display_name_nepali}
                        </div>
                      )}

                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-brand-primary)', marginTop: '4px', lineHeight: 1.35 }}>
                        {member.public_title}
                      </div>
                    </div>
                  </div>

                  {/* Short Bio */}
                  <p 
                    style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--color-text-secondary)', 
                      lineHeight: 1.65, 
                      margin: 0, 
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {member.short_bio}
                  </p>

                  {/* Teaching Subjects / Focus Pills */}
                  {member.teaching_subjects && member.teaching_subjects.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                        <BookOpen size={12} style={{ color: 'var(--color-primary-600)' }} />
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>
                          Teaching & Mentorship Focus
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {member.teaching_subjects.slice(0, 3).map((sub, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--color-surface-hover)',
                              border: '1px solid var(--color-border)',
                              color: 'var(--color-text-secondary)'
                            }}
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Qualifications summary */}
                  {member.qualifications && member.qualifications.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <GraduationCap size={14} style={{ color: 'var(--color-brand-primary)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.qualifications[0]}
                      </span>
                    </div>
                  )}

                  {/* Card Bottom: Social Links + View Profile Button */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      paddingTop: 'var(--space-3)', 
                      borderTop: '1px solid var(--color-border)',
                      gap: 'var(--space-2)',
                      marginTop: 'auto'
                    }}
                  >
                    {/* Social icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {member.social_links.linkedin && (
                        <a
                          href={member.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.display_name} LinkedIn profile`}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-surface-hover)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            transition: 'color var(--transition-fast)'
                          }}
                        >
                          <SocialIcon platform="linkedin" size={14} />
                        </a>
                      )}
                      {member.social_links.facebook && (
                        <a
                          href={member.social_links.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.display_name} Facebook profile`}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-surface-hover)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            transition: 'color var(--transition-fast)'
                          }}
                        >
                          <SocialIcon platform="facebook" size={14} />
                        </a>
                      )}
                      {member.social_links.instagram && (
                        <a
                          href={member.social_links.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.display_name} Instagram profile`}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-surface-hover)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            transition: 'color var(--transition-fast)'
                          }}
                        >
                          <SocialIcon platform="instagram" size={14} />
                        </a>
                      )}
                      {member.social_links.youtube && (
                        <a
                          href={member.social_links.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.display_name} YouTube channel`}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-surface-hover)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            transition: 'color var(--transition-fast)'
                          }}
                        >
                          <SocialIcon platform="youtube" size={14} />
                        </a>
                      )}
                    </div>

                    {/* View profile link */}
                    <Link
                      to={`/team/${member.slug}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isFounder ? 'rgba(37, 99, 235, 0.1)' : 'var(--color-surface-hover)',
                        border: `1px solid ${isFounder ? 'rgba(37, 99, 235, 0.3)' : 'var(--color-border)'}`,
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: isFounder ? 'var(--color-primary-600)' : 'var(--color-text)',
                        textDecoration: 'none',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <span>Profile</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Institutional Governance Note */}
        <div 
          style={{ 
            marginTop: 'var(--space-12)', 
            padding: 'var(--space-6)', 
            backgroundColor: 'var(--color-surface)', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}
        >
          <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
            <strong>Faculty Transparency Policy:</strong> All public profile data, qualifications, research contributions, and social representations displayed on this portal are directly vetted and approved by MindSparQ Education & Technology institutional governance.
          </p>
        </div>
      </div>
    </div>
  );
};
