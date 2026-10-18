import React, { useState } from 'react';
import { ElementStyle, ResponsiveStyleOverride } from '../../cms/styleSchema';
import { ImageUploadField } from './ImageUploadField';
import { AccessibleHint } from '../ui/AccessibleHint';
import {
  Link2,
  Unlink2,
  RotateCcw,
  Palette,
  Maximize2,
  Move,
  Type,
  Square,
  LayoutGrid,
  Sparkles,
  Sliders,
  X
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
  { name: 'Dark Surface', hex: '#0F172A' },
  { name: 'Midnight', hex: '#070E1A' }
];

const GRADIENT_PRESETS = [
  {
    name: 'None',
    value: '',
    preview: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
  },
  {
    name: 'MindSparQ Blue',
    value: 'linear-gradient(135deg, rgba(36, 87, 214, 0.25) 0%, rgba(20, 33, 61, 0.75) 100%)',
    preview: 'linear-gradient(135deg, #2457d6 0%, #14213d 100%)'
  },
  {
    name: 'Cyber Cyan',
    value: 'linear-gradient(135deg, rgba(2, 132, 199, 0.3) 0%, rgba(15, 157, 145, 0.25) 100%)',
    preview: 'linear-gradient(135deg, #0284c7 0%, #0f9d91 100%)'
  },
  {
    name: 'Dark Vignette',
    value: 'linear-gradient(180deg, rgba(15, 23, 42, 0.35) 0%, rgba(15, 23, 42, 0.9) 100%)',
    preview: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
  },
  {
    name: 'Golden Amber',
    value: 'linear-gradient(135deg, rgba(244, 181, 68, 0.22) 0%, rgba(217, 119, 6, 0.4) 100%)',
    preview: 'linear-gradient(135deg, #f4b544 0%, #d97706 100%)'
  },
  {
    name: 'Emerald Aurora',
    value: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.45) 100%)',
    preview: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    name: 'Cosmic Navy',
    value: 'linear-gradient(135deg, #070e1a 0%, #0f172a 100%)',
    preview: 'linear-gradient(135deg, #070e1a 0%, #0f172a 100%)'
  },
  {
    name: 'Glass Frost',
    value: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)',
    preview: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%)'
  }
];

