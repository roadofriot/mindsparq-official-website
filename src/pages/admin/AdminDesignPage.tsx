import React, { useState, useEffect } from 'react';
import {
  MindSparQThemeSettings,
  getSiteThemeSettings,
  saveSiteThemeSettings,
  resetSiteThemeSettings,
  HeadingFontOption,
  BodyFontOption,
  BorderRadiusOption,
  NavMenuItem
} from '../../services/siteThemeService';
import {
  Palette,
  Check,
  RotateCcw,
  Type,
  Layout,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Trash2,
  Megaphone,
  Compass,
  FileText,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

type ActiveTab = 'header' | 'footer' | 'typography' | 'preview';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export const AdminDesignPage: React.FC = () => {
  const [themeSettings, setThemeSettings] = useState<MindSparQThemeSettings>(() => getSiteThemeSettings());
  const [activeTab, setActiveTab] = useState<ActiveTab>('header');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [savedNotice, setSavedNotice] = useState(false);
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavHref, setNewNavHref] = useState('');

  useEffect(() => {
    setThemeSettings(getSiteThemeSettings());
  }, []);

  const handleUpdate = (updated: MindSparQThemeSettings) => {
    setThemeSettings(updated);
    saveSiteThemeSettings(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Reset all theme, header, footer, and typography settings to factory MindSparQ defaults?')) return;
    const restored = resetSiteThemeSettings();
    setThemeSettings(restored);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Header Handlers
  const updateHeader = (partial: Partial<MindSparQThemeSettings['header']>) => {
    handleUpdate({
      ...themeSettings,
      header: { ...themeSettings.header, ...partial }
    });
  };

  // Add custom nav item
  const handleAddNavItem = () => {
    if (!newNavLabel.trim() || !newNavHref.trim()) return;
    const newItem: NavMenuItem = {
      id: `nav-${Date.now()}`,
      label: newNavLabel.trim(),
      href: newNavHref.trim()
    };
    updateHeader({
      customNavItems: [...themeSettings.header.customNavItems, newItem]
    });
    setNewNavLabel('');
    setNewNavHref('');
  };

  // Remove nav item
  const handleRemoveNavItem = (id: string) => {
    updateHeader({
      customNavItems: themeSettings.header.customNavItems.filter((i) => i.id !== id)
    });
  };

  // Footer Handlers
  const updateFooter = (partial: Partial<MindSparQThemeSettings['footer']>) => {
    handleUpdate({
      ...themeSettings,
      footer: { ...themeSettings.footer, ...partial }
    });
  };

  // Typography Handlers
  const updateTypography = (partial: Partial<MindSparQThemeSettings['typography']>) => {
    handleUpdate({
      ...themeSettings,
      typography: { ...themeSettings.typography, ...partial }
    });
  };

  const curatedPalettes: Array<{ name: string; hex: string; desc: string }> = [
    { name: 'Ocean Blue', hex: '#2457D6', desc: 'Classical institutional STEAM confidence' },
    { name: 'Cyber Cyan', hex: '#0284C7', desc: 'Applied AI, future robotics, edge technology' },
    { name: 'Emerald STEM', hex: '#059669', desc: 'Growth, cognitive exploration, living logic' },
    { name: 'Royal Indigo', hex: '#4F46E5', desc: 'Mathematical rigor, elegance, academic depth' },
    { name: 'Electric Amber', hex: '#D97706', desc: 'Youthful dynamism, creative energy' }
  ];

  const headingFontOptions: HeadingFontOption[] = ['Inter', 'Outfit', 'Plus Jakarta Sans', 'Roboto', 'Merriweather'];
  const bodyFontOptions: BodyFontOption[] = ['Inter', 'Roboto', 'Plus Jakarta Sans', 'System'];
  const radiusOptions: Array<{ key: BorderRadiusOption; label: string; desc: string }> = [
    { key: 'sharp', label: 'Sharp (2px - 4px)', desc: 'Architectural, minimal precision' },
    { key: 'modern', label: 'Modern (6px - 10px)', desc: 'Balanced, standard enterprise aesthetic' },
    { key: 'rounded', label: 'Rounded (8px - 14px)', desc: 'Friendly, accessible educational warmth' },
    { key: 'squircle', label: 'Squircle (10px - 18px)', desc: 'Apple-grade continuous curvature' }
  ];

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              WordPress-Grade Theme & Layout Studio
            </h1>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(36, 87, 214, 0.12)',
                color: 'var(--color-primary-600)',
                border: '1px solid rgba(36, 87, 214, 0.3)'
              }}
            >
              Live Synchronized
            </span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', margin: '4px 0 0' }}>
            Fine-tune header height, logo scale, top announcement banner, navigation menu, footer columns, and global typography across the entire site.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link to="/" target="_blank" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ExternalLink size={15} />
            <span>View Live Site</span>
          </Link>
          <button type="button" onClick={handleResetDefaults} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {savedNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--font-sm)',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span>Theme settings saved and broadcast live to all components!</span>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            backgroundColor: activeTab === 'header' ? 'var(--color-surface)' : 'transparent',
            borderBottom: activeTab === 'header' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
            color: activeTab === 'header' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
            cursor: 'pointer'
          }}
        >
          <Sliders size={16} />
          <span>1. Header & Navigation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('footer')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            backgroundColor: activeTab === 'footer' ? 'var(--color-surface)' : 'transparent',
            borderBottom: activeTab === 'footer' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
            color: activeTab === 'footer' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
            cursor: 'pointer'
          }}
        >
          <Layout size={16} />
          <span>2. Footer & Organization</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('typography')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            backgroundColor: activeTab === 'typography' ? 'var(--color-surface)' : 'transparent',
            borderBottom: activeTab === 'typography' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
            color: activeTab === 'typography' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
            cursor: 'pointer'
          }}
        >
          <Type size={16} />
          <span>3. Typography & Palettes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: 'none',
            backgroundColor: activeTab === 'preview' ? 'var(--color-surface)' : 'transparent',
            borderBottom: activeTab === 'preview' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
            color: activeTab === 'preview' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: 'var(--font-sm)',
            cursor: 'pointer'
          }}
        >
          <Eye size={16} />
          <span>4. Live Responsive Frame</span>
        </button>
      </div>

      {/* TAB 1: HEADER & NAVIGATION */}
      {activeTab === 'header' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Header Geometry & Sizing */}
          <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} style={{ color: 'var(--color-primary-600)' }} />
              Header Dimensions & Positioning
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
              {/* Header Height Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Header Container Height: <strong>{themeSettings.header.height}px</strong>
                  </label>
                </div>
                <input
                  type="range"
                  min="56"
                  max="96"
                  step="2"
                  value={themeSettings.header.height}
                  onChange={(e) => updateHeader({ height: Number(e.target.value) })}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                  Default is 68px. Range: 56px (ultra-compact) to 96px (spacious branding).
                </span>
              </div>

              {/* Logo Sizing Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Brand Logo Icon Size: <strong>{themeSettings.header.logoHeight}px</strong>
                  </label>
                </div>
                <input
                  type="range"
                  min="28"
                  max="64"
                  step="2"
                  value={themeSettings.header.logoHeight}
                  onChange={(e) => updateHeader({ logoHeight: Number(e.target.value) })}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                  Default is 42px. Range: 28px (subtle) to 64px (prominent icon).
                </span>
              </div>
            </div>

            {/* Sticky Header Toggle */}
            <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>Sticky Floating Header</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                  Keep the header visible at the top with glassmorphic blur when the user scrolls down the page.
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={themeSettings.header.isSticky}
                  onChange={(e) => updateHeader({ isSticky: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: themeSettings.header.isSticky ? 'var(--color-primary-600)' : 'var(--color-border)',
                    borderRadius: '24px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      height: '18px',
                      width: '18px',
                      left: themeSettings.header.isSticky ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.2s'
                    }}
                  />
                </span>
              </label>
            </div>
          </div>

          {/* Top Announcement Bar */}
          <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={18} style={{ color: 'var(--color-primary-600)' }} />
                Top Announcement Ribbon Banner
              </h2>

              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={themeSettings.header.showAnnouncement}
                  onChange={(e) => updateHeader({ showAnnouncement: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: themeSettings.header.showAnnouncement ? 'var(--color-primary-600)' : 'var(--color-border)',
                    borderRadius: '24px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      height: '18px',
                      width: '18px',
                      left: themeSettings.header.showAnnouncement ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.2s'
                    }}
                  />
                </span>
              </label>
            </div>

            {themeSettings.header.showAnnouncement ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    Announcement Message
                  </label>
                  <input
                    type="text"
                    value={themeSettings.header.announcementText}
                    onChange={(e) => updateHeader({ announcementText: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="e.g. 🚀 Spring 2026 Admissions Open for Robotics & AI Foundations!"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                      Target CTA Route / Link
                    </label>
                    <input
                      type="text"
                      value={themeSettings.header.announcementLink}
                      onChange={(e) => updateHeader({ announcementLink: e.target.value })}
                      className="input-field"
                      style={{ width: '100%' }}
                      placeholder="e.g. /courses or /contact"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                      Banner Background Color
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={themeSettings.header.announcementBg}
                        onChange={(e) => updateHeader({ announcementBg: e.target.value })}
                        style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={themeSettings.header.announcementBg}
                        onChange={(e) => updateHeader({ announcementBg: e.target.value })}
                        className="input-field"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                Top announcement ribbon is currently disabled. Toggle the switch to activate a site-wide broadcast banner.
              </div>
            )}
          </div>

          {/* Desktop & Mobile Direct Action Button (CTA) */}
          <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} style={{ color: 'var(--color-primary-600)' }} />
                Header Call-to-Action (CTA) Button
              </h2>

              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={themeSettings.header.showCtaButton}
                  onChange={(e) => updateHeader({ showCtaButton: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: themeSettings.header.showCtaButton ? 'var(--color-primary-600)' : 'var(--color-border)',
                    borderRadius: '24px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      height: '18px',
                      width: '18px',
                      left: themeSettings.header.showCtaButton ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.2s'
                    }}
                  />
                </span>
              </label>
            </div>

            {themeSettings.header.showCtaButton && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={themeSettings.header.ctaButtonText}
                    onChange={(e) => updateHeader({ ctaButtonText: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="e.g. Enroll Now"
                  />
                </div>

                <div>
                  <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    Target Link / Destination
                  </label>
                  <input
                    type="text"
                    value={themeSettings.header.ctaButtonLink}
                    onChange={(e) => updateHeader({ ctaButtonLink: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="e.g. /contact or /courses"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Menu Hierarchy Manager */}
          <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: 'var(--color-primary-600)' }} />
              Main Navigation Menu Manager
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'var(--space-4)' }}>
              {themeSettings.header.customNavItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-text-secondary)', width: '20px' }}>
                      #{idx + 1}
                    </span>
                    <strong style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>{item.label}</strong>
                    <code style={{ fontSize: '0.6875rem', backgroundColor: 'var(--color-surface-hover)', padding: '2px 6px', borderRadius: '4px' }}>
                      {item.href}
                    </code>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveNavItem(item.id)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Remove navigation item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new navigation item */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px dashed var(--color-border)' }}>
              <input
                type="text"
                placeholder="Item Label (e.g. Careers)"
                value={newNavLabel}
                onChange={(e) => setNewNavLabel(e.target.value)}
                className="input-field"
                style={{ flex: 1, minWidth: '160px' }}
              />
              <input
                type="text"
                placeholder="Path (e.g. /careers)"
                value={newNavHref}
                onChange={(e) => setNewNavHref(e.target.value)}
                className="input-field"
                style={{ flex: 1, minWidth: '160px' }}
              />
              <button
                type="button"
                onClick={handleAddNavItem}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOOTER & ORGANIZATION */}
      {activeTab === 'footer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Mission & Address */}
          <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layout size={18} style={{ color: 'var(--color-primary-600)' }} />
              Footer Branding & Identity Copy
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Brand Mission Blurb
                </label>
                <textarea
                  value={themeSettings.footer.brandDescription}
                  onChange={(e) => updateFooter({ brandDescription: e.target.value })}
                  className="input-field"
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Empowering Minds, Sparking Innovation..."
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Registered Center Address Label
                </label>
                <input
                  type="text"
                  value={themeSettings.footer.registeredCenterText}
                  onChange={(e) => updateFooter({ registeredCenterText: e.target.value })}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    Hotline Phone
                  </label>
                  <input
                    type="text"
                    value={themeSettings.footer.contactPhone}
                    onChange={(e) => updateFooter({ contactPhone: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={themeSettings.footer.contactEmail}
                    onChange={(e) => updateFooter({ contactEmail: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Notice & Controls */}
          <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
              Legal Notice & Footer Toggles
            </h2>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Copyright Text (Supports <code>{'{year}'}</code> variable)
              </label>
              <input
                type="text"
                value={themeSettings.footer.copyrightText}
                onChange={(e) => updateFooter({ copyrightText: e.target.value })}
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-hover)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Show Public Visitor Counter</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>Displays total analytics counter badge</div>
                </div>
                <input
                  type="checkbox"
                  checked={themeSettings.footer.showVisitorCount}
                  onChange={(e) => updateFooter({ showVisitorCount: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-hover)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Show Circular Social Media Bar</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>Renders verified social media profile icons</div>
                </div>
                <input
                  type="checkbox"
                  checked={themeSettings.footer.showSocialBadges}
                  onChange={(e) => updateFooter({ showSocialBadges: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Footer Background Tone Selector */}
            <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
              <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Footer Surface Tone
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                {(['surface', 'slate', 'navy', 'black'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => updateFooter({ backgroundTheme: tone })}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: themeSettings.footer.backgroundTheme === tone ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      backgroundColor: tone === 'slate' ? '#0f172a' : tone === 'navy' ? '#0a1128' : tone === 'black' ? '#050811' : 'var(--color-surface)',
                      color: tone === 'surface' ? 'var(--color-text)' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {tone} Theme
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TYPOGRAPHY & PALETTES */}
      {activeTab === 'typography' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Brand Primary Color */}
          <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={18} style={{ color: 'var(--color-primary-600)' }} />
              Primary Brand Accent Color
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              {curatedPalettes.map((p) => {
                const isSelected = themeSettings.typography.primaryColor.toLowerCase() === p.hex.toLowerCase();
                return (
                  <div
                    key={p.name}
                    onClick={() => updateTypography({ primaryColor: p.hex })}
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'rgba(36, 87, 214, 0.05)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: p.hex }} />
                      {isSelected && <Check size={16} color="var(--color-primary-600)" />}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: '2px' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {p.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heading & Body Typography Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'var(--space-6)' }}>
            {/* Heading Font */}
            <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Type size={18} style={{ color: 'var(--color-primary-600)' }} />
                Heading Display Font
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {headingFontOptions.map((font) => {
                  const isSelected = themeSettings.typography.headingFont === font;
                  return (
                    <div
                      key={font}
                      onClick={() => updateTypography({ headingFont: font })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'rgba(36, 87, 214, 0.05)' : 'var(--color-surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: font }}>{font}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                          Cognitive Science & Robotics
                        </div>
                      </div>
                      {isSelected && <Check size={16} color="var(--color-primary-600)" />}
                    </div>
                  );
                })}
              </div>

              {/* Body Font Selection */}
              <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  Body & Paragraph Font
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {bodyFontOptions.map((bFont) => {
                    const isSelected = themeSettings.typography.bodyFont === bFont;
                    return (
                      <div
                        key={bFont}
                        onClick={() => updateTypography({ bodyFont: bFont })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? 'rgba(36, 87, 214, 0.05)' : 'var(--color-surface)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{bFont}</span>
                        {isSelected && <Check size={14} color="var(--color-primary-600)" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Corner Curvature & Max Width */}
            <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layout size={18} style={{ color: 'var(--color-primary-600)' }} />
                Corner Curvature & Containers
              </h2>

              <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Border Radius Preset
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'var(--space-4)' }}>
                {radiusOptions.map((r) => {
                  const isSelected = themeSettings.typography.borderRadiusPreset === r.key;
                  return (
                    <div
                      key={r.key}
                      onClick={() => updateTypography({ borderRadiusPreset: r.key })}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'rgba(36, 87, 214, 0.05)' : 'var(--color-surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{r.label}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{r.desc}</div>
                      </div>
                      {isSelected && <Check size={14} color="var(--color-primary-600)" />}
                    </div>
                  );
                })}
              </div>

              <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Container Max Width
              </label>
              <select
                value={themeSettings.typography.containerMaxWidth}
                onChange={(e) => updateTypography({ containerMaxWidth: e.target.value as any })}
                className="input-field"
                style={{ width: '100%' }}
              >
                <option value="1120px">Compact (1120px) — Tight readability focus</option>
                <option value="1200px">Standard (1200px) — Balanced corporate default</option>
                <option value="1280px">Roomy (1280px) — Modern expansive canvas</option>
                <option value="1440px">Wide (1440px) — Full high-res monitors</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE RESPONSIVE SIMULATION FRAME */}
      {activeTab === 'preview' && (
        <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          {/* Device Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, margin: 0 }}>
                Live Responsive Frame Simulator
              </h2>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                Simulate how your customized header, announcement ribbon, and footer render across real viewport sizes.
              </p>
            </div>

            <div style={{ display: 'inline-flex', padding: '4px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: previewDevice === 'desktop' ? 'var(--color-primary-600)' : 'transparent',
                  color: previewDevice === 'desktop' ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Monitor size={14} /> Desktop (100%)
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: previewDevice === 'tablet' ? 'var(--color-primary-600)' : 'transparent',
                  color: previewDevice === 'tablet' ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Tablet size={14} /> Tablet (768px)
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: previewDevice === 'mobile' ? 'var(--color-primary-600)' : 'transparent',
                  color: previewDevice === 'mobile' ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Smartphone size={14} /> Mobile (375px)
              </button>
            </div>
          </div>

          {/* Viewport Frame */}
          <div
            style={{
              width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
              margin: '0 auto',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              backgroundColor: 'var(--color-bg)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Simulated Top Announcement Bar */}
            {themeSettings.header.showAnnouncement && (
              <div
                style={{
                  backgroundColor: themeSettings.header.announcementBg,
                  color: '#ffffff',
                  padding: '8px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                {themeSettings.header.announcementText}
              </div>
            )}

            {/* Simulated Header */}
            <div
              style={{
                height: `${themeSettings.header.height}px`,
                backgroundColor: 'var(--navbar-bg)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: `${themeSettings.header.logoHeight}px`, height: `${themeSettings.header.logoHeight}px`, borderRadius: '8px', backgroundColor: '#070E1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/icon-192.png" alt="Logo" width={themeSettings.header.logoHeight} height={themeSettings.header.logoHeight} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <strong style={{ fontSize: '1rem', fontFamily: themeSettings.typography.headingFont }}>
                  MindSpar<span style={{ color: themeSettings.typography.primaryColor }}>Q</span>
                </strong>
              </div>

              {previewDevice === 'desktop' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', fontWeight: 600 }}>
                  {themeSettings.header.customNavItems.slice(0, 5).map((item) => (
                    <span key={item.id} style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                  ))}
                  {themeSettings.header.showCtaButton && (
                    <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: themeSettings.typography.primaryColor, color: '#ffffff', fontSize: '11px', fontWeight: 700 }}>
                      {themeSettings.header.ctaButtonText}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ padding: '6px', borderRadius: '50%', border: '1px solid var(--color-border)', fontSize: '12px' }}>
                  ☰
                </div>
              )}
            </div>

            {/* Simulated Content Area */}
            <div style={{ padding: '32px 16px', textAlign: 'center', backgroundColor: 'var(--color-surface)' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: themeSettings.typography.headingFont, marginBottom: '8px' }}>
                MindSparQ Education & Technology
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto 16px' }}>
                Live rendered simulation reflecting your custom header dimensions, typography, and color tokens.
              </p>
              <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 'var(--radius-md)', backgroundColor: themeSettings.typography.primaryColor, color: '#ffffff', fontSize: '0.75rem', fontWeight: 700 }}>
                {themeSettings.header.ctaButtonText || 'Explore Courses'}
              </span>
            </div>

            {/* Simulated Footer */}
            <div
              style={{
                backgroundColor: themeSettings.footer.backgroundTheme === 'slate' ? '#0f172a' : themeSettings.footer.backgroundTheme === 'navy' ? '#0a1128' : themeSettings.footer.backgroundTheme === 'black' ? '#050811' : 'var(--color-surface)',
                color: themeSettings.footer.backgroundTheme === 'surface' ? 'var(--color-text)' : '#ffffff',
                borderTop: '1px solid var(--color-border)',
                padding: '24px 16px',
                fontSize: '11px'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <strong>MindSparQ</strong>
                <p style={{ opacity: 0.75, margin: '4px 0 0', lineHeight: 1.4 }}>
                  {themeSettings.footer.brandDescription}
                </p>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
                <span>{themeSettings.footer.copyrightText.replace('{year}', '2026')}</span>
                <span>Butwal, Nepal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
