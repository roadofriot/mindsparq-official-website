import React from 'react';
import { SiteSection } from '../../services/siteCustomizerService';

interface DynamicSectionWrapperProps {
  section: SiteSection;
  children: React.ReactNode;
}

export const DynamicSectionWrapper: React.FC<DynamicSectionWrapperProps> = ({ section, children }) => {
  const style = section.layout_style || {};

  // Padding mapping
  const getPaddingVal = (val?: string) => {
    switch (val) {
      case 'none': return '0px';
      case 'sm': return 'var(--space-6, 24px)';
      case 'md': return 'var(--space-12, 48px)';
      case 'lg': return 'var(--space-16, 80px)';
      case 'xl': return '120px';
      default: return 'var(--space-10, 40px)';
    }
  };

  // Max width mapping
  const getMaxWidth = (val?: string) => {
    switch (val) {
      case 'narrow': return '960px';
      case 'wide': return '1440px';
      case 'full': return '100%';
      case 'standard':
      default:
        return '1200px';
    }
  };

  // Min height mapping
  const getMinHeight = () => {
    switch (style.minHeight) {
      case 'compact': return '360px';
      case 'medium': return '520px';
      case 'screen': return '100vh';
      case 'custom': return `${style.customHeightPx || 500}px`;
      case 'auto':
      default:
        return 'auto';
    }
  };

  const paddingTop = getPaddingVal(style.paddingTop);
  const paddingBottom = getPaddingVal(style.paddingBottom);
  const maxWidth = getMaxWidth(style.containerWidth);
  const minHeight = getMinHeight();

  // Background styling
  const hasBgImage = Boolean(style.backgroundImageUrl);
  const overlayOpacity = style.backgroundOverlayOpacity ?? 0.4;

  return (
    <section
      id={`section-${section.key}`}
      data-style-id={`section.${section.key}`}
      style={{
        position: 'relative',
        width: 'var(--ms-w, 100%)',
        minHeight: 'var(--ms-min-h, ' + minHeight + ')',
        paddingTop: 'var(--ms-p-top, ' + paddingTop + ')',
        paddingBottom: 'var(--ms-p-bottom, ' + paddingBottom + ')',
        marginTop: 'var(--ms-m-top, 0px)',
        marginBottom: 'var(--ms-m-bottom, 0px)',
        backgroundColor: 'var(--ms-bg, ' + (style.backgroundColor || 'transparent') + ')',
        backgroundImage: style.backgroundGradient
          ? style.backgroundGradient
          : hasBgImage
          ? `url("${style.backgroundImageUrl}")`
          : undefined,
        backgroundSize: hasBgImage ? 'cover' : undefined,
        backgroundPosition: hasBgImage ? 'center' : undefined,
        overflow: 'hidden'
      }}
    >
      {/* Background Image Dark Overlay */}
      {hasBgImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: `rgba(5, 12, 26, ${overlayOpacity})`,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Center Layout Container */}
      <div
        data-style-id={`section.${section.key}.container`}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 'var(--ms-max-w, ' + maxWidth + ')',
          margin: '0 auto',
          paddingLeft: 'var(--ms-p-left, var(--space-4, 16px))',
          paddingRight: 'var(--ms-p-right, var(--space-4, 16px))',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </div>
    </section>
  );
};
