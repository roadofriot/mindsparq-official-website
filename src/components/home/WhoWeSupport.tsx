import React from 'react';
import { whoWeSupport } from '../../content/programs';
import { ProgramIcon } from '../ui/ProgramIcon';

export const WhoWeSupport: React.FC = () => {
  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container">
        <div className="section-header">
          <div className="eyebrow eyebrow-amber">
            <span>Community & Ecosystem</span>
          </div>
          <h2>Who We Support</h2>
          <p>
            Whether preparing young minds for mathematical clarity or partnering with schools on robotics integration, we meet learners where they are.
          </p>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-6)'
          }}
        >
          {whoWeSupport.map((group, idx) => (
            <div 
              key={idx}
              className="card"
              style={{
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-accent-teal-soft)',
                  color: 'var(--color-accent-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ProgramIcon name={group.iconName} size={22} />
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)' }}>
                {group.title}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                {group.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
