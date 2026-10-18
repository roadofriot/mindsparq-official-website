import React, { useState } from 'react';
import { ElementStyle, ResponsiveStyleOverride } from '../../cms/styleSchema';
import {
  Link2,
  Unlink2,
  RotateCcw,
  Palette,
  Maximize2,
  Move,
  Type,
  Square,
  LayoutGrid
} from 'lucide-react';

interface StyleInspectorProps {
  elementLabel: string;
  styleId: string;
  override?: ResponsiveStyleOverride;
  onChange: (breakpoint: 'base' | 'tablet' | 'mobile', partial: Partial<ElementStyle>) => void;
  onReset: () => void;
}

const BRAND_PALETTES = [
  { name: 'Primary Blue', hex: '#2457D6' },
  { name: 'Dark Navy', hex: '#14213D' },
  { name: 'Cyber Cyan', hex: '#0284C7' },
  { name: 'Teal Accent', hex: '#0F9D91' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber Highlight', hex: '#F4B544' },
  { name: 'Surface White', hex: '#FFFFFF' },
  { name: 'Surface Gray', hex: '#F8FAFC' },
  { name: 'Border Slate', hex: '#E2E8F0' },
  { name: 'Dark Surface', hex: '#0F172A' }
];

export const StyleInspector: React.FC<StyleInspectorProps> = ({
  elementLabel,
  override = {},
  onChange,
  onReset
}) => {
  const [activeBreakpoint, setActiveBreakpoint] = useState<'base' | 'tablet' | 'mobile'>('base');
  const [activeTab, setActiveTab] = useState<'colors' | 'spacing' | 'dimensions' | 'typography' | 'border' | 'layout'>('colors');
  const [linkedPadding, setLinkedPadding] = useState<boolean>(true);
  const [linkedMargin, setLinkedMargin] = useState<boolean>(true);

  const currentStyle: ElementStyle = override[activeBreakpoint] || {};

  const handleUpdate = (partial: Partial<ElementStyle>) => {
    onChange(activeBreakpoint, partial);
  };

  // Helper for 4-sided linked spacing changes
  const handleLinkedSpacing = (type: 'padding' | 'margin', val: string) => {
    if (type === 'padding') {
      handleUpdate({
        paddingTop: val,
        paddingRight: val,
        paddingBottom: val,
        paddingLeft: val
      });
    } else {
      handleUpdate({
        marginTop: val,
        marginRight: val,
        marginBottom: val,
        marginLeft: val
      });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '10px',
        border: '1px solid var(--color-border)',
        padding: '16px'
      }}
    >
      {/* Header with Element Label & Breakpoint Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
        <div>
          <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary-600)', fontWeight: 700 }}>
            Inspecting Element
          </span>
          <h4 style={{ margin: '2px 0 0', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text)' }}>
            {elementLabel}
          </h4>
        </div>

        <button
          type="button"
          onClick={onReset}
          title="Reset overrides for this element"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Breakpoint Switcher */}
      <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-bg)', padding: '4px', borderRadius: '8px' }}>
        {(['base', 'tablet', 'mobile'] as const).map((bp) => (
          <button
            key={bp}
            type="button"
            onClick={() => setActiveBreakpoint(bp)}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: activeBreakpoint === bp ? 700 : 500,
              backgroundColor: activeBreakpoint === bp ? 'var(--color-surface)' : 'transparent',
              color: activeBreakpoint === bp ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
              border: activeBreakpoint === bp ? '1px solid var(--color-border)' : 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {bp === 'base' ? 'Desktop (Base)' : bp === 'tablet' ? 'Tablet (≤768px)' : 'Mobile (≤480px)'}
          </button>
        ))}
      </div>

      {/* Inspector Categories Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', overflowX: 'auto' }}>
        {[
          { key: 'colors', label: 'Colors', icon: Palette },
          { key: 'spacing', label: 'Spacing', icon: Move },
          { key: 'dimensions', label: 'Size', icon: Maximize2 },
          { key: 'typography', label: 'Typography', icon: Type },
          { key: 'border', label: 'Border', icon: Square },
          { key: 'layout', label: 'Layout', icon: LayoutGrid }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: isSel ? 700 : 500,
                backgroundColor: isSel ? 'rgba(36, 87, 214, 0.1)' : 'transparent',
                color: isSel ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 1. COLORS TAB                                                        */}
      {/* ==================================================================== */}
      {activeTab === 'colors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Background Color */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Background Color</label>
              <button
                type="button"
                onClick={() => handleUpdate({ backgroundColor: 'transparent' })}
                style={{ fontSize: '0.6875rem', background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Set Transparent
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={currentStyle.backgroundColor?.startsWith('#') ? currentStyle.backgroundColor : '#ffffff'}
                onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                style={{ width: '38px', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={currentStyle.backgroundColor || ''}
                placeholder="#ffffff or transparent"
                onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          {/* Heading Color */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
              Heading / Title Color
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={currentStyle.headingColor?.startsWith('#') ? currentStyle.headingColor : '#14213d'}
                onChange={(e) => handleUpdate({ headingColor: e.target.value })}
                style={{ width: '38px', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={currentStyle.headingColor || ''}
                placeholder="#14213d"
                onChange={(e) => handleUpdate({ headingColor: e.target.value })}
                style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          {/* Text / Body Color */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
              Body / Paragraph Text Color
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={currentStyle.textColor?.startsWith('#') ? currentStyle.textColor : '#526176'}
                onChange={(e) => handleUpdate({ textColor: e.target.value })}
                style={{ width: '38px', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={currentStyle.textColor || ''}
                placeholder="#526176"
                onChange={(e) => handleUpdate({ textColor: e.target.value })}
                style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          {/* Button Background & Text Colors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Button Background
              </label>
              <input
                type="text"
                value={currentStyle.buttonBgColor || ''}
                placeholder="#2457d6"
                onChange={(e) => handleUpdate({ buttonBgColor: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Button Text
              </label>
              <input
                type="text"
                value={currentStyle.buttonTextColor || ''}
                placeholder="#ffffff"
                onChange={(e) => handleUpdate({ buttonTextColor: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          {/* Quick Preset Palette Swatches */}
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
              Brand Palette Quick Swatches
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {BRAND_PALETTES.map((palette) => (
                <button
                  key={palette.hex}
                  type="button"
                  onClick={() => handleUpdate({ backgroundColor: palette.hex })}
                  title={palette.name}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: palette.hex,
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. SPACING TAB                                                       */}
      {/* ==================================================================== */}
      {activeTab === 'spacing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Inner Padding */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Padding (Inner Spacing)</label>
              <button
                type="button"
                onClick={() => setLinkedPadding(!linkedPadding)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer' }}
              >
                {linkedPadding ? <Link2 size={12} /> : <Unlink2 size={12} />}
                <span>{linkedPadding ? 'Linked Sides' : 'Independent Sides'}</span>
              </button>
            </div>

            {linkedPadding ? (
              <input
                type="text"
                value={currentStyle.paddingTop || ''}
                placeholder="e.g. 24px or 1.5rem"
                onChange={(e) => handleLinkedSpacing('padding', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="text"
                  value={currentStyle.paddingTop || ''}
                  placeholder="Top (px)"
                  onChange={(e) => handleUpdate({ paddingTop: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                />
                <input
                  type="text"
                  value={currentStyle.paddingRight || ''}
                  placeholder="Right (px)"
                  onChange={(e) => handleUpdate({ paddingRight: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                />
                <input
                  type="text"
                  value={currentStyle.paddingBottom || ''}
                  placeholder="Bottom (px)"
                  onChange={(e) => handleUpdate({ paddingBottom: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                />
                <input
                  type="text"
                  value={currentStyle.paddingLeft || ''}
                  placeholder="Left (px)"
                  onChange={(e) => handleUpdate({ paddingLeft: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                />
              </div>
            )}
          </div>

          {/* Outer Margin */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Margin (Outer Separation)</label>
              <button
                type="button"
                onClick={() => setLinkedMargin(!linkedMargin)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer' }}
              >
                {linkedMargin ? <Link2 size={12} /> : <Unlink2 size={12} />}
                <span>{linkedMargin ? 'Linked Sides' : 'Independent Sides'}</span>
              </button>
            </div>

            {linkedMargin ? (
              <input
                type="text"
                value={currentStyle.marginTop || ''}
                placeholder="e.g. 32px or 2rem"
                onChange={(e) => handleLinkedSpacing('margin', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="text"
                  value={currentStyle.marginTop || ''}
                  placeholder="Margin Top"
                  onChange={(e) => handleUpdate({ marginTop: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                />
                <input
                  type="text"
                  value={currentStyle.marginRight || ''}
                  placeholder="Margin Right"
                  onChange={(e) => handleUpdate({ marginRight: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                />
                <input
                  type="text"
                  value={currentStyle.marginBottom || ''}
                  placeholder="Margin Bottom"
                  onChange={(e) => handleUpdate({ marginBottom: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                />
                <input
                  type="text"
                  value={currentStyle.marginLeft || ''}
                  placeholder="Margin Left"
                  onChange={(e) => handleUpdate({ marginLeft: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. DIMENSIONS TAB                                                    */}
      {/* ==================================================================== */}
      {activeTab === 'dimensions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Width
              </label>
              <input
                type="text"
                value={currentStyle.width || ''}
                placeholder="100% or auto"
                onChange={(e) => handleUpdate({ width: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Max Width
              </label>
              <input
                type="text"
                value={currentStyle.maxWidth || ''}
                placeholder="1200px or none"
                onChange={(e) => handleUpdate({ maxWidth: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Min Height
              </label>
              <input
                type="text"
                value={currentStyle.minHeight || ''}
                placeholder="auto or 300px"
                onChange={(e) => handleUpdate({ minHeight: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Overflow
              </label>
              <select
                value={currentStyle.overflow || 'visible'}
                onChange={(e) => handleUpdate({ overflow: e.target.value as any })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              >
                <option value="visible">Visible</option>
                <option value="hidden">Hidden (Clipped)</option>
                <option value="scroll">Scroll</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. TYPOGRAPHY TAB                                                    */}
      {/* ==================================================================== */}
      {activeTab === 'typography' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
              Font Family
            </label>
            <select
              value={currentStyle.fontFamily || ''}
              onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
            >
              <option value="">Inherit System Default</option>
              <option value="'Inter', sans-serif">Inter</option>
              <option value="'Outfit', sans-serif">Outfit</option>
              <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
              <option value="'Mukta', sans-serif">Mukta (Nepali Optimized)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Font Size
              </label>
              <input
                type="text"
                value={currentStyle.fontSize || ''}
                placeholder="1.25rem or 20px"
                onChange={(e) => handleUpdate({ fontSize: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Font Weight
              </label>
              <select
                value={currentStyle.fontWeight || ''}
                onChange={(e) => handleUpdate({ fontWeight: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              >
                <option value="">Default</option>
                <option value="400">Regular (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extrabold (800)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
              Text Alignment
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => handleUpdate({ textAlign: align })}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '0.75rem',
                    textTransform: 'capitalize',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: currentStyle.textAlign === align ? 'var(--color-primary-600)' : 'var(--color-bg)',
                    color: currentStyle.textAlign === align ? '#ffffff' : 'var(--color-text)',
                    cursor: 'pointer'
                  }}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. BORDER & RADIUS TAB                                               */}
      {/* ==================================================================== */}
      {activeTab === 'border' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Border Width
              </label>
              <input
                type="text"
                value={currentStyle.borderWidth || ''}
                placeholder="1px or 2px"
                onChange={(e) => handleUpdate({ borderWidth: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Border Radius
              </label>
              <input
                type="text"
                value={currentStyle.borderRadius || ''}
                placeholder="12px or 9999px"
                onChange={(e) => handleUpdate({ borderRadius: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
              Border Color
            </label>
            <input
              type="text"
              value={currentStyle.borderColor || ''}
              placeholder="#e2e8f0 or rgba(0,0,0,0.1)"
              onChange={(e) => handleUpdate({ borderColor: e.target.value })}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
              Box Shadow
            </label>
            <select
              value={currentStyle.boxShadow || ''}
              onChange={(e) => handleUpdate({ boxShadow: e.target.value })}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
            >
              <option value="">None / Inherited</option>
              <option value="0 1px 3px rgba(0,0,0,0.06)">Subtle (sm)</option>
              <option value="0 4px 14px rgba(0,0,0,0.08)">Card Float (md)</option>
              <option value="0 10px 30px rgba(0,0,0,0.12)">Elevated (lg)</option>
              <option value="0 20px 48px rgba(36,87,214,0.14)">Brand Glow (xl)</option>
            </select>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. LAYOUT & GAPS TAB                                                 */}
      {/* ==================================================================== */}
      {activeTab === 'layout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Row Gap
              </label>
              <input
                type="text"
                value={currentStyle.rowGap || ''}
                placeholder="16px or 1rem"
                onChange={(e) => handleUpdate({ rowGap: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Column Gap
              </label>
              <input
                type="text"
                value={currentStyle.columnGap || ''}
                placeholder="16px or 1rem"
                onChange={(e) => handleUpdate({ columnGap: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
              Flex Direction
            </label>
            <select
              value={currentStyle.flexDirection || 'row'}
              onChange={(e) => handleUpdate({ flexDirection: e.target.value as any })}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
            >
              <option value="row">Row (Horizontal)</option>
              <option value="column">Column (Vertical)</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column-reverse">Column Reverse</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
