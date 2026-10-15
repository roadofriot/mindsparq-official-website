import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight, ShieldCheck, Mail, Phone } from 'lucide-react';
import { siteConfig } from '../../content/site';
import { footerLinks } from '../../content/navigation';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

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
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-12)',
            marginBottom: 'var(--space-12)'
          }}
        >
          {/* Brand Column */}
          <div style={{ maxWidth: '360px' }}>
            <Logo showTagline={false} />
            <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              Empowering Minds, Sparking Innovation. Providing structured mental arithmetic, computational thinking, robotics, and lifelong skill development for learners and educators.
            </p>
            
            {/* Verified Location Box */}
            <div
              style={{
                marginTop: 'var(--space-5)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}
            >
              <MapPin size={18} style={{ color: 'var(--color-brand-primary)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
              <div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Registered Location
                </span>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', margin: 0, fontWeight: 500 }}>
                  {siteConfig.location.fullFormatted}
                </p>
              </div>
            </div>

            {/* Display phone / email only if verified */}
            {(siteConfig.contact.phone || siteConfig.contact.email) && (
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {siteConfig.contact.phone && (
                  <a href={`tel:${siteConfig.contact.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)' }}>
                    <Phone size={15} /> {siteConfig.contact.phone}
                  </a>
                )}
                {siteConfig.contact.email && (
                  <a href={`mailto:${siteConfig.contact.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)' }}>
                    <Mail size={15} /> {siteConfig.contact.email}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Programs Links */}
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
              Learning Programs
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {footerLinks.programs.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional & Quick Links */}
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
              Organization
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Commitment & Ethics Note */}
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
              Educational Integrity
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              MindSparQ operates on verifiable pedagogy, active problem solving, and truthful educational outcomes. We do not make guaranteed academic claims, ensuring transparent collaboration with families and schools.
            </p>
            <div style={{ marginTop: 'var(--space-4)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--color-accent-teal)', fontWeight: 600 }}>
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
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)'
          }}
        >
          <div>
            © {currentYear} {siteConfig.name}. All rights reserved. Nepal.
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
            <Link to="/privacy-policy" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <a 
              href="https://mindsparqeducation.com.np" 
              style={{ color: 'var(--color-text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              mindsparqeducation.com.np <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
