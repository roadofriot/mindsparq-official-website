import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { programs } from '../../content/programs';
import { ProgramIcon } from '../ui/ProgramIcon';
import { ExpandableText } from '../ui/ExpandableText';
import { useLanguage } from '../../context/LanguageContext';

const PROGRAM_IMAGES: Record<string, string> = {
  'abacus-mental-math': 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
  'vedic-mathematics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
  'ai-coding-robotics': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
  'creative-handwriting': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
  'teacher-training': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
  'parent-counseling': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80'
};

export const ProgramsOverview: React.FC = () => {
  const { t } = useLanguage();

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
          {programs.map((program) => (
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
                  height: '160px',
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-surface-hover)'
                }}
              >
                <img
                  src={PROGRAM_IMAGES[program.id] || PROGRAM_IMAGES['abacus-mental-math']}
                  alt={program.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform var(--transition-normal)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
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
                    bottom: '-16px',
                    right: '16px',
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
                  {program.title}
                </h3>
                
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <ExpandableText
                    text={program.shortDescription}
                    maxLength={85}
                    style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}
                  />
                </div>

                {/* Key Outcomes */}
                <div style={{ marginTop: 'auto', marginBottom: 'var(--space-4)' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, padding: 0 }}>
                    {program.keyOutcomes.slice(0, 2).map((outcome, idx) => (
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
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                    {program.audience.split(',')[0]}
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
          ))}
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
