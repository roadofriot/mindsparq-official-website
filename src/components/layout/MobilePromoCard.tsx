import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { getAdSlot, AdSlotConfig } from '../../services/adRailService';
import { useLanguage } from '../../context/LanguageContext';

export const MobilePromoCard: React.FC = () => {
  const [promo, setPromo] = useState<AdSlotConfig>(() => getAdSlot('mobile-inline-promo'));
  const [isDismissed, setIsDismissed] = useState(false);
  const { language } = useLanguage();
  const isNe = language === 'ne';

  useEffect(() => {
    const handleUpdate = () => {
      setPromo(getAdSlot('mobile-inline-promo'));
    };

    window.addEventListener('mindsparq-ads-updated', handleUpdate);
    return () => {
      window.removeEventListener('mindsparq-ads-updated', handleUpdate);
    };
  }, []);

  if (!promo.isActive || !promo.imageUrl || isDismissed) {
    return null;
  }

  const isInternal = promo.destinationUrl.startsWith('/');
  const badgeText = isNe && promo.badgeNepali ? promo.badgeNepali : promo.badge;

  return (
    <div
      className="mobile-promo-wrapper container"
      style={{
        marginTop: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
        display: 'none' // Controlled by CSS media queries in index.css (displayed on <1200px)
      }}
    >
      <div
        className="card"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
      >
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label={isNe ? 'विज्ञापन बन्द गर्नुहोस्' : 'Dismiss promotion'}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            zIndex: 10
          }}
        >
          <X size={16} />
        </button>

        {/* Image Preview */}
        <div
          style={{
            width: '100px',
            height: '70px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            flexShrink: 0,
            backgroundColor: '#1e293b'
          }}
        >
          <img
            src={promo.imageUrl}
            alt={promo.altText || promo.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Text Content */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--color-primary-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '2px'
            }}
          >
            <Sparkles size={11} />
            <span>{promo.isSponsored ? (isNe ? 'प्रायोजित' : 'Sponsored') : badgeText}</span>
          </div>

          <h4
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: '0 0 6px 0',
              lineHeight: 1.3
            }}
          >
            {promo.title}
          </h4>

          {isInternal ? (
            <Link
              to={promo.destinationUrl}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-primary-600)',
                textDecoration: 'none'
              }}
            >
              <span>{isNe ? 'थप जानकारी हेर्नुहोस्' : 'Learn More'}</span>
              <ArrowRight size={12} />
            </Link>
          ) : (
            <a
              href={promo.destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-primary-600)',
                textDecoration: 'none'
              }}
            >
              <span>{isNe ? 'थप जानकारी हेर्नुहोस्' : 'Learn More'}</span>
              <ArrowRight size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
