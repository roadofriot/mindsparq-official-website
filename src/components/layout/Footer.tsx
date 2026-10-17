import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight, Mail, Phone } from 'lucide-react';
import { siteConfig } from '../../content/site';
import { footerLinks } from '../../content/navigation';
import { Logo } from './Logo';
import { getPublicVisitorCount } from '../../services/analyticsService';
import { SocialLinksBar } from '../ui/SocialLinksBar';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { useSiteTheme } from '../../hooks/useSiteTheme';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  const themeSettings = useSiteTheme();
  const footerConfig = themeSettings.footer;
  const [visitorCount, setVisitorCount] = useState<number>(() => getPublicVisitorCount());

  useEffect(() => {
    setVisitorCount(getPublicVisitorCount());
  }, []);

  // Determine dynamic footer background
  const getFooterBg = () => {
    switch (footerConfig.backgroundTheme) {
      case 'slate':
        return '#0f172a';
      case 'navy':
        return '#0a1128';
      case 'black':
        return '#050811';
      case 'surface':
      default:
        return 'var(--color-surface)';
    }
  };

  // Format dynamic copyright notice with {year} token
  const formatCopyright = () => {
    if (footerConfig.copyrightText) {
      return footerConfig.copyrightText.replace(/\{year\}/g, String(currentYear));
    }
    return `© ${currentYear} ${siteConfig.name}. ${t('footer.all_rights', 'All rights reserved. Butwal, Nepal.')}`;
  };

  const columns = footerConfig.columns && footerConfig.columns.length > 0 ? footerConfig.columns : [
    {
      id: 'col-programs',
      title: 'Programs',
      links: footerLinks.programs
    },
    {
      id: 'col-platform',
      title: 'Platform',
      links: footerLinks.learning
    },
    {
      id: 'col-company',
      title: 'Institutional',
      links: footerLinks.company
    }
  ];

  return (
    <footer
      style={{
        backgroundColor: getFooterBg(),
        borderTop: '1px solid var(--color-border)',
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-12)',
        marginTop: 'auto',
        transition: 'background-color var(--transition-normal)'
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
              {footerConfig.brandDescription || 'Empowering Minds, Sparking Innovation. Structured cognitive mathematics, robotics logic, and applied AI education in Nepal.'}
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
                  {t('footer.registered_center', 'Registered Center')}
                </span>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text)', margin: 0, fontWeight: 500 }}>
                  {footerConfig.registeredCenterText || siteConfig.location.fullFormatted}
                </p>
              </div>
            </div>

            {/* Display phone / email */}
            {(footerConfig.contactPhone || footerConfig.contactEmail || siteConfig.contact.phone || siteConfig.contact.email) && (
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {(footerConfig.contactPhone || siteConfig.contact.phone) && (
                  <a href={`tel:${footerConfig.contactPhone || siteConfig.contact.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>
                    <Phone size={15} /> {footerConfig.contactPhone || siteConfig.contact.phone}
                  </a>
                )}
                {(footerConfig.contactEmail || siteConfig.contact.email) && (
                  <a href={`mailto:${footerConfig.contactEmail || siteConfig.contact.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>
                    <Mail size={15} /> {footerConfig.contactEmail || siteConfig.contact.email}
                  </a>
                )}
              </div>
            )}

            {/* Circular Social Media Channels Bar */}
            {footerConfig.showSocialBadges && (
              <div style={{ marginTop: 'var(--space-5)' }}>
                <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
                  {t('footer.social_connect', 'Connect With Us')}
                </span>
                <SocialLinksBar size="sm" />
              </div>
            )}
          </div>

          {/* Dynamic Link Columns */}
          {columns.map((column) => (
            <div key={column.id || column.title}>
              <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)', color: 'var(--color-text)' }}>
                {column.title}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {column.links.map((link) => (
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
          ))}
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
            {formatCopyright()}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {/* Public Total Visitor Counter */}
            {footerConfig.showVisitorCount && (
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
                {t('footer.total_visits', 'Total Visits')}: <strong style={{ color: 'var(--color-text)' }}>{visitorCount.toLocaleString()}</strong>
              </div>
            )}

            {/* Language Switcher in Footer */}
            <LanguageSwitcher variant="minimal" />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
            <Link to="/privacy-policy" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              {t('footer.privacy', 'Privacy Policy')}
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
