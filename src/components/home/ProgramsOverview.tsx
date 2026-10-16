import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { programs } from '../../content/programs';
import { ProgramIcon } from '../ui/ProgramIcon';
import { ExpandableText } from '../ui/ExpandableText';
import { useLanguage } from '../../context/LanguageContext';

export const ProgramsOverview: React.FC = () => {
  const { language, t } = useLanguage();
  const isNe = language === 'ne';

  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container">
        <div className="section-header">
          <div className="eyebrow">
            <span>{t('section.programs.eyebrow', 'Specialized Programs')}</span>
          </div>
          <h2>{t('section.programs.title', 'Structured Learning for Every Stage')}</h2>
          <p>
            {t('section.programs.subtitle', 'From cognitive mathematical reasoning to modern robotics, our curricula are crafted to spark inquiry and reinforce core problem-solving capability.')}
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--space-6)'
          }}
        >
          {programs.map((program) => {
            const displayTitle = isNe && program.titleNepali ? program.titleNepali : program.title;
            const displayDesc = isNe && program.shortDescriptionNepali ? program.shortDescriptionNepali : program.shortDescription;
            const displayOutcomes = isNe && program.keyOutcomesNepali ? program.keyOutcomesNepali : program.keyOutcomes;
            const displayAudience = isNe && program.audienceNepali ? program.audienceNepali : program.audience;

            return (
              <div 
                key={program.id} 
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  padding: 0,
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                {/* Program Visual Card Image */}
                <div
                  style={{
                    height: '180px',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-surface-hover)'
                  }}
                >
                  <img
                    src={program.imageUrl}
                    alt={displayTitle}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform var(--transition-normal)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
                    }}
                  />
                  <span 
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      fontSize: '0.6875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff'
                    }}
                  >
                    {program.category}
                  </span>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface)',
                      boxShadow: 'var(--shadow-md)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-brand-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}
                  >
                    <ProgramIcon name={program.iconName} size={20} />
                  </div>
                </div>

                <div style={{ padding: 'var(--space-6)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>
                    {displayTitle}
                  </h3>
                  
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <ExpandableText
                      text={displayDesc}
                      maxLength={95}
                      style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}
                    />
                  </div>

                  {/* Key Outcomes */}
                  <div style={{ marginTop: 'auto', marginBottom: 'var(--space-4)' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, padding: 0 }}>
                      {displayOutcomes.slice(0, 2).map((outcome, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ lineHeight: 1.4 }}>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Action Footer */}
                  <div 
                    style={{
                      paddingTop: 'var(--space-4)',
                      borderTop: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayAudience.split('(')[0]}
                    </span>
                    <Link 
                      to={`/programs#${program.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-brand-primary)',
                        textDecoration: 'none'
                      }}
                    >
                      <span>{t('cta.view_details', 'Details')}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-12)' }}>
          <Link to="/programs" className="btn btn-primary btn-lg">
            <span>{t('cta.explore_programs', 'Explore Full Program Catalog')}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};
