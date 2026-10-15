import React from 'react';
import { focusAreas } from '../../content/programs';

export const FocusStrip: React.FC = () => {
  return (
    <section 
      style={{
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-8) 0'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-6)'
          }}
        >
          {focusAreas.map((area, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span 
                  style={{ 
                    fontSize: 'var(--text-xs)', 
                    fontWeight: 700, 
                    color: 'var(--color-brand-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {area.badge}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  0{index + 1}
                </span>
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {area.title}
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {area.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
