import React, { useState, useEffect } from 'react';
import {
  getDesignSettings,
  saveDesignSettings,
  GlobalDesignSettings,
  DEFAULT_DESIGN_SETTINGS
} from '../../services/siteCustomizerService';
import {
  Palette,
  Check,
  RotateCcw,
  Type,
  Layout,
  Zap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDesignPage: React.FC = () => {
  const [settings, setSettings] = useState<GlobalDesignSettings>(getDesignSettings());
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setSettings(getDesignSettings());
  }, []);

  const handleApplyPalette = (palette: GlobalDesignSettings['brandPalette']) => {
    const updated: GlobalDesignSettings = { ...settings, brandPalette: palette };
    setSettings(updated);
    saveDesignSettings(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleApplyRadius = (radius: GlobalDesignSettings['borderRadius']) => {
    const updated: GlobalDesignSettings = { ...settings, borderRadius: radius };
    setSettings(updated);
    saveDesignSettings(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleApplyFont = (font: GlobalDesignSettings['fontFamily']) => {
    const updated: GlobalDesignSettings = { ...settings, fontFamily: font };
    setSettings(updated);
    saveDesignSettings(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleApplyAnimation = (anim: GlobalDesignSettings['animationIntensity']) => {
    const updated: GlobalDesignSettings = { ...settings, animationIntensity: anim };
    setSettings(updated);
    saveDesignSettings(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Reset all design settings to original MindSparQ defaults?')) return;
    setSettings(DEFAULT_DESIGN_SETTINGS);
    saveDesignSettings(DEFAULT_DESIGN_SETTINGS);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const palettes: { key: GlobalDesignSettings['brandPalette']; label: string; desc: string; color: string }[] = [
    { key: 'ocean-blue', label: 'Ocean Blue (Default)', desc: 'Institutional trust, intelligence, classical STEAM', color: '#2457D6' },
    { key: 'cyber-cyan', label: 'Cyber Cyan', desc: 'Futuristic AI, robotics, modern tech forwardness', color: '#0284C7' },
    { key: 'emerald-stem', label: 'Emerald STEM', desc: 'Growth, cognitive learning, natural discovery', color: '#059669' },
    { key: 'royal-indigo', label: 'Royal Indigo', desc: 'Intellectual depth, mathematical rigor, creativity', color: '#4F46E5' },
    { key: 'electric-amber', label: 'Electric Amber', desc: 'Innovation, youth energy, spark of creativity', color: '#D97706' }
  ];

  const radii: { key: GlobalDesignSettings['borderRadius']; label: string; desc: string }[] = [
    { key: 'standard', label: 'Standard (10px)', desc: 'Balanced, professional, clean corporate corners' },
    { key: 'sleek-pill', label: 'Sleek Pill (16px – Full)', desc: 'Soft rounded aesthetic, friendly modern learning portal' },
    { key: 'modern-soft', label: 'Modern Soft (8px)', desc: 'Minimalist tech edge, crisp structured containers' }
  ];

  const fonts: { key: GlobalDesignSettings['fontFamily']; label: string; desc: string }[] = [
    { key: 'Inter', label: 'Inter (Default)', desc: 'High-legibility sans-serif, standard across global tech platforms' },
    { key: 'Outfit', label: 'Outfit Geometric', desc: 'Warm, forward-looking geometric display typeface' },
    { key: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', desc: 'Contemporary product typography with refined character' }
  ];

  const animations: { key: GlobalDesignSettings['animationIntensity']; label: string; desc: string }[] = [
    { key: 'smooth', label: 'Smooth (Recommended)', desc: 'Full micro-interactions, smooth hover elevations, dynamic feel' },
    { key: 'subtle', label: 'Subtle', desc: 'Quick transitions, faster response, reduced motion footprint' },
    { key: 'none', label: 'None (Instant)', desc: 'Instant transitions for maximum battery efficiency / accessibility' }
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Title & Actions */}
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
              Global Design & Theme Settings
            </h1>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(36, 87, 214, 0.12)',
                color: 'var(--color-primary-600)',
                border: '1px solid rgba(36, 87, 214, 0.3)'
              }}
            >
              Phase 3 Design Tokens
            </span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', margin: '4px 0 0' }}>
            Customize primary brand colors, typography scales, corner curvature, and transition speeds globally.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link to="/" target="_blank" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ExternalLink size={15} />
            <span>Preview Homepage</span>
          </Link>
          <button type="button" onClick={handleResetDefaults} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Save Toast Feedback */}
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
          <span>Design settings updated and applied across all components instantly!</span>
        </div>
      )}

      {/* 1. Brand Color Theme Palettes */}
      <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <Palette size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, margin: 0 }}>
            1. Brand Primary Palette
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          {palettes.map((p) => {
            const isSelected = settings.brandPalette === p.key;
            return (
              <div
                key={p.key}
                onClick={() => handleApplyPalette(p.key)}
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'rgba(36, 87, 214, 0.05)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: p.color }} />
                  {isSelected && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--color-primary-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} />
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: '4px' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {p.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Border Curvature Scale */}
      <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <Layout size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, margin: 0 }}>
            2. Corner Curvature (Border Radius)
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
          {radii.map((r) => {
            const isSelected = settings.borderRadius === r.key;
            return (
              <div
                key={r.key}
                onClick={() => handleApplyRadius(r.key)}
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: r.key === 'sleek-pill' ? '20px' : r.key === 'modern-soft' ? '8px' : '12px',
                  border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'rgba(36, 87, 214, 0.05)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                    {r.label}
                  </div>
                  {isSelected && (
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--color-primary-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={11} />
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {r.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Typography & Animation Speed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Typography */}
        <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <Type size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, margin: 0 }}>
              3. Typography Scale
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {fonts.map((f) => {
              const isSelected = settings.fontFamily === f.key;
              return (
                <div
                  key={f.key}
                  onClick={() => handleApplyFont(f.key)}
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
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text)' }}>{f.label}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{f.desc}</div>
                  </div>
                  {isSelected && <Check size={14} color="var(--color-primary-600)" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Animation */}
        <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <Zap size={18} style={{ color: 'var(--color-primary-600)' }} />
            <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 800, margin: 0 }}>
              4. Animation & Transitions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {animations.map((a) => {
              const isSelected = settings.animationIntensity === a.key;
              return (
                <div
                  key={a.key}
                  onClick={() => handleApplyAnimation(a.key)}
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
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text)' }}>{a.label}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{a.desc}</div>
                  </div>
                  {isSelected && <Check size={14} color="var(--color-primary-600)" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Preview Component Box */}
      <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface-elevated)' }}>
        <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Live Component Token Preview
        </h3>

        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="btn btn-primary">
            <span>Primary CTA Button</span>
          </button>
          <button type="button" className="btn btn-secondary">
            <span>Secondary Action</span>
          </button>
          <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-brand-primary-soft)', color: 'var(--color-primary-600)', fontSize: '0.75rem', fontWeight: 700 }}>
            Curriculum Badge
          </span>
          <input type="text" placeholder="Input focus preview..." className="input-field" style={{ width: '220px' }} />
        </div>
      </div>
    </div>
  );
};
