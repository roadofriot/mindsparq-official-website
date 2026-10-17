import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  showTagline?: boolean;
  className?: string;
  iconSize?: number;
}

export const Logo: React.FC<LogoProps> = ({ showTagline = false, className = '', iconSize = 42 }) => {
  return (
    <Link 
      to="/" 
      className={`logo-link ${className}`}
      aria-label="MindSparQ Education & Technology Home"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div 
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          borderRadius: iconSize >= 48 ? '12px' : '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
          background: '#070E1A'
        }}
      >
        <img 
          src="/icon-192.png" 
          alt="MindSparQ 3D App Icon" 
          width={iconSize} 
          height={iconSize}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span 
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)'
          }}
        >
          MindSpar<span style={{ color: 'var(--color-brand-primary)' }}>Q</span>
        </span>
        <span 
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase'
          }}
        >
          {showTagline ? 'Empowering Minds, Sparking Innovation' : 'Education & Technology'}
        </span>
      </div>
    </Link>
  );
};
