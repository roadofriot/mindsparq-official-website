import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ArrowRight, User, Shield } from 'lucide-react';
import { navItems } from '../../content/navigation';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useThemeContext();
  const { user, isStaff } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Handle scroll effect for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--navbar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'var(--color-border)' : 'rgba(255, 255, 255, 0.08)'}`,
        boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.2)' : 'none',
        transition: 'all var(--transition-fast)'
      }}
    >
      <div 
        className="container" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          height: '68px' 
        }}
      >
        {/* Brand Logo */}
        <Logo showTagline={false} />

        {/* Desktop Navigation */}
        <nav 
          aria-label="Main Navigation"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 'var(--space-6)'
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const translatedLabel = 
              item.href === '/' ? t('nav.home', item.label) :
              item.href === '/about' ? t('nav.about', item.label) :
              item.href === '/programs' ? t('nav.programs', item.label) :
              item.href === '/courses' ? t('nav.courses', item.label) :
              item.href === '/events' ? t('nav.events', item.label) :
              item.href === '/blog' ? t('nav.blog', item.label) :
              item.href === '/contact' ? t('nav.contact', item.label) : item.label;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  position: 'relative',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  padding: '8px 2px',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)'
                })}
              >
                {({ isActive }) => (
                  <>
                    <span>{translatedLabel}</span>
                    {isActive && (
                      <span 
                        style={{
                          position: 'absolute',
                          bottom: '-6px',
                          left: '0',
                          right: '0',
                          height: '2px',
                          borderRadius: '2px',
                          background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
                          boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)'
                        }} 
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Language Switcher */}
          <LanguageSwitcher variant="minimal" />

          {/* Minimal Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast), border-color var(--transition-fast)'
            }}
          >
            {theme === 'light' ? (
              <Moon size={16} aria-hidden="true" />
            ) : (
              <Sun size={16} aria-hidden="true" style={{ color: '#f59e0b' }} />
            )}
          </button>

          {/* User Auth Portal Link / Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isStaff && (
                <Link
                  to="/admin"
                  className="desktop-cta"
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    color: '#d97706',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Shield size={13} /> Admin
                </Link>
              )}
              <Link
                to="/learner"
                title="Learner Dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <User size={14} />
                <span className="desktop-cta" style={{ display: 'none' }}>Portal</span>
              </Link>
            </div>
          ) : (
            <Link
              to="/auth"
              className="desktop-cta"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'border-color var(--transition-fast), background-color var(--transition-fast)'
              }}
            >
              <span>Sign In</span>
            </Link>
          )}

          {/* Primary CTA Button: Enquire -> (Pill shaped gradient button) */}
          <NavLink
            to="/contact"
            className="desktop-cta"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 18px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)',
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
            }}
          >
            <span>Enquire</span>
            <ArrowRight size={14} aria-hidden="true" />
          </NavLink>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
            className="mobile-menu-toggle"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--space-6) var(--space-4)',
            boxShadow: 'var(--shadow-xl)'
          }}
          className="mobile-menu-panel"
        >
          {/* Mobile Language Switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <LanguageSwitcher variant="pill" />
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {navItems.map((item) => {
              const translatedLabel = 
                item.href === '/' ? t('nav.home', item.label) :
                item.href === '/about' ? t('nav.about', item.label) :
                item.href === '/programs' ? t('nav.programs', item.label) :
                item.href === '/courses' ? t('nav.courses', item.label) :
                item.href === '/events' ? t('nav.events', item.label) :
                item.href === '/blog' ? t('nav.blog', item.label) :
                item.href === '/contact' ? t('nav.contact', item.label) : item.label;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-sm)',
                    fontWeight: 600,
                    color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                    backgroundColor: isActive ? 'var(--color-brand-primary-soft)' : 'transparent',
                    textDecoration: 'none'
                  })}
                >
                  {translatedLabel}
                  <ArrowRight size={14} aria-hidden="true" />
                </NavLink>
              );
            })}

            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {user ? (
                <>
                  <Link
                    to="/learner"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <span>Learner Portal</span>
                    <User size={16} />
                  </Link>
                  {isStaff && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                        textDecoration: 'none',
                        color: '#d97706',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)'
                      }}
                    >
                      <span>Admin Console</span>
                      <Shield size={16} />
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: 'var(--color-brand-primary)'
                  }}
                >
                  <span>Sign In / Register</span>
                  <User size={16} />
                </Link>
              )}

              <NavLink
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              >
                <span>Enquire Now</span>
                <ArrowRight size={15} aria-hidden="true" />
              </NavLink>
            </div>
          </nav>
        </div>
      )}

      {/* Embedded styles for responsive header */}
      <style>{`
        .header-nav-link:hover {
          color: var(--color-brand-primary) !important;
        }
        @media (min-width: 960px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-cta {
            display: inline-flex !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
          .mobile-menu-panel {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
