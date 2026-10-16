import React, { useState, useEffect } from 'react';
import {
  getAdSlot,
  saveAdSlot,
  resetAdSlotsToDefault,
  AdSlotConfig
} from '../../services/adRailService';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { Sparkles, Save, RotateCcw, Check, ExternalLink, Eye, AlertCircle } from 'lucide-react';

export const AdminAdsPage: React.FC = () => {
  const [selectedSlot, setSelectedSlot] = useState<'site-rail-left' | 'site-rail-right' | 'mobile-inline-promo'>('site-rail-left');
  const [formData, setFormData] = useState<AdSlotConfig>(() => getAdSlot('site-rail-left'));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormData(getAdSlot(selectedSlot));
    setSaveSuccess(false);
    setErrorMessage(null);
  }, [selectedSlot]);

  const handleSlotChange = (slotId: 'site-rail-left' | 'site-rail-right' | 'mobile-inline-promo') => {
    setSelectedSlot(slotId);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate URL scheme
    const url = formData.destinationUrl.trim();
    if (!url.startsWith('/') && !url.startsWith('https://') && !url.startsWith('http://')) {
      setErrorMessage('Destination URL must begin with "/" (internal route) or "https://" (secure external link).');
      return;
    }

    if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
      setErrorMessage('Unsafe URL scheme detected. Please provide a valid web address.');
      return;
    }

    saveAdSlot(selectedSlot, formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all advertising slots to MindSparQ default institutional promotions?')) {
      resetAdSlotsToDefault();
      setFormData(getAdSlot(selectedSlot));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const samplePresets = [
    {
      label: 'Abacus & Math (Mental Arithmetic)',
      url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&h=900&q=80',
      dest: '/programs#abacus-mental-math',
      title: 'Abacus & Mental Math Championship 2026',
      badge: 'MindSparQ Feature'
    },
    {
      label: 'AI & Robotics Lab Admissions',
      url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&h=900&q=80',
      dest: '/programs#ai-coding-robotics',
      title: 'AI, Coding & Robotics Lab Admissions',
      badge: 'Admissions Open'
    },
    {
      label: 'Vedic Mathematics Masterclass',
      url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&h=900&q=80',
      dest: '/programs#vedic-mathematics',
      title: 'Vedic Math Shortcuts & Logic',
      badge: 'Workshop 2026'
    },
    {
      label: 'School Teacher STEM Training',
      url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&h=900&q=80',
      dest: '/programs#school-teacher-support',
      title: 'School Partnership & Teacher Enablement',
      badge: 'Institutional'
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-600)', marginBottom: '4px' }}>
          <Sparkles size={20} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Advertising & Promotion Management
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--color-text)' }}>
          Side-Rail Promotions & Ad Slots
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
          Manage the portrait promotions displayed on wide desktop screens (Left & Right rails) and the in-flow promotional card on mobile screens. Initially configured for MindSparQ promotions and ready for paid advertiser campaigns.
        </p>
      </div>

      {/* Slot Selection Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 'var(--space-6)',
          paddingBottom: '2px',
          overflowX: 'auto'
        }}
      >
        <button
          type="button"
          onClick={() => handleSlotChange('site-rail-left')}
          style={{
            padding: '10px 18px',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: 'none',
            borderBottom: selectedSlot === 'site-rail-left' ? '2.5px solid var(--color-primary-600)' : '2.5px solid transparent',
            color: selectedSlot === 'site-rail-left' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Left Portrait Rail (Desktop)
        </button>

        <button
          type="button"
          onClick={() => handleSlotChange('site-rail-right')}
          style={{
            padding: '10px 18px',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: 'none',
            borderBottom: selectedSlot === 'site-rail-right' ? '2.5px solid var(--color-primary-600)' : '2.5px solid transparent',
            color: selectedSlot === 'site-rail-right' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Right Portrait Rail (Desktop)
        </button>

        <button
          type="button"
          onClick={() => handleSlotChange('mobile-inline-promo')}
          style={{
            padding: '10px 18px',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: 'none',
            borderBottom: selectedSlot === 'mobile-inline-promo' ? '2.5px solid var(--color-primary-600)' : '2.5px solid transparent',
            color: selectedSlot === 'mobile-inline-promo' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Mobile In-Flow Promo
        </button>
      </div>

      {/* Main Grid: Form + Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-8)', alignItems: 'start' }}>
        {/* Editor Form */}
        <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <form onSubmit={handleSave}>
            {/* Status & Sponsored Toggles */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Active on Site</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={formData.isSponsored || false}
                  onChange={(e) => setFormData({ ...formData, isSponsored: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Mark as Paid Advertisement</span>
              </label>
            </div>

            {/* Campaign Title */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                Campaign / Headline Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g. Abacus & Mental Math Championship 2026"
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>

            {/* Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                  Badge (English)
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. MindSparQ Feature"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                  Badge (Nepali)
                </label>
                <input
                  type="text"
                  value={formData.badgeNepali || ''}
                  onChange={(e) => setFormData({ ...formData, badgeNepali: e.target.value })}
                  placeholder="e.g. MindSparQ कार्यक्रम"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Image Upload / URL */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <ImageUploadField
                label="Portrait Artwork / Image URL (2:3 Aspect Ratio recommended) *"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                recommendedDimensions="600 × 900 px (2:3 aspect ratio)"
              />
            </div>

            {/* Presets Quick Picker */}
            <div style={{ marginBottom: 'var(--space-4)', padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Quick Presets:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {samplePresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        title: p.title,
                        badge: p.badge,
                        imageUrl: p.url,
                        destinationUrl: p.dest,
                        altText: p.title
                      });
                    }}
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination URL */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                Destination URL *
              </label>
              <input
                type="text"
                value={formData.destinationUrl}
                onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                required
                placeholder="e.g. /programs#abacus-mental-math or https://partner.com"
                className="input-field"
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: '4px' }}>
                Use internal route (e.g. /programs) or secure full URL (e.g. https://...).
              </span>
            </div>

            {/* Alt Text */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                Accessible Alt Text (for Screen Readers & SEO)
              </label>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                placeholder="Descriptive label for visually impaired learners"
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>

            {/* Errors */}
            {errorMessage && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCcw size={14} />
                <span>Reset Defaults</span>
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {saveSuccess ? (
                  <>
                    <Check size={14} />
                    <span>Saved Live!</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Slot Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Slot Preview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-3)' }}>
            <Eye size={16} style={{ color: 'var(--color-primary-600)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Live Slot Preview ({selectedSlot})
            </h3>
          </div>

          <div
            style={{
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-bg)',
              border: '1px dashed var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '380px'
            }}
          >
            {formData.isActive ? (
              <div style={{ width: selectedSlot === 'mobile-inline-promo' ? '100%' : '200px', maxWidth: '320px' }}>
                <div
                  className="card"
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      zIndex: 2,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      backgroundColor: formData.isSponsored ? 'rgba(234, 88, 12, 0.92)' : 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}
                  >
                    <Sparkles size={11} />
                    <span>{formData.isSponsored ? 'Sponsored' : formData.badge}</span>
                  </div>

                  <div style={{ aspectRatio: selectedSlot === 'mobile-inline-promo' ? '16 / 9' : '2 / 3', overflow: 'hidden' }}>
                    <img
                      src={formData.imageUrl || 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&h=900&q=80'}
                      alt={formData.altText}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-surface)' }}>
                    <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.3 }}>
                      {formData.title || 'Campaign Title'}
                    </h4>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-primary-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Destination: {formData.destinationUrl}</span>
                      <ExternalLink size={10} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-6)' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>This slot is currently marked as Inactive.</p>
                <span style={{ fontSize: '0.75rem' }}>It will cleanly collapse on the live site without leaving blank gaps.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
