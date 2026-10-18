import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight, School } from 'lucide-react';

import { SiteSection } from '../../services/siteCustomizerService';

interface InquiryCtaProps {
  section?: SiteSection;
}

export const InquiryCta: React.FC<InquiryCtaProps> = ({ section }) => {
  const content = section?.content_json || {};
  const eyebrowText = section?.badge || 'Admissions & School Inquiries';
  const titleText = section?.title || 'Have Questions About Programs, Schedules, or School Collaboration?';
  const descText = section?.subtitle || 'Whether you are a parent seeking mental math development for your child or a school administrator interested in integrating robotics and AI literacy, we are glad to discuss options.';
  const ctaLabel = section?.layout_style?.ctaButtonText || 'Send An Inquiry';
  const ctaLink = section?.layout_style?.ctaButtonUrl || content.actionUrl || '/contact';

  return (
    <section 
      data-cms-section={section?.id || 'inquiry_cta'}
      style={{
        padding: 'var(--space-16) 0',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)'
      }}
    >
      <div className="container">
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(36, 87, 214, 0.08) 0%, rgba(15, 157, 145, 0.08) 100%)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-12) var(--space-8)',
            textAlign: 'center',
            maxWidth: '960px',
            margin: '0 auto'
          }}
        >
          <div className="eyebrow eyebrow-teal" style={{ marginBottom: 'var(--space-3)' }} data-cms-field="badge">
            <HelpCircle size={14} />
            <span>{eyebrowText}</span>
          </div>

          <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }} data-cms-field="title">
            {titleText}
          </h2>

          <p 
            data-cms-field="subtitle"
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              maxWidth: '680px',
              margin: '0 auto var(--space-8) auto',
              lineHeight: 1.7
            }}
          >
            {descText}
          </p>

          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 'var(--space-4)'
            }}
          >
            <Link to={ctaLink} className="btn btn-primary btn-lg" data-cms-field="cta">
              <span>{ctaLabel}</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/programs" className="btn btn-secondary btn-lg">
              <School size={18} />
              <span>Browse All Programs</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
