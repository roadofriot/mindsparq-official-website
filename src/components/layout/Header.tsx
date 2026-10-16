import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ArrowRight, 
  User, 
  Shield, 
  Globe, 
  ChevronDown, 
  BookOpen, 
  Calendar, 
  LogOut, 
  GraduationCap
} from 'lucide-react';
import { navItems, exploreNavItems } from '../../content/navigation';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useThemeContext();
  const { user, isStaff, profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSettingsOpen(false);
  }, [location.pathname]);

  // Handle escape key and clicks outside to close dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSettingsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle scroll effect for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getTranslatedLabel = (item: { href: string; label: string }) => {
    switch (item.href) {
      case '/':
        return t('nav.home', item.label);
      case '/about':
        return t('nav.about', item.label);
      case '/programs':
        return t('nav.programs', item.label);
      case '/courses':
        return t('nav.courses', item.label);
      case '/events':
        return t('nav.events', item.label);
      case '/blog':
        return t('nav.blog', item.label);
      case '/contact':
        return t('nav.contact', item.label);
      default:
        return item.label;
    }
  };

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
          height: '68px',
          gap: 'var(--space-4)'
        }}
      >
        {/* Brand Logo */}
        <div style={{ flexShrink: 0 }}>
          <Logo showTagline={false} />
        </div>

        {/* Minimal Desktop Navigation (Strictly 5 Core Links) */}
        <nav 
          aria-label="Main Navigation"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 'var(--space-8)'
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const translatedLabel = getTranslatedLabel(item);

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
                  transition: 'color var(--transition-fast)',
                  whiteSpace: 'nowrap'
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

        {/* Action Controls: Theme + Quick Access Settings Dropdown + Single CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Day / Night Theme Switcher */}
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
              transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
              flexShrink: 0
            }}
          >
            {theme === 'light' ? (
              <Moon size={16} aria-hidden="true" />
            ) : (
              <Sun size={16} aria-hidden="true" style={{ color: '#f59e0b' }} />
            )}
          </button>

          {/* Quick Access & Settings Dropdown (Portals, Language, Explore) */}
          <div ref={dropdownRef} style={{ position: 'relative' }} className="desktop-cta">
            <button
              type="button"
              onClick={() => setSettingsOpen((prev) => !prev)}
              aria-expanded={settingsOpen}
              aria-haspopup="true"
              title="Quick Access: Language & Portals"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: settingsOpen ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Globe size={15} style={{ color: 'var(--color-primary-600)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {language === 'en' ? 'EN' : 'नेपाली'}
              </span>
              {user && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isStaff ? '#f59e0b' : '#10b981',
                    boxShadow: isStaff ? '0 0 6px #f59e0b' : '0 0 6px #10b981'
                  }}
                  title={isStaff ? 'Staff Admin Active' : 'Learner Active'}
                />
              )}
              <ChevronDown 
                size={13} 
                style={{ 
                  transform: settingsOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform var(--transition-fast)',
                  color: 'var(--color-text-secondary)'
                }} 
              />
            </button>

            {/* Floating Dropdown Card */}
            {settingsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '270px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
                  padding: 'var(--space-3)',
                  zIndex: 1100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  animation: 'fadeIn 0.15s ease-out'
                }}
              >
                {/* Language Switch Section */}
                <div>
                  <div 
                    style={{ 
                      fontSize: '0.6875rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      color: 'var(--color-text-secondary)',
                      marginBottom: '6px',
                      paddingLeft: '4px'
                    }}
                  >
                    Language / भाषा
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '4px',
                      backgroundColor: 'var(--color-surface-hover)',
                      padding: '3px',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('en');
                      }}
                      style={{
                        padding: '6px 8px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: language === 'en' ? 'var(--color-primary-600)' : 'transparent',
                        color: language === 'en' ? '#ffffff' : 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: language === 'en' ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('ne');
                      }}
                      style={{
                        padding: '6px 8px',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: language === 'ne' ? 'var(--color-primary-600)' : 'transparent',
                        color: language === 'ne' ? '#ffffff' : 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: language === 'ne' ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      🇳🇵 नेपाली
                    </button>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

                {/* Portals Section */}
                <div>
                  <div 
                    style={{ 
                      fontSize: '0.6875rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      color: 'var(--color-text-secondary)',
                      marginBottom: '6px',
                      paddingLeft: '4px'
                    }}
                  >
                    Portals & Learning
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {user ? (
                      <>
                        <Link
                          to="/learner"
                          onClick={() => setSettingsOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)',
                            textDecoration: 'none',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            transition: 'background-color var(--transition-fast)'
                          }}
                          className="header-dropdown-item"
                        >
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(37, 99, 235, 0.12)',
                              color: 'var(--color-primary-600)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <GraduationCap size={15} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ lineHeight: 1.2 }}>Learner Portal</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {profile?.display_name || user.email}
                            </div>
                          </div>
                        </Link>

                        {isStaff && (
                          <Link
                            to="/admin"
                            onClick={() => setSettingsOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-md)',
                              color: '#d97706',
                              textDecoration: 'none',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              backgroundColor: 'rgba(245, 158, 11, 0.08)',
                              transition: 'background-color var(--transition-fast)'
                            }}
                            className="header-dropdown-item"
                          >
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                color: '#d97706',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Shield size={15} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ lineHeight: 1.2 }}>Admin Console</div>
                              <div style={{ fontSize: '0.6875rem', color: '#b45309' }}>
                                Manage CMS & Platform
                              </div>
                            </div>
                          </Link>
                        )}
                      </>
                    ) : (
                      <Link
                        to="/auth"
                        onClick={() => setSettingsOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--color-text-primary)',
                          textDecoration: 'none',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          transition: 'background-color var(--transition-fast)'
                        }}
                        className="header-dropdown-item"
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(37, 99, 235, 0.12)',
                            color: 'var(--color-primary-600)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <User size={15} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ lineHeight: 1.2 }}>Learner Sign In</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                            Access enrolled courses
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

                {/* Explore Links */}
                <div>
                  <div 
                    style={{ 
                      fontSize: '0.6875rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      color: 'var(--color-text-secondary)',
                      marginBottom: '6px',
                      paddingLeft: '4px'
                    }}
                  >
                    Explore & Insights
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <Link
                      to="/blog"
                      onClick={() => setSettingsOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: 500
                      }}
                      className="header-dropdown-item"
                    >
                      <BookOpen size={14} style={{ color: 'var(--color-primary-600)' }} />
                      <span>Blog & Pedagogical Insights</span>
                    </Link>
                    <Link
                      to="/events"
                      onClick={() => setSettingsOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: 500
                      }}
                      className="header-dropdown-item"
                    >
                      <Calendar size={14} style={{ color: 'var(--color-primary-600)' }} />
                      <span>STEM Events & Exhibitions</span>
                    </Link>
                  </div>
                </div>

                {/* Sign Out if logged in */}
                {user && (
                  <>
                    <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
                    <button
                      type="button"
                      onClick={async () => {
                        setSettingsOpen(false);
                        await signOut();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      className="header-dropdown-item"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Single Clean Primary CTA Button */}
          <NavLink
            to="/contact"
            className="desktop-cta"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)',
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              flexShrink: 0
            }}
          >
            <span>{t('nav.contact', 'Enquire')}</span>
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
            boxShadow: 'var(--shadow-xl)',
            maxHeight: 'calc(100vh - 68px)',
            overflowY: 'auto'
          }}
          className="mobile-menu-panel"
        >
          {/* Mobile Language Switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '3px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                gap: '4px'
              }}
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: language === 'en' ? 'var(--color-primary-600)' : 'transparent',
                  color: language === 'en' ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: language === 'en' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ne')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: language === 'ne' ? 'var(--color-primary-600)' : 'transparent',
                  color: language === 'ne' ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: language === 'ne' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                🇳🇵 नेपाली
              </button>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {/* Primary Core Links */}
            {navItems.map((item) => {
              const translatedLabel = getTranslatedLabel(item);

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

            {/* Secondary Explore Links */}
            <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px dashed var(--color-border)' }}>
              {exploreNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-xs)',
                    fontWeight: 500,
                    color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                    textDecoration: 'none'
                  })}
                >
                  {item.label}
                  <ArrowRight size={12} aria-hidden="true" />
                </NavLink>
              ))}
            </div>

            {/* Portals Section */}
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
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-surface-hover)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GraduationCap size={16} /> Learner Portal
                    </span>
                    <ArrowRight size={14} />
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
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={16} /> Admin Console
                      </span>
                      <ArrowRight size={14} />
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
                    color: 'var(--color-brand-primary)',
                    backgroundColor: 'var(--color-surface-hover)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} /> Sign In to Learner Portal
                  </span>
                  <ArrowRight size={14} />
                </Link>
              )}

              <NavLink
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              >
                <span>{t('nav.contact', 'Enquire Now')}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </NavLink>
            </div>
          </nav>
        </div>
      )}

      {/* Embedded styles for responsive header & dropdown hover */}
      <style>{`
        .header-nav-link:hover {
          color: var(--color-brand-primary) !important;
        }
        .header-dropdown-item:hover {
          background-color: var(--color-surface-hover) !important;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
