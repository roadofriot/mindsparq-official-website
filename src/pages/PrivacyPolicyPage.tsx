import React, { useEffect } from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../content/site';
import { updatePageSeo } from '../utils/seo';

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    updatePageSeo({
      title: 'Privacy Policy & Student Data Protection',
      description: 'Information handling, cookie policies, and learner data protection standards at MindSparQ Education & Technology.',
      canonicalPath: '/privacy-policy',
      ogType: 'website'
    });
  }, []);

  return (
    <div style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Header */}
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
              <ShieldCheck size={14} />
              <span>Data Protection & Privacy</span>
            </div>
            <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              This policy describes how {siteConfig.name} handles information collected through our official website ({siteConfig.domain}). We prioritize minimal data collection and respectful student privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-spacing">
        <div className="container" style={{ maxWidth: '840px' }}>
          <div 
            className="card"
            style={{
              backgroundColor: 'var(--color-surface)',
              padding: 'var(--space-10) var(--space-8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-8)'
            }}
          >
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} style={{ color: 'var(--color-brand-primary)' }} />
                1. Information We Collect
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                We collect only the information you voluntarily submit when requesting program information or submitting inquiries through our contact forms:
              </p>
              <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-accent-teal)' }} />
                  Full name and preferred contact detail (email or telephone)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-accent-teal)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-accent-teal)' }} />
                  Nature of inquiry and program of interest
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-accent-teal)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--color-accent-teal)' }} />
                  Message notes regarding student age range or school requirements
                </li>
              </ul>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} style={{ color: 'var(--color-accent-teal)' }} />
                2. Protection of Children’s Privacy
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                We never request nor collect sensitive identifying documents, national identity cards, government numbers, health records, or biometric data through our public website. Inquiries regarding minors must be initiated by parents, guardians, or authorized school representatives.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: 'var(--color-amber-highlight)' }} />
                3. Cookies & Local Storage
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                We do not employ third-party tracking pixels, behavioural cross-site tracking scripts, or ad profiling. We utilize standard local browser storage solely to remember your chosen theme preference (Light or Dark mode) between page visits.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
                4. Data Sharing & Third Parties
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                {siteConfig.name} will never sell, rent, or trade your contact information to third parties. Information provided is strictly used by our program coordinators in Nepal to respond to your questions and arrange consultations.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
                5. Questions & Updates
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                If you have questions regarding this privacy policy or wish to amend any details submitted during a program inquiry, please contact our administrative desk at {siteConfig.location.fullFormatted}.
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                Effective Date: October 2026 | MindSparQ Education & Technology
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
