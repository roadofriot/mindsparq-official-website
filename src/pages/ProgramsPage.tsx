import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Info, Sparkles, Filter } from 'lucide-react';
import { programs, Program } from '../content/programs';
import { ProgramIcon } from '../components/ui/ProgramIcon';

type FilterCategory = 'all' | 'mathematics' | 'technology' | 'skills' | 'institutional';

export const ProgramsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  const filteredPrograms = activeCategory === 'all'
    ? programs
    : programs.filter(p => p.category === activeCategory);

  return (
    <div style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Page Header */}
      <section 
        style={{
          paddingTop: 'var(--space-16)',
          paddingBottom: 'var(--space-12)',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <div className="eyebrow">
              <Sparkles size={14} />
              <span>Curriculum & Pathways</span>
            </div>
            <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>
              MindSparQ Learning Programs
            </h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              Discover our comprehensive range of programs designed to nurture mental calculation agility, computational creativity, and practical literacy in modern technology.
            </p>
          </div>
        </div>
      </section>

      {/* Program Disclaimers & Filter Bar */}
      <section style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-8) 0' }}>
        <div className="container">
          {/* Transparent Availability Notice */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: 'var(--space-8)'
            }}
          >
            <Info size={20} style={{ color: 'var(--color-brand-primary)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
              <strong>Notice on Program Schedules:</strong> Batch schedules, age suitability, and cohort availability are updated periodically. Specific school partnership sessions follow academic term timetables. Contact our coordinator to confirm currently enrolling batches in Butwal.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-8)'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', marginRight: 'var(--space-2)', textTransform: 'uppercase' }}>
              <Filter size={14} /> Filter:
            </span>
            {(
              [
                { id: 'all', label: 'All Programs' },
                { id: 'mathematics', label: 'Mathematics & Mental Math' },
                { id: 'technology', label: 'Coding, AI & Robotics' },
                { id: 'skills', label: 'Handwriting & Penmanship' },
                { id: 'institutional', label: 'School & Teacher Support' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className="btn"
                style={{
                  minHeight: '38px',
                  padding: '6px 16px',
                  fontSize: 'var(--text-xs)',
                  backgroundColor: activeCategory === tab.id ? 'var(--color-brand-primary)' : 'var(--color-surface)',
                  color: activeCategory === tab.id ? 'var(--color-text-on-brand)' : 'var(--color-text-primary)',
                  borderColor: activeCategory === tab.id ? 'var(--color-brand-primary)' : 'var(--color-border)',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Programs List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {filteredPrograms.map((program: Program) => (
              <article 
                key={program.id}
                id={program.id}
                className="card"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  padding: 'var(--space-8)',
                  scrollMarginTop: '100px'
                }}
              >
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 'var(--space-6)'
                  }}
                  className="program-detail-grid"
                >
                  <div>
                    {/* Header with Icon and Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                      <div 
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-brand-primary-soft)',
                          color: 'var(--color-brand-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <ProgramIcon name={program.iconName} size={24} />
                      </div>
                      <div>
                        <span 
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 700,
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}
                        >
                          {program.category}
                        </span>
                        <h2 style={{ fontSize: 'var(--text-2xl)' }}>
                          {program.title}
                        </h2>
                      </div>
                    </div>

                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>
                      {program.fullDescription}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      <div>
                        <strong>Target Audience:</strong> {program.audience}
                      </div>
                      <span>•</span>
                      <div>
                        <strong>Format:</strong> {program.deliveryFormat}
                      </div>
                    </div>
                  </div>

                  {/* Outcomes Column */}
                  <div 
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-6)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-3)' }}>
                        Core Learning Outcomes
                      </h3>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {program.keyOutcomes.map((outcome, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            <CheckCircle2 size={15} style={{ color: 'var(--color-accent-teal)', flexShrink: 0, marginTop: '2px' }} />
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                      <Link 
                        to={`/contact?program=${encodeURIComponent(program.title)}`}
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <span>Enquire for {program.title}</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <style>{`
          @media (min-width: 920px) {
            .program-detail-grid {
              grid-template-columns: 1.3fr 0.9fr !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
};
