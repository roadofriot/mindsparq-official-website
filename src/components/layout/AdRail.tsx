import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles } from 'lucide-react';
import { getAdSlot, AdSlotConfig } from '../../services/adRailService';
import { useLanguage } from '../../context/LanguageContext';

interface AdRailProps {
  side: 'left' | 'right';
  className?: string;
}

export const AdRail: React.FC<AdRailProps> = ({ side, className = '' }) => {
  const slotId = side === 'left' ? 'site-rail-left' : 'site-rail-right';
  const [adConfig, setAdConfig] = useState<AdSlotConfig>(() => getAdSlot(slotId));
  const [imageError, setImageError] = useState(false);
  const { language } = useLanguage();
  const isNe = language === 'ne';

  useEffect(() => {
    const handleUpdate = () => {
      setAdConfig(getAdSlot(slotId));
      setImageError(false);
    };

    window.addEventListener('mindsparq-ads-updated', handleUpdate);
    return () => {
      window.removeEventListener('mindsparq-ads-updated', handleUpdate);
    };
  }, [slotId]);

  if (!adConfig.isActive || !adConfig.imageUrl || imageError) {
    return null;
  }

  const isInternal = adConfig.destinationUrl.startsWith('/');
  const badgeText = isNe && adConfig.badgeNepali ? adConfig.badgeNepali : adConfig.badge;

  const content = (
    <article
      className="ad-rail-card card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.06)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        width: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.06)';
      }}
    >
      {/* Badge Overlay */}
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
          backgroundColor: adConfig.isSponsored ? 'rgba(234, 88, 12, 0.92)' : 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(6px)',
          color: '#ffffff',
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        <Sparkles size={11} />
        <span>{adConfig.isSponsored ? (isNe ? 'प्रायोजित' : 'Sponsored') : badgeText}</span>
      </div>

      {/* Portrait Image (2:3 Aspect Ratio) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2 / 3',
          backgroundColor: 'var(--color-bg-secondary, #1e293b)',
          overflow: 'hidden'
        }}
      >
        <img
          src={adConfig.imageUrl}
          alt={adConfig.altText || adConfig.title}
          loading="lazy"
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />

        {/* Subtle Dark Gradient Overlay at bottom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Title and Action Tag overlay on bottom of card */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '10px 10px',
            color: '#ffffff',
            zIndex: 2
          }}
        >
          <h4
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              lineHeight: 1.3,
              margin: '0 0 6px 0',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {adConfig.title}
          </h4>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: '#38bdf8'
            }}
          >
            <span>{isNe ? 'थप जान्नुहोस्' : 'Explore Details'}</span>
            <ExternalLink size={11} />
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <aside
      className={`ad-rail-slot ad-rail-${side} ${className}`}
      aria-label={adConfig.isSponsored ? 'Advertisement' : 'Promotions'}
      style={{
        width: '180px',
        flexShrink: 0,
        alignSelf: 'flex-start',
        position: 'sticky',
        top: '84px',
        zIndex: 20
      }}
    >
      {isInternal ? (
        <Link
          to={adConfig.destinationUrl}
          style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}
        >
          {content}
        </Link>
      ) : (
        <a
          href={adConfig.destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}
        >
          {content}
        </a>
      )}
    </aside>
  );
};
