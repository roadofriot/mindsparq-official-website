import React from 'react';

export interface PageBannerBadge {
  icon?: React.ReactNode;
  label: string;
  variant?: 'primary' | 'accent' | 'neutral';
}

export interface PageBannerProps {
  eyebrowIcon?: React.ReactNode;
  eyebrowText: string;
  title: string;
  subtitle?: string;
  backgroundImageUrl: string;
  badges?: PageBannerBadge[];
  children?: React.ReactNode;
}

export const PageBanner: React.FC<PageBannerProps> = ({
  eyebrowIcon,
  eyebrowText,
  title,
  subtitle,
  backgroundImageUrl,
  badges,
  children
}) => {
  return (
    <section
      className="page-hero-banner"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(280px, 35vh, 380px)',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(var(--space-10), 6vw, var(--space-16)) 0 clamp(var(--space-8), 5vw, var(--space-14))',
        backgroundColor: '#0a0f1d',
        color: '#ffffff',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Background Image with Depth Blur & Dark Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.32) saturate(1.2)',
          transform: 'scale(1.02)',
          zIndex: 0
        }}
      />

      {/* Atmospheric Radial Color Wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 70% 30%, rgba(14, 165, 233, 0.28) 0%, rgba(99, 102, 241, 0.18) 40%, rgba(10, 15, 29, 0.85) 85%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Bottom Vignette for Smooth Transition */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '80px',
          background: 'linear-gradient(to top, rgba(10, 15, 29, 0.95), transparent)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      <div
        className="container"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '960px',
          margin: '0 auto'
        }}
      >
        {/* Eyebrow Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(14, 165, 233, 0.18)',
            border: '1.5px solid rgba(56, 189, 248, 0.5)',
            color: '#38bdf8',
            fontSize: 'var(--font-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 'var(--space-4)',
            boxShadow: '0 2px 10px rgba(14, 165, 233, 0.2)'
          }}
        >
          {eyebrowIcon}
          <span>{eyebrowText}</span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#ffffff',
            marginBottom: 'var(--space-4)',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)'
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.1875rem)',
              color: '#e2e8f0',
              lineHeight: 1.65,
              maxWidth: '820px',
              margin: '0 0 var(--space-5) 0',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)'
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Badges Row */}
        {badges && badges.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
              marginTop: 'var(--space-4)'
            }}
          >
            {badges.map((b, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  backgroundColor:
                    b.variant === 'primary'
                      ? 'rgba(14, 165, 233, 0.2)'
                      : b.variant === 'accent'
                      ? 'rgba(234, 88, 12, 0.2)'
                      : 'rgba(255, 255, 255, 0.12)',
                  border:
                    b.variant === 'primary'
                      ? '1px solid rgba(56, 189, 248, 0.4)'
                      : b.variant === 'accent'
                      ? '1px solid rgba(251, 146, 60, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.25)',
                  color:
                    b.variant === 'primary'
                      ? '#38bdf8'
                      : b.variant === 'accent'
                      ? '#fb923c'
                      : '#f1f5f9',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backdropFilter: 'blur(6px)'
                }}
              >
                {b.icon}
                <span>{b.label}</span>
              </span>
            ))}
          </div>
        )}

        {children && <div style={{ marginTop: 'var(--space-5)' }}>{children}</div>}
      </div>
    </section>
  );
};
