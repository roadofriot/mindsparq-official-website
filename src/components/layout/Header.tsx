import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';
import { navItems } from '../../content/navigation';
import { useThemeContext } from '../../context/ThemeContext';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useThemeContext();
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
      setScrolled(window.scrollY > 20);
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
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled ? 'var(--color-border)' : 'transparent'}`,
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--header-height)' }}>
        <Logo />

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
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions (Theme toggle + CTA) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Theme Switch Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast), border-color var(--transition-fast)'
            }}
          >
            {theme === 'light' ? (
              <Moon size={19} aria-hidden="true" />
            ) : (
              <Sun size={19} aria-hidden="true" style={{ color: 'var(--color-amber-highlight)' }} />
            )}
          </button>

          {/* Primary CTA (Desktop) */}
          <NavLink
            to="/contact"
            className="btn btn-primary desktop-cta"
            style={{ display: 'none' }}
          >
            <span>Enquire Now</span>
            <ArrowRight size={16} aria-hidden="true" />
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
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
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
            boxShadow: 'var(--shadow-lg)'
          }}
          className="mobile-menu-panel"
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                  backgroundColor: isActive ? 'var(--color-brand-primary-soft)' : 'transparent',
                  textDecoration: 'none'
                })}
              >
                {item.label}
                <ArrowRight size={16} aria-hidden="true" />
              </NavLink>
            ))}
            
            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
              <NavLink
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Enquire Now</span>
                <ArrowRight size={16} aria-hidden="true" />
              </NavLink>
            </div>
          </nav>
        </div>
      )}

      {/* Embedded CSS for responsive switching */}
      <style>{`
        @media (min-width: 820px) {
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
