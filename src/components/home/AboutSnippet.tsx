import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { siteConfig } from '../../content/site';

import { SiteSection } from '../../services/siteCustomizerService';

interface AboutSnippetProps {
  section?: SiteSection;
}

export const AboutSnippet: React.FC<AboutSnippetProps> = ({ section }) => {
  const content = section?.content_json || {};
  const eyebrowText = section?.badge || 'About MindSparQ';
  const headlineText = section?.title || 'Empowering Minds, Sparking Innovation in Nepal';
  const paragraph1 = content.paragraph1 || (section?.subtitle ? section.subtitle : `${siteConfig.name} is dedicated to modernizing supplementary education. By uniting mental math mastery (Abacus & Vedic Mathematics) with 21st-century technology competencies (AI literacy, coding, and robotics), we equip students with the durable analytical mindset necessary for a rapidly evolving world.`);
  const paragraph2 = content.paragraph2 || `Headquartered at ${siteConfig.location.fullFormatted}, our programs serve individual learners, family cohorts, and school partnerships seeking elevated learning experiences.`;
  const locationText = content.location || siteConfig.location.fullFormatted;
  const founderText = content.founder || siteConfig.founder.name;

  return (
    <section className="section-spacing" style={{ backgroundColor: 'var(--color-bg)' }} data-cms-section={section?.id || 'about_snippet'}>
      <div className="container">
        <div 
          className="card"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            padding: 'var(--space-12) var(--space-8)',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 'var(--space-8)',
              alignItems: 'center'
            }}
            className="about-snippet-grid"
          >
            <div>
              <div className="eyebrow" data-cms-field="badge">
                <span>{eyebrowText}</span>
              </div>
              <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }} data-cms-field="title">
                {headlineText}
              </h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-4)' }} data-cms-field="paragraph1">
                {paragraph1}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }} data-cms-field="paragraph2">
                {paragraph2}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <Link to="/about" className="btn btn-secondary">
                  <span>Learn More About Our Mission</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="btn btn-primary">
                  <span>Inquire About Programs</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Credibility Box */}
            <div 
              style={{
                backgroundColor: 'var(--color-surface-elevated)',
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-brand-primary-soft)', color: 'var(--color-brand-primary)' }}>
                  <Award size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-base)', margin: 0 }}>Core Institutional Values</h4>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Innovation • Quality • Integrity • Growth</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                <MapPin size={16} style={{ color: 'var(--color-brand-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Registered Center:</strong> <span data-cms-field="location">{locationText}</span>
                  <div style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Founder & CEO: <span data-cms-field="founder">{founderText}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--color-accent-teal)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Ethical Reporting & Portal:</strong> Official domain <strong>{siteConfig.domain}</strong>. All curriculum pathways, hardware labs, and partnership agreements are grounded in verified academic standards.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .about-snippet-grid {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
        }
      `}</style>
    </section>
  );
};
