import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight, ShieldCheck, Mail, Phone } from 'lucide-react';
import { siteConfig } from '../../content/site';
import { footerLinks } from '../../content/navigation';
import { Logo } from './Logo';
import { getPublicVisitorCount } from '../../services/analyticsService';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [visitorCount, setVisitorCount] = useState<number>(() => getPublicVisitorCount());

  useEffect(() => {
    setVisitorCount(getPublicVisitorCount());
  }, []);

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-12)',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-12)'
          }}
        >
          {/* Brand Column */}
          <div style={{ maxWidth: '320px' }}>
            <Logo showTagline={false} />
            <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Empowering Minds, Sparking Innovation. Structured cognitive mathematics, robotics logic, and applied AI education in Nepal.
            </p>
            
            {/* Verified Location Box */}
            <div
              style={{
                marginTop: 'var(--space-5)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}
            >
              <MapPin size={18} style={{ color: 'var(--color-primary-600)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
              <div>
                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                  Registered Center
                </span>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text)', margin: 0, fontWeight: 500 }}>
                  {siteConfig.location.fullFormatted}
                </p>
              </div>
            </div>

            {/* Display phone / email only if verified */}
            {(siteConfig.contact.phone || siteConfig.contact.email) && (
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {siteConfig.contact.phone && (
                  <a href={`tel:${siteConfig.contact.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>
                    <Phone size={15} /> {siteConfig.contact.phone}
                  </a>
                )}
                {siteConfig.contact.email && (
                  <a href={`mailto:${siteConfig.contact.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>
                    <Mail size={15} /> {siteConfig.contact.email}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Programs Links */}
          <div>
            <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)', color: 'var(--color-text)' }}>
              Programs
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {footerLinks.programs.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    style={{
                      fontSize: 'var(--font-sm)',
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)'
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Platform Links */}
          <div>
            <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)', color: 'var(--color-text)' }}>
              Platform
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {footerLinks.learning.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    style={{
                      fontSize: 'var(--font-sm)',
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)'
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organization Links */}
          <div>
            <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)', color: 'var(--color-text)' }}>
              Organization
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    style={{
                      fontSize: 'var(--font-sm)',
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)'
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 'var(--space-4)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-xs)', color: '#10b981', fontWeight: 600 }}>
              <ShieldCheck size={16} /> Verified Learning Pathways
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: 'var(--space-8)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-secondary)'
          }}
        >
          <div>
            © {currentYear} {siteConfig.name}. All rights reserved. Butwal, Nepal.
          </div>

          {/* Public Total Visitor Counter */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)'
            }}
            title="Total visitors engaged with MindSparQ platform"
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'inline-block'
              }}
            />
            Total Visits: <strong style={{ color: 'var(--color-text)' }}>{visitorCount.toLocaleString()}</strong>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
            <Link to="/privacy-policy" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <a 
              href="https://mindsparqeducation.com.np" 
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              mindsparqeducation.com.np <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
