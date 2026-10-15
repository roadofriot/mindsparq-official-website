import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MapPin, Target, Eye, Sparkles, Compass, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { siteConfig } from '../content/site';
import { learningPillars } from '../content/programs';

export const AboutPage: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

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
          <div style={{ maxWidth: '780px' }}>
            <div className="eyebrow">
              <Compass size={14} />
              <span>About MindSparQ</span>
            </div>
            <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>
              Empowering Minds, Sparking Innovation
            </h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              {siteConfig.name} is an educational initiative based in Butwal, Nepal. We believe that true mathematical agility, computational logic, and handwriting fluency provide children with enduring confidence for lifelong learning.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-spacing">
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-8)'
            }}
          >
            {/* Mission */}
            <div 
              className="card"
              style={{
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
              }}
            >
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
                <Target size={22} />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)' }}>Our Mission</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                To provide structured, enjoyable, and research-grounded supplementary education that demystifies mathematics and technology. We equip young learners with hands-on cognitive tools, empowering them to think independently, solve problems analytically, and embrace innovation.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-accent-teal)' }} />
                  Nurture mental arithmetic fluency without anxiety
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-accent-teal)' }} />
                  Deliver experiential coding, robotics, and AI foundations
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-accent-teal)' }} />
                  Support local schools with activity-based enrichment programs
                </li>
              </ul>
            </div>

            {/* Vision */}
            <div 
              className="card"
              style={{
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
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
                <Eye size={22} />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)' }}>Our Vision</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                To become a trusted regional and national benchmark for experiential learning in Nepal, recognized for cultivating resilient problem solvers, confident thinkers, and ethical creators capable of thriving in a technology-driven world.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-brand-primary)' }} />
                  Bridge conceptual school mathematics with mental fluency
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-brand-primary)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-brand-primary)' }} />
                  Cultivate future engineers, creators, and leaders
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-brand-primary)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-brand-primary)' }} />
                  Uphold transparency and truth in educational guidance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Approach Anchor Section */}
      <section 
        id="approach" 
        className="section-spacing"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="container">
          <div className="section-header">
            <div className="eyebrow eyebrow-teal">
              <Sparkles size={14} />
              <span>Educational Philosophy</span>
            </div>
            <h2>The MindSparQ Learning Methodology</h2>
            <p>
              We firmly avoid unverified claims, instant shortcuts, or hyperbole. Our methodology is rooted in steady cognitive development and hands-on trial.
            </p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {learningPillars.map((pillar) => (
              <div 
                key={pillar.step}
                className="card"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div 
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 800,
                    color: 'var(--color-brand-primary)',
                    marginBottom: 'var(--space-2)'
                  }}
                >
                  Step {pillar.step}
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Center & Verified Location */}
      <section className="section-spacing">
        <div className="container">
          <div 
            className="card"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-10) var(--space-8)'
            }}
          >
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 'var(--space-8)',
                alignItems: 'center'
              }}
              className="location-grid"
            >
              <div>
                <div className="eyebrow eyebrow-amber">
                  <MapPin size={14} />
                  <span>Physical Presence</span>
                </div>
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>
                  Our Learning Center in Butwal
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>
                  MindSparQ is physically situated in Butwal, Rupandehi. We welcome parents, educators, and community partners to visit our center to explore our abacus models, robotics lab kits, and handwriting workbooks.
                </p>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    marginBottom: 'var(--space-6)'
                  }}
                >
                  <MapPin size={22} style={{ color: 'var(--color-brand-primary)', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                      Location Details
                    </span>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: 0, fontWeight: 600 }}>
                      {siteConfig.location.fullFormatted}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <Link to="/contact" className="btn btn-primary">
                    <span>Contact & Location Directions</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Ethical Standards Commitment */}
              <div 
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-3)' }}>
                  <ShieldCheck size={22} style={{ color: 'var(--color-accent-teal)' }} />
                  <h3 style={{ fontSize: 'var(--text-base)', margin: 0 }}>Commitment to Truth in Education</h3>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>
                  We adhere strictly to factual representations. We do not manufacture student awards, make false claims of international affiliations, or guarantee instant grade improvements.
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Where counselling or DMIT-related discussions are hosted, they are treated strictly as supplementary observational tools for learning style preferences—never as definitive medical or scientific diagnoses.
                </p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 860px) {
            .location-grid {
              grid-template-columns: 1.2fr 0.8fr !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
};
