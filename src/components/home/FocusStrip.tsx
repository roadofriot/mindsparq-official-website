import React from 'react';
import { focusAreas } from '../../content/programs';
import { ExpandableText } from '../ui/ExpandableText';
import { useLanguage } from '../../context/LanguageContext';

const PILLAR_IMAGES = [
  'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80', // Abacus & Math
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80', // AI & Robotics
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80', // Penmanship & Calligraphy
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80'  // Teacher & School Enablement
];

export const FocusStrip: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section 
      style={{
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-10) 0'
      }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <span
            style={{
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              color: 'var(--color-brand-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            {t('section.pillars.eyebrow', 'Our 4 Core Pillars')}
          </span>
          <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, margin: 'var(--space-2) 0', color: 'var(--color-text)' }}>
            {t('section.pillars.title', 'Next-Gen Cognitive & Tech Foundation')}
          </h2>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            {t('section.pillars.subtitle', 'From mental arithmetic to autonomous robotics, we prepare young minds for tomorrow.')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-6)'
          }}
        >
          {focusAreas.map((area, index) => (
            <div 
              key={index}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                padding: 0
              }}
            >
              {/* Pillar Image Slot */}
              <div
                style={{
                  height: '140px',
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-surface-hover)'
                }}
              >
                <img
                  src={PILLAR_IMAGES[index] || PILLAR_IMAGES[0]}
                  alt={area.title}
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
                    top: '10px',
                    left: '10px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {area.badge}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--color-brand-primary)',
                    color: '#ffffff'
                  }}
                >
                  0{index + 1}
                </span>
              </div>

              {/* Text Content with Truncation */}
              <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                  {area.title}
                </h3>
                <ExpandableText
                  text={area.description}
                  maxLength={75}
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
