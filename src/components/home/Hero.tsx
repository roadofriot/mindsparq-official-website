import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles, BookOpen, Cpu } from 'lucide-react';
import { siteConfig } from '../../content/site';

export const Hero: React.FC = () => {
  return (
    <section 
      style={{
        position: 'relative',
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-16)',
        overflow: 'hidden'
      }}
    >
      {/* Background Subtle Gradient Blobs */}
      <div 
        aria-hidden="true" 
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--color-brand-primary-soft) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div 
        aria-hidden="true" 
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-100px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--color-accent-teal-soft) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-12)',
            alignItems: 'center'
          }}
          className="hero-grid"
        >
          {/* Hero Content */}
          <div style={{ maxWidth: '680px' }}>
            <div className="eyebrow">
              <Sparkles size={14} aria-hidden="true" />
              <span>EDUCATION • MATHEMATICS • TECHNOLOGY</span>
            </div>

            <h1 
              style={{
                fontSize: 'var(--text-5xl)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: 'var(--space-6)',
                color: 'var(--color-text-primary)'
              }}
            >
              Empowering Minds, <br />
              <span 
                style={{
                  background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-accent-teal) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Sparking Innovation.
              </span>
            </h1>

            <p 
              style={{
                fontSize: 'var(--text-lg)',
                lineHeight: 1.7,
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-8)'
              }}
            >
              {siteConfig.name} helps learners build confidence in mathematics, explore creative problem-solving, and discover the possibilities of coding, AI, and robotics through engaging learning experiences.
            </p>

            <div 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                alignItems: 'center'
              }}
            >
              <Link to="/programs" className="btn btn-primary btn-lg">
                <span>Explore Our Programs</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                <Compass size={18} aria-hidden="true" />
                <span>Contact MindSparQ</span>
              </Link>
            </div>

            {/* Credibility verification note */}
            <div 
              style={{
                marginTop: 'var(--space-8)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent-teal)' }} />
                Based in Butwal, Rupandehi
              </span>
              <span>•</span>
              <span>Research-Backed Learning</span>
              <span>•</span>
              <span>Hands-On Pedagogy</span>
            </div>
          </div>

          {/* Hero Feature Visual Card */}
          <div 
            className="hero-visual"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)'
            }}
          >
            <div 
              className="card"
              style={{
                background: 'var(--card-glass)',
                backdropFilter: 'blur(8px)',
                borderColor: 'var(--color-border)',
                padding: 'var(--space-8)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-brand-primary)', textTransform: 'uppercase' }}>
                  Educational Pillars
                </span>
                <span className="eyebrow eyebrow-teal" style={{ margin: 0 }}>
                  Active Learning
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-brand-primary-soft)', color: 'var(--color-brand-primary)' }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 'var(--text-base)', marginBottom: '2px' }}>Mathematics & Mental Skills</h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Abacus and Vedic calculation methods to nurture intuition, focus, and speed.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-teal-soft)', color: 'var(--color-accent-teal)' }}>
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 'var(--text-base)', marginBottom: '2px' }}>AI Coding & Robotics</h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Physical computing, sensor circuits, and logic foundations for modern young creators.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-amber-highlight-soft)', color: '#B45309' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 'var(--text-base)', marginBottom: '2px' }}>Penmanship & Communication</h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Disciplined handwriting in English and Devanagari script for academic excellence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .hero-grid {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
        }
      `}</style>
    </section>
  );
};
