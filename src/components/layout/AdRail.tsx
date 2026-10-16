import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
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
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        width: '100%',
        minHeight: '560px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Badge Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '999px',
          backgroundColor: adConfig.isSponsored ? 'rgba(234, 88, 12, 0.95)' : 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          color: '#ffffff',
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
        }}
      >
        <Sparkles size={12} />
        <span>{adConfig.isSponsored ? (isNe ? 'प्रायोजित' : 'Sponsored') : badgeText}</span>
      </div>

      {/* Tall Portrait Media Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '380px',
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
            transition: 'transform 0.5s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
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
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.1) 40%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Content & Action Block extending all the way down */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 16px 18px',
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)'
        }}
      >
        <div>
          <h4
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              lineHeight: 1.35,
              margin: '0 0 8px 0',
              color: 'var(--color-text)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {adConfig.title}
          </h4>

          {adConfig.altText && (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.45,
                margin: '0 0 10px 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {adConfig.altText}
            </p>
          )}
        </div>

        {/* Full-Width Interactive Action Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            padding: '9px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-600)',
            color: '#ffffff',
            fontSize: '0.8125rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)',
            marginTop: '8px'
          }}
        >
          <span>{isNe ? 'थप जानकारी हेर्नुहोस्' : 'Explore Details'}</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </article>
  );

  return (
    <aside
      className={`ad-rail-slot ad-rail-${side} ${className}`}
      aria-label={adConfig.isSponsored ? 'Advertisement' : 'Promotions'}
      style={{
        width: '280px',
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
