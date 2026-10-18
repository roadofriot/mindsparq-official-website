import React from 'react';
import { whoWeSupport } from '../../content/programs';
import { ProgramIcon } from '../ui/ProgramIcon';
import { ExpandableText } from '../ui/ExpandableText';
import { useLanguage } from '../../context/LanguageContext';

const SUPPORT_IMAGES = [
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=500&q=80', // Students
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=500&q=80', // Parents
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=500&q=80', // Teachers
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=500&q=80', // Partner Schools
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=80', // Institutions
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=500&q=80'  // Tech Creators
];

import { SiteSection } from '../../services/siteCustomizerService';

interface WhoWeSupportProps {
  section?: SiteSection;
}

export const WhoWeSupport: React.FC<WhoWeSupportProps> = ({ section }) => {
  const { t, language } = useLanguage();

  const eyebrowText = section?.badge || t('section.support.eyebrow', 'Community & Ecosystem');
  const titleText = section?.title || t('section.support.title', 'Who We Support');
  const subtitleText = section?.subtitle || t('section.support.subtitle', 'Whether preparing young minds for mathematical clarity or partnering with schools on robotics integration, we meet learners where they are.');

  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--color-bg)' }} data-cms-section={section?.id || 'who_we_support'}>
      <div className="container">
        <div className="section-header">
          <div className="eyebrow eyebrow-amber" data-cms-field="badge">
            <span>{eyebrowText}</span>
          </div>
          <h2 data-cms-field="title">{titleText}</h2>
          <p data-cms-field="subtitle">
            {subtitleText}
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-6)'
          }}
        >
          {whoWeSupport.map((group, idx) => (
            <div 
              key={idx}
              className="card card-interactive"
              style={{
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)'
              }}
            >
              {/* Card Image Banner */}
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
                  src={SUPPORT_IMAGES[idx] || SUPPORT_IMAGES[0]}
                  alt={group.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(6px)',
                    color: 'var(--color-brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <ProgramIcon name={group.iconName} size={18} />
                </div>
              </div>

              <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                  {language === 'ne' && (group as any).titleNepali ? (group as any).titleNepali : group.title}
                </h3>
                <ExpandableText
                  text={language === 'ne' && (group as any).descriptionNepali ? (group as any).descriptionNepali : group.description}
                  maxLength={85}
                  style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