function hexToRgbaString(hex: string, alphaPercent: number): string {
  const cleanHex = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  const alpha = (alphaPercent / 100).toFixed(2);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

  // Visual Gradient Builder State
  const [gradStartColor, setGradStartColor] = useState<string>('#2457d6');
  const [gradEndColor, setGradEndColor] = useState<string>('#14213d');
  const [gradStartAlpha, setGradStartAlpha] = useState<number>(30);
  const [gradEndAlpha, setGradEndAlpha] = useState<number>(85);
  const [gradAngle, setGradAngle] = useState<string>('135deg');
  const [showCustomCssGradient, setShowCustomCssGradient] = useState<boolean>(false);

  const currentStyle: ElementStyle = override[activeBreakpoint] || {};

  const handleUpdate = (partial: Partial<ElementStyle>) => {
    onChange(activeBreakpoint, partial);
  };

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

  const applyVisualGradient = (
    startCol = gradStartColor,
    endCol = gradEndColor,
    startA = gradStartAlpha,
    endA = gradEndAlpha,
    angle = gradAngle
  ) => {
    const startRgba = hexToRgbaString(startCol, startA);
    const endRgba = hexToRgbaString(endCol, endA);
    const gradVal = angle === 'radial'
      ? `radial-gradient(circle, ${startRgba} 0%, ${endRgba} 100%)`
      : `linear-gradient(${angle}, ${startRgba} 0%, ${endRgba} 100%)`;
    handleUpdate({ backgroundGradient: gradVal });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--color-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
      {/* Header with Title and Reset */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary-600)', fontWeight: 700 }}>
            Visual Style Inspector
          </span>
          <h4 style={{ margin: '2px 0 0', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text)' }}>
            {elementLabel}
          </h4>
        </div>

        <AccessibleHint text="Clear custom styles on this element and revert to theme defaults">
          <button
            type="button"
            onClick={onReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              padding: '5px 10px',
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
        </AccessibleHint>
      </div>

      {/* Breakpoint Switcher */}
      <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-bg)', padding: '4px', borderRadius: '8px' }}>
        {(['base', 'tablet', 'mobile'] as const).map((bp) => (
          <AccessibleHint
            key={bp}
            text={
              bp === 'base'
                ? 'Base desktop styling (>768px)'
                : bp === 'tablet'
                ? 'Tablet device overrides (≤768px)'
                : 'Mobile smartphone overrides (≤480px)'
            }
          >
            <button
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
          </AccessibleHint>
        ))}
      </div>

      {/* Inspector Categories Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', overflowX: 'auto' }}>
        {[
          { key: 'colors', label: 'Colors & Media', icon: Palette, hint: 'Background, images, gradients, and font colors' },
          { key: 'spacing', label: 'Spacing', icon: Move, hint: 'Padding inside and margins around elements' },
          { key: 'dimensions', label: 'Size', icon: Maximize2, hint: 'Width, max-width, and minimum height' },
          { key: 'typography', label: 'Typography', icon: Type, hint: 'Fonts, sizes, weights, and alignment' },
          { key: 'border', label: 'Border', icon: Square, hint: 'Borders, rounded corners, and drop shadows' },
          { key: 'layout', label: 'Layout', icon: LayoutGrid, hint: 'Flexbox, grids, and item gaps' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.key;
          return (
            <AccessibleHint key={tab.key} text={tab.hint}>
              <button
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
            </AccessibleHint>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 1. COLORS & VISUAL MEDIA TAB                                         */}
      {/* ==================================================================== */}
      {activeTab === 'colors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* SECTION A: BACKGROUND & ATMOSPHERE */}
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              <Sparkles size={14} style={{ color: 'var(--color-primary-600)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text)' }}>
                Background Atmosphere & Media
              </span>
            </div>

            {/* Solid Background Color */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  Custom Background Hex / Color
                </label>
                <button
                  type="button"
                  onClick={() => handleUpdate({ backgroundColor: 'transparent' })}
                  style={{ fontSize: '0.6875rem', background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Set Transparent
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AccessibleHint text="Click to open the color palette picker">
                  <input
                    type="color"
                    value={currentStyle.backgroundColor?.startsWith('#') ? currentStyle.backgroundColor : '#ffffff'}
                    onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                    style={{ width: '38px', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  />
                </AccessibleHint>
                <input
                  type="text"
                  value={currentStyle.backgroundColor || ''}
                  placeholder="#070e1a or rgba(11, 19, 41, 0.8)"
                  onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                  style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.8125rem' }}
                />
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
                e.g. #070e1a, #ffffff, rgba(11, 19, 41, 0.8), or transparent
              </span>
            </div>

            {/* Quick Brand Palette Swatches */}
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Brand Palette Quick Swatches
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {BRAND_PALETTES.map((palette) => (
                  <AccessibleHint key={palette.hex} text={`Set ${palette.name} (${palette.hex})`}>
                    <button
                      type="button"
                      onClick={() => handleUpdate({ backgroundColor: palette.hex })}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: palette.hex,
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  </AccessibleHint>
                ))}
              </div>
            </div>

            {/* Background Image with Local Computer / Desktop Upload & URL mode */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <ImageUploadField
                label="Background Image (Upload from Computer or Web URL)"
                value={currentStyle.backgroundImageUrl || ''}
                onChange={(url) => handleUpdate({ backgroundImageUrl: url })}
                placeholder="https://images.unsplash.com/... or choose from computer"
                helperText="Upload any high-res backdrop photo directly from your desktop computer/phone or enter an image link."
                recommendedDimensions="1920x1080 px"
              />
            </div>

            {/* Background Image Overlay Opacity Slider */}
            {currentStyle.backgroundImageUrl && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    Background Photo Dimming / Tint
                  </label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                    {Math.round((currentStyle.overlayOpacity ?? 0.4) * 100)}% Dark Overlay
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentStyle.overlayOpacity ?? 0.4}
                  onChange={(e) => handleUpdate({ overlayOpacity: parseFloat(e.target.value) })}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px' }}>
                  Dims the background photo so text and headlines stay readable.
                </span>
              </div>
            )}

            {/* Visual Gradient Chooser & Presets */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={13} style={{ color: 'var(--color-primary-600)' }} />
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    Background Gradient Overlay (Visual Chooser)
                  </label>
                </div>
                {currentStyle.backgroundGradient && (
                  <button
                    type="button"
                    onClick={() => handleUpdate({ backgroundGradient: '' })}
                    style={{ fontSize: '0.6875rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <X size={11} /> Clear Gradient
                  </button>
                )}
              </div>

              {/* Gradient Presets Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', marginBottom: '10px' }}>
                {GRADIENT_PRESETS.map((p) => {
                  const isSel = (currentStyle.backgroundGradient || '') === p.value;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleUpdate({ backgroundGradient: p.value })}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: isSel ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: isSel ? 'var(--color-primary-600)' : 'var(--color-text)',
                        fontSize: '0.6875rem',
                        fontWeight: isSel ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        textAlign: 'left'
                      }}
                    >
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: p.preview,
                          border: '1px solid rgba(0,0,0,0.1)',
                          flexShrink: 0
                        }}
                      />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Visual Two-Color + Angle Builder */}
              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Visual Gradient Generator (Pick Colors & Angle)
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {/* Start Color */}
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
                      Start Color & Opacity
                    </span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={gradStartColor}
                        onChange={(e) => {
                          setGradStartColor(e.target.value);
                          applyVisualGradient(e.target.value, gradEndColor, gradStartAlpha, gradEndAlpha, gradAngle);
                        }}
                        style={{ width: '32px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={gradStartAlpha}
                        onChange={(e) => {
                          const a = parseInt(e.target.value, 10);
                          setGradStartAlpha(a);
                          applyVisualGradient(gradStartColor, gradEndColor, a, gradEndAlpha, gradAngle);
                        }}
                        title={`Opacity: ${gradStartAlpha}%`}
                        style={{ flex: 1, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, width: '28px' }}>{gradStartAlpha}%</span>
                    </div>
                  </div>

                  {/* End Color */}
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
                      End Color & Opacity
                    </span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={gradEndColor}
                        onChange={(e) => {
                          setGradEndColor(e.target.value);
                          applyVisualGradient(gradStartColor, e.target.value, gradStartAlpha, gradEndAlpha, gradAngle);
                        }}
                        style={{ width: '32px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={gradEndAlpha}
                        onChange={(e) => {
                          const a = parseInt(e.target.value, 10);
                          setGradEndAlpha(a);
                          applyVisualGradient(gradStartColor, gradEndColor, gradStartAlpha, a, gradAngle);
                        }}
                        title={`Opacity: ${gradEndAlpha}%`}
                        style={{ flex: 1, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, width: '28px' }}>{gradEndAlpha}%</span>
                    </div>
                  </div>
                </div>

                {/* Angle Selector */}
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '3px' }}>
                    Flow Direction / Angle
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { key: '135deg', label: '↘ Diagonal' },
                      { key: '90deg', label: '→ Horizontal' },
                      { key: '180deg', label: '↓ Vertical' },
                      { key: '45deg', label: '↗ Corner' },
                      { key: 'radial', label: '◎ Radial Glow' }
                    ].map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => {
                          setGradAngle(d.key);
                          applyVisualGradient(gradStartColor, gradEndColor, gradStartAlpha, gradEndAlpha, d.key);
                        }}
                        style={{
                          flex: 1,
                          padding: '4px',
                          fontSize: '0.6875rem',
                          borderRadius: '4px',
                          border: gradAngle === d.key ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                          backgroundColor: gradAngle === d.key ? 'rgba(36, 87, 214, 0.1)' : 'transparent',
                          color: gradAngle === d.key ? 'var(--color-primary-600)' : 'var(--color-text)',
                          fontWeight: gradAngle === d.key ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Gradient Preview Bar */}
                {currentStyle.backgroundGradient && (
                  <div style={{ marginTop: '4px' }}>
                    <div
                      style={{
                        height: '24px',
                        borderRadius: '4px',
                        background: currentStyle.backgroundGradient,
                        border: '1px solid var(--color-border)',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                      }}
                      title="Live gradient preview"
                    />
                  </div>
                )}

                {/* Advanced Custom CSS Gradient Formula */}
                <div style={{ marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCustomCssGradient(!showCustomCssGradient)}
                    style={{ fontSize: '0.6875rem', background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {showCustomCssGradient ? 'Hide Custom CSS Formula' : 'Show / Edit Custom CSS Formula'}
                  </button>
                  {showCustomCssGradient && (
                    <div style={{ marginTop: '6px' }}>
                      <input
                        type="text"
                        value={currentStyle.backgroundGradient || ''}
                        placeholder="linear-gradient(135deg, rgba(36, 87, 214, 0.15) 0%, rgba(2, 132, 199, 0.08) 100%)"
                        onChange={(e) => handleUpdate({ backgroundGradient: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.75rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: TYPOGRAPHY COLORS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text)' }}>
              Typography Colors
            </span>

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

            {/* Subheading / Accent Color */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Subheading / Accent Color
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={currentStyle.subheadingColor?.startsWith('#') ? currentStyle.subheadingColor : '#0284c7'}
                  onChange={(e) => handleUpdate({ subheadingColor: e.target.value })}
                  style={{ width: '38px', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={currentStyle.subheadingColor || ''}
                  placeholder="#0284c7"
                  onChange={(e) => handleUpdate({ subheadingColor: e.target.value })}
                  style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
                />
              </div>
            </div>
          </div>

          {/* SECTION C: BUTTON & CARD COLORS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text)' }}>
              Component & Button Colors
            </span>

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
                  Button Text Color
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

            {/* Card Background & Border */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Card Background
                </label>
                <input
                  type="text"
                  value={currentStyle.cardBgColor || ''}
                  placeholder="#ffffff or #1e293b"
                  onChange={(e) => handleUpdate({ cardBgColor: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Card Border Color
                </label>
                <input
                  type="text"
                  value={currentStyle.cardBorderColor || ''}
                  placeholder="#e2e8f0 or rgba(255,255,255,0.1)"
                  onChange={(e) => handleUpdate({ cardBorderColor: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
                />
              </div>
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
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Padding (Internal Content Spacing)
                </label>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                  Space between the boundary and interior content
                </span>
              </div>
              <AccessibleHint text={linkedPadding ? 'Switch to edit Top, Right, Bottom, Left independently' : 'Link all 4 sides equally'}>
                <button
                  type="button"
                  onClick={() => setLinkedPadding(!linkedPadding)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer' }}
                >
                  {linkedPadding ? <Link2 size={12} /> : <Unlink2 size={12} />}
                  <span>{linkedPadding ? 'Linked Sides' : 'Independent Sides'}</span>
                </button>
              </AccessibleHint>
            </div>

            {linkedPadding ? (
              <input
                type="text"
                value={currentStyle.paddingTop || ''}
                placeholder="e.g. 24px, 48px, or 3rem"
                onChange={(e) => handleLinkedSpacing('padding', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>Top</span>
                  <input
                    type="text"
                    value={currentStyle.paddingTop || ''}
                    placeholder="24px"
                    onChange={(e) => handleUpdate({ paddingTop: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>Right</span>
                  <input
                    type="text"
                    value={currentStyle.paddingRight || ''}
                    placeholder="24px"
                    onChange={(e) => handleUpdate({ paddingRight: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>Bottom</span>
                  <input
                    type="text"
                    value={currentStyle.paddingBottom || ''}
                    placeholder="24px"
                    onChange={(e) => handleUpdate({ paddingBottom: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>Left</span>
                  <input
                    type="text"
                    value={currentStyle.paddingLeft || ''}
                    placeholder="24px"
                    onChange={(e) => handleUpdate({ paddingLeft: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Outer Margin */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Margin (External Separation)
                </label>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                  Gap between this section and adjacent sections
                </span>
              </div>
              <AccessibleHint text={linkedMargin ? 'Switch to edit Top, Right, Bottom, Left margins independently' : 'Link all 4 margin sides equally'}>
                <button
                  type="button"
                  onClick={() => setLinkedMargin(!linkedMargin)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer' }}
                >
                  {linkedMargin ? <Link2 size={12} /> : <Unlink2 size={12} />}
                  <span>{linkedMargin ? 'Linked Sides' : 'Independent Sides'}</span>
                </button>
              </AccessibleHint>
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
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>Margin Top</span>
                  <input
                    type="text"
                    value={currentStyle.marginTop || ''}
                    placeholder="32px"
                    onChange={(e) => handleUpdate({ marginTop: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>Margin Right</span>
                  <input
                    type="text"
                    value={currentStyle.marginRight || ''}
                    placeholder="0px"
                    onChange={(e) => handleUpdate({ marginRight: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>Margin Bottom</span>
                  <input
                    type="text"
                    value={currentStyle.marginBottom || ''}
                    placeholder="32px"
                    onChange={(e) => handleUpdate({ marginBottom: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>Margin Left</span>
                  <input
                    type="text"
                    value={currentStyle.marginLeft || ''}
                    placeholder="0px"
                    onChange={(e) => handleUpdate({ marginLeft: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.75rem' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. DIMENSIONS TAB                                                    */}
      {/* ==================================================================== */}
      {activeTab === 'dimensions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Width & Max Boundaries
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
              Controls how wide the content expands before stopping
            </span>

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
                  placeholder="1200px or 1440px"
                  onChange={(e) => handleUpdate({ maxWidth: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
                />
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Height & Overflow
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Min Height
                </label>
                <input
                  type="text"
                  value={currentStyle.minHeight || ''}
                  placeholder="auto or 480px"
                  onChange={(e) => handleUpdate({ minHeight: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Overflow Behavior
                </label>
                <select
                  value={currentStyle.overflow || 'visible'}
                  onChange={(e) => handleUpdate({ overflow: e.target.value as any })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
                >
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden (Clip content)</option>
                  <option value="scroll">Scroll</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. TYPOGRAPHY TAB                                                    */}
      {/* ==================================================================== */}
      {activeTab === 'typography' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
              <option value="'Inter', sans-serif">Inter (Modern Sans)</option>
              <option value="'Outfit', sans-serif">Outfit (Tech Bold)</option>
              <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
              <option value="'Mukta', sans-serif">Mukta (Nepali & English)</option>
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
                    cursor: 'pointer',
                    fontWeight: currentStyle.textAlign === align ? 700 : 500
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                Corner Rounding (Radius)
              </label>
              <input
                type="text"
                value={currentStyle.borderRadius || ''}
                placeholder="12px, 16px, or 9999px"
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
              placeholder="#e2e8f0 or rgba(255,255,255,0.15)"
              onChange={(e) => handleUpdate({ borderColor: e.target.value })}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
              Box Drop Shadow
            </label>
            <select
              value={currentStyle.boxShadow || ''}
              onChange={(e) => handleUpdate({ boxShadow: e.target.value })}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
            >
              <option value="">None / Flat</option>
              <option value="0 1px 3px rgba(0,0,0,0.06)">Subtle (sm)</option>
              <option value="0 4px 14px rgba(0,0,0,0.08)">Card Float (md)</option>
              <option value="0 10px 30px rgba(0,0,0,0.12)">Elevated (lg)</option>
              <option value="0 20px 48px rgba(36,87,214,0.14)">MindSparQ Brand Glow (xl)</option>
            </select>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. LAYOUT & GAPS TAB                                                 */}
      {/* ==================================================================== */}
      {activeTab === 'layout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Row Gap (Vertical Gap)
              </label>
              <input
                type="text"
                value={currentStyle.rowGap || ''}
                placeholder="16px or 1.5rem"
                onChange={(e) => handleUpdate({ rowGap: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.8125rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Column Gap (Horizontal Gap)
              </label>
              <input
                type="text"
                value={currentStyle.columnGap || ''}
                placeholder="16px or 1.5rem"
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
              <option value="row">Row (Horizontal left to right)</option>
              <option value="column">Column (Vertical top to bottom)</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column-reverse">Column Reverse</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
