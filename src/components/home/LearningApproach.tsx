import React from 'react';
import { learningPillars } from '../../content/programs';
import { ExpandableText } from '../ui/ExpandableText';
import { useLanguage } from '../../context/LanguageContext';

const STEP_IMAGES = [
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80', // 01 Hands-on tinkering
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=500&q=80', // 02 Deliberate practice
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=500&q=80', // 03 Creative problem solving
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=500&q=80'  // 04 Mentor feedback
];

export const LearningApproach: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container">
        <div className="section-header">
          <div className="eyebrow eyebrow-teal">
            <span>{t('section.approach.eyebrow', 'Pedagogical Framework')}</span>
          </div>
          <h2>{t('section.approach.title', 'Our Learning Approach')}</h2>
          <p>
            {t('section.approach.subtitle', 'Real understanding is built through guided experience, purposeful repetition, and constructive curiosity—not rote memorization or unverified promises.')}
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-6)'
          }}
        >
          {learningPillars.map((pillar, idx) => (
            <div 
              key={pillar.step}
              className="card card-interactive"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                padding: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Step Visual Image */}
              <div
                style={{
                  height: '130px',
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-surface-hover)'
                }}
              >
                <img
                  src={STEP_IMAGES[idx] || STEP_IMAGES[0]}
                  alt={pillar.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    fontSize: '1rem',
                    fontWeight: 900,
                    padding: '2px 10px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--color-brand-primary)'
                  }}
                >
                  {pillar.step}
                </span>
              </div>

              <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                  {pillar.title}
                </h3>
                <ExpandableText
                  text={pillar.description}
                  maxLength={70}
                  style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
