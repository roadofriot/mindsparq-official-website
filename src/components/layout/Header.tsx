import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ArrowRight, User, Shield } from 'lucide-react';
import { navItems } from '../../content/navigation';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useThemeContext();
  const { user, isStaff } = useAuth();
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
            gap: 'var(--space-4)'
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                color: isActive ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
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

        {/* Actions (Auth status, Theme toggle + CTA) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* User Auth link */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {isStaff && (
                <Link
                  to="/admin"
                  className="desktop-cta"
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#d97706',
                    fontSize: 'var(--font-xs)',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Shield size={14} /> Admin
                </Link>
              )}
              <Link
                to="/learner"
                title="Learner Dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <User size={16} />
                <span className="desktop-cta" style={{ display: 'none' }}>Portal</span>
              </Link>
            </div>
          ) : (
            <Link
              to="/auth"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <User size={16} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Theme Switch Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast), border-color var(--transition-fast)'
            }}
          >
            {theme === 'light' ? (
              <Moon size={18} aria-hidden="true" />
            ) : (
              <Sun size={18} aria-hidden="true" style={{ color: '#f59e0b' }} />
            )}
          </button>

          {/* Primary CTA (Desktop) */}
          <NavLink
            to="/contact"
            className="btn btn-primary desktop-cta"
            style={{ display: 'none' }}
          >
            <span>Enquire</span>
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
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
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
                  fontSize: 'var(--font-base)',
                  fontWeight: 600,
                  color: isActive ? 'var(--color-primary-600)' : 'var(--color-text)',
                  backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
                  textDecoration: 'none'
                })}
              >
                {item.label}
                <ArrowRight size={16} aria-hidden="true" />
              </NavLink>
            ))}

            {user ? (
              <>
                <Link
                  to="/learner"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: 'var(--color-text)'
                  }}
                >
                  <span>Learner Dashboard</span>
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
                      padding: '12px 16px',
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
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: 'var(--color-primary-600)'
                }}
              >
                <span>Sign In / Register</span>
                <User size={16} />
              </Link>
            )}
            
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
