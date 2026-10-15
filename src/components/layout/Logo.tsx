import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ showTagline = false, className = '' }) => {
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
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, #1A44B2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: 'var(--shadow-sm)'
        }}
        aria-hidden="true"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          {/* M shape with Spark */}
          <path 
            d="M4 19V6L9.5 14L12 10L14.5 14L20 6V19" 
            stroke="#FFFFFF" 
            strokeWidth="2.4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <circle cx="12" cy="5" r="2.2" fill="var(--color-amber-highlight)" />
          <path 
            d="M18 4L18.6 5.8L20.4 6.4L18.6 7L18 8.8L17.4 7L15.6 6.4L17.4 5.8L18 4Z" 
            fill="var(--color-accent-teal)" 
          />
        </svg>
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
