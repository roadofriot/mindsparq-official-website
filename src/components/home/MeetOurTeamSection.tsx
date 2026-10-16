import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users } from 'lucide-react';
import { getPublicTeamProfiles } from '../../services/teamService';
import { TeamProfile } from '../../types/database';
import { SocialIcon } from '../ui/SocialIcon';

export const MeetOurTeamSection: React.FC = () => {
  const [profiles, setProfiles] = useState<TeamProfile[]>([]);

  useEffect(() => {
    let mounted = true;
    getPublicTeamProfiles()
      .then((data) => {
        if (mounted) {
          setProfiles(data);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const founderProfile = profiles.find((p) => p.is_featured_founder) || profiles[0];
  const regularProfiles = profiles.filter((p) => p.id !== founderProfile?.id).slice(0, 3);

  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--color-bg-secondary, var(--color-bg))' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-12)' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>
            <span>THE PEOPLE BEHIND MINDSPARQ</span>
          </div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
            Meet Our Leadership & Faculty
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            Passionate educators, researchers, and technologists dedicated to uniting cognitive rigor with forward-looking STEM innovation across Nepal.
          </p>
        </div>

        {/* Featured Founder Profile Card */}
        {founderProfile && (
          <div
            className="card"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(var(--space-6), 4vw, var(--space-10))',
              marginBottom: 'var(--space-10)',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '6px',
                height: '100%',
                background: 'linear-gradient(180deg, var(--color-primary-600) 0%, #818cf8 100%)'
              }}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: 'clamp(var(--space-6), 3vw, var(--space-10))',
                alignItems: 'center'
              }}
            >
              {/* Founder Avatar & Key Bio */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, var(--color-primary-600) 0%, #4338ca 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
                    }}
                  >
                    {founderProfile.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--color-primary-600)',
                        marginBottom: '2px'
                      }}
                    >
                      Institutional Leadership
                    </span>
                    <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1.2 }}>
                      {founderProfile.display_name}
                    </h3>
                    {founderProfile.display_name_nepali && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                        {founderProfile.display_name_nepali}
                      </div>
                    )}
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-brand-primary)', marginTop: '2px' }}>
                      {founderProfile.public_title}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {founderProfile.short_bio}
                </p>

                {/* Social Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'var(--space-1)' }}>
                  {founderProfile.social_links.linkedin && (
                    <a
                      href={founderProfile.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn Profile"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <SocialIcon platform="linkedin" size={16} />
                    </a>
                  )}
                  {founderProfile.social_links.facebook && (
                    <a
                      href={founderProfile.social_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook Page"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <SocialIcon platform="facebook" size={16} />
                    </a>
                  )}
                  {founderProfile.social_links.instagram && (
                    <a
                      href={founderProfile.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram Profile"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <SocialIcon platform="instagram" size={16} />
                    </a>
                  )}
                  {founderProfile.social_links.youtube && (
                    <a
                      href={founderProfile.social_links.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube Channel"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <SocialIcon platform="youtube" size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Research Focus & Link */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface-elevated, var(--color-surface-hover))',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} style={{ color: 'var(--color-primary-600)' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text)' }}>
                    Pedagogical Research Focus
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                  "The Effectiveness of VAK-Based Teaching Strategies in Enhancing Learning Outcomes Among Secondary School Students in Butwal Sub-Metropolitan City, Nepal."
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {founderProfile.qualifications?.slice(0, 3).map((q, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--color-primary-600)'
                      }}
                    >
                      {q}
                    </span>
                  ))}
                </div>

                <div style={{ paddingTop: 'var(--space-2)' }}>
                  <Link
                    to={`/team/${founderProfile.slug}`}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      gap: '8px',
                      textDecoration: 'none'
                    }}
                  >
                    <span>Read Executive Profile & Vision</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Profiles Grid (if configured) */}
        {regularProfiles.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
              gap: 'var(--space-6)',
              marginBottom: 'var(--space-10)'
            }}
          >
            {regularProfiles.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(37, 99, 235, 0.12)',
                      color: 'var(--color-primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      flexShrink: 0
                    }}
                  >
                    {p.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 'var(--font-base)', fontWeight: 700, margin: 0 }}>
                      {p.display_name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      {p.public_title}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0, flex: 1 }}>
                  {p.short_bio}
                </p>

                <div style={{ paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border)' }}>
                  <Link
                    to={`/team/${p.slug}`}
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--color-primary-600)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none'
                    }}
                  >
                    <span>View Profile</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Team Members CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/team"
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <Users size={16} />
            <span>Meet the Full Team & Faculty</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};
