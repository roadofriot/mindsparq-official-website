import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Sliders,
  Image,
  BookOpen,
  GraduationCap,
  FileText,
  Calendar,
  MessageSquare,
  Users,
  Share2,
  ShieldAlert,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  Layers,
  Palette,
  UserCheck,
  Search
} from 'lucide-react';
import { AdminAiCopilotDrawer } from './AdminAiCopilotDrawer';
import { AdminUniversalSearch } from './AdminUniversalSearch';

export const AdminLayout: React.FC = () => {
  const { user, profile, roles, isOwner, isAdmin, isSuperAdmin } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K keyboard shortcut to open universal search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'AI Studio & Chatbot', href: '/admin/ai-assistant', icon: Sparkles },
    { label: 'Visual Section Customizer', href: '/admin/sections', icon: Layers },
    { label: 'Theme & Layout Studio', href: '/admin/design', icon: Palette },
    { label: 'Homepage Carousel', href: '/admin/carousel', icon: Sliders },
    { label: 'Ad Rails & Promotions', href: '/admin/ads', icon: Sparkles },
    { label: 'Blog & Articles', href: '/admin/blog', icon: FileText },
    { label: 'Media Library', href: '/admin/media', icon: Image },
    { label: 'Curriculum Programs', href: '/admin/programs', icon: GraduationCap },
    { label: 'Courses & Lessons', href: '/admin/courses', icon: BookOpen },
    { label: 'Events & Workshops', href: '/admin/events', icon: Calendar },
    { label: 'Comment Moderation', href: '/admin/comments', icon: MessageSquare },
    { label: 'Team Profiles', href: '/admin/team', icon: Users },
    { label: 'My Faculty Profile', href: '/admin/profile', icon: UserCheck },
    ...((isSuperAdmin || isOwner)
      ? [
          { label: 'Team & Access', href: '/admin/users', icon: Users },
          { label: 'Security Audit Logs', href: '/admin/audit', icon: ShieldAlert }
        ]
      : []),
    ...(isAdmin || isOwner || isSuperAdmin
      ? [
          { label: 'Settings & Integrations', href: '/admin/settings', icon: Share2 }
        ]
      : [])
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 1050
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        {/* Brand / Logo header */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
              Management Console
            </span>
            <div style={{ fontSize: 'var(--font-base)', fontWeight: 800, color: 'var(--color-text)' }}>
              MindSparQ Admin
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="mobile-close-btn"
            aria-label="Close navigation sidebar"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav style={{ flex: 1, padding: 'var(--space-4) var(--space-3)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/admin'}
                  onClick={() => setSidebarOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-sm)',
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
                    color: isActive ? 'var(--color-primary-600)' : 'var(--color-text)'
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Card & Return to site */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.display_name || user?.email?.split('@')[0]}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-600)'
                }}
              >
                {roles[0] || 'staff'}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '6px',
                cursor: 'pointer',
                color: 'var(--color-text)'
              }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>

          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-xs)',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={14} /> Return to Public Site
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-viewport">
        {/* Top Header Bar */}
        <header
          style={{
            height: '60px',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-6)',
            gap: 'var(--space-4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="admin-hamburger-btn"
              aria-label="Open navigation sidebar"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text)'
              }}
            >
              <Menu size={20} />
            </button>
            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              MindSparQ CMS
            </span>
          </div>

          {/* Universal Admin Content Search Trigger Bar */}
          <div style={{ flex: 1, maxWidth: '480px', margin: '0 var(--space-2)' }}>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="admin-top-search-trigger"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text-secondary)',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <Search size={15} style={{ color: 'var(--color-primary-500, #38bdf8)', flexShrink: 0 }} />
                <span className="search-placeholder-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Search all content, courses, blogs, sections...
                </span>
              </div>
              <kbd
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  marginLeft: '8px',
                  flexShrink: 0
                }}
              >
                Ctrl K
              </kbd>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link to="/learner" style={{ fontSize: 'var(--font-xs)', color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Learner View
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>

      {/* Persistent AI Copilot Side Drawer across all Admin Pages */}
      <AdminAiCopilotDrawer />

      {/* Universal Content Search Modal & Command Palette */}
      <AdminUniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
