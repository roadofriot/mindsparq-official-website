import React from 'react';
import { learningPillars } from '../../content/programs';

export const LearningApproach: React.FC = () => {
  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container">
        <div className="section-header">
          <div className="eyebrow eyebrow-teal">
            <span>Pedagogical Framework</span>
          </div>
          <h2>Our Learning Approach</h2>
          <p>
            Real understanding is built through guided experience, purposeful repetition, and constructive curiosity—not rote memorization or unverified promises.
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-6)'
          }}
        >
          {learningPillars.map((pillar) => (
            <div 
              key={pillar.step}
              className="card"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 800,
                  color: 'var(--color-brand-primary)',
                  opacity: 0.25,
                  marginBottom: 'var(--space-3)',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                {pillar.step}
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                {pillar.title}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
