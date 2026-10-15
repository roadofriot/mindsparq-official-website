import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { programs } from '../../content/programs';
import { ProgramIcon } from '../ui/ProgramIcon';

export const ProgramsOverview: React.FC = () => {
  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container">
        <div className="section-header">
          <div className="eyebrow">
            <span>Specialized Programs</span>
          </div>
          <h2>Structured Learning for Every Stage</h2>
          <p>
            From cognitive mathematical reasoning to modern robotics, our curricula are crafted to spark inquiry and reinforce core problem-solving capability.
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
                height: '100%'
              }}
            >
              <div>
                {/* Header Icon + Category */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <div 
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-brand-primary-soft)',
                      color: 'var(--color-brand-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ProgramIcon name={program.iconName} size={22} />
                  </div>
                  <span 
                    style={{
                      fontSize: 'var(--text-xs)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    {program.category}
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
                  {program.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                  {program.shortDescription}
                </p>

                {/* Key Outcomes */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Key Focus Outcomes:
                  </span>
                  <ul style={{ listStyle: 'none', marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {program.keyOutcomes.slice(0, 2).map((outcome, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                        <CheckCircle2 size={14} style={{ color: 'var(--color-accent-teal)', flexShrink: 0, marginTop: '2px' }} />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action */}
              <div 
                style={{
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Audience: {program.audience.split(',')[0]}
                </span>
                <Link 
                  to={`/programs#${program.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: 'var(--color-brand-primary)'
                  }}
                >
                  <span>Details</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-12)' }}>
          <Link to="/programs" className="btn btn-primary btn-lg">
            <span>Explore Full Program Catalog</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};
