import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';
import { getPublicTeamProfiles } from '../services/teamService';
import { TeamProfile } from '../types/database';
import { SocialIcon } from '../components/ui/SocialIcon';
import { updatePageSeo } from '../utils/seo';

export const TeamPage: React.FC = () => {
  const [profiles, setProfiles] = useState<TeamProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updatePageSeo({
      title: 'Meet Our Team & Faculty | MindSparQ Education & Technology',
      description: 'Discover the passionate educators, researchers, and innovators driving cognitive mastery, abacus, and STEM education across Nepal.',
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

  const filteredProfiles = profiles.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.team_category === selectedCategory;
  });

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh', paddingBottom: 'var(--space-16)' }}>
      {/* Header Banner */}
      <section 
        style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'clamp(var(--space-10), 6vw, var(--space-16))',
          paddingBottom: 'clamp(var(--space-8), 5vw, var(--space-12))'
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>
            <span>THE PEOPLE BEHIND MINDSparQ</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-4)', lineHeight: 1.15 }}>
            Meet Our Team & Faculty
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: '0 auto' }}>
            MindSparQ is built by researchers, seasoned educators, and technology specialists united by a single vision: unlocking students' genuine cognitive faculties and sparking technological innovation throughout Nepal.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="container" style={{ marginTop: 'var(--space-10)' }}>
        {/* Category Filters */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexWrap: 'wrap', 
            gap: '8px', 
            marginBottom: 'var(--space-10)' 
          }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${isActive ? 'var(--color-primary-600)' : 'var(--color-border)'}`,
                  backgroundColor: isActive ? 'var(--color-primary-600)' : 'var(--color-surface)',
                  color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isActive ? '0 2px 10px rgba(37, 99, 235, 0.25)' : 'none'
                }}
              >
                {cat.label}
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {filteredProfiles.map((member) => {
              const isFounder = member.is_featured_founder;

              return (
                <article
                  key={member.id}
                  className="card"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid ${isFounder ? 'var(--color-primary-500, #3b82f6)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-4)',
                    boxShadow: isFounder ? '0 8px 24px rgba(37, 99, 235, 0.12)' : 'var(--shadow-sm)',
                    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                  }}
                >
                  {/* Top: Avatar & Title info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: 'var(--radius-full)',
                        background: isFounder 
                          ? 'linear-gradient(135deg, var(--color-primary-600) 0%, #4338ca 100%)' 
                          : 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
                        color: isFounder ? '#ffffff' : 'var(--color-primary-600)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        flexShrink: 0,
                        border: '2px solid var(--color-border)'
                      }}
                    >
                      {member.display_name.slice(0, 2).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isFounder && (
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'rgba(37, 99, 235, 0.12)',
                            color: 'var(--color-primary-600)',
                            marginBottom: '4px'
                          }}
                        >
                          Founder & CEO
                        </span>
                      )}
                      <h2 
                        style={{ 
                          fontSize: 'var(--font-lg)', 
                          fontWeight: 800, 
                          color: 'var(--color-text)', 
                          margin: 0, 
                          lineHeight: 1.25,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
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
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                          {member.display_name_nepali}
                        </div>
                      )}

                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-brand-primary)', marginTop: '2px' }}>
                        {member.public_title}
                      </div>
                    </div>
                  </div>

                  {/* Short Bio */}
                  <p 
                    style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--color-text-secondary)', 
                      lineHeight: 1.6, 
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

                  {/* Structured Qualifications & Teaching Focus */}
                  {member.qualifications && member.qualifications.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {member.qualifications.slice(0, 2).map((q, idx) => (
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
                          {q}
                        </span>
                      ))}
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
                      gap: 'var(--space-2)'
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
                            textDecoration: 'none'
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
                            textDecoration: 'none'
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
                            textDecoration: 'none'
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
                            textDecoration: 'none'
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
                        gap: '4px',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: 'var(--color-primary-600)',
                        textDecoration: 'none'
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
