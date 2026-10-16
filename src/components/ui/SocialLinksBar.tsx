import React from 'react';

export interface SocialLinksConfig {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
}

export const DEFAULT_SOCIAL_LINKS: SocialLinksConfig = {
  facebook: 'https://facebook.com/mindsparqeducation',
  instagram: 'https://instagram.com/mindsparqeducation',
  whatsapp: 'https://wa.me/9779857058666',
  tiktok: 'https://www.tiktok.com/@mindsparqeducation',
  youtube: 'https://youtube.com/@mindsparqeducation',
  linkedin: 'https://linkedin.com/company/mindsparqeducation'
};

const STORAGE_KEY_SOCIAL = 'mindsparq_social_config';

export function getActiveSocialLinks(): SocialLinksConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SOCIAL);
    if (saved) {
      return { ...DEFAULT_SOCIAL_LINKS, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SOCIAL_LINKS;
}

export function saveActiveSocialLinks(links: SocialLinksConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_SOCIAL, JSON.stringify(links));
  } catch {
    // ignore
  }
}

interface SocialLinksBarProps {
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SocialLinksBar: React.FC<SocialLinksBarProps> = ({
  className = '',
  showLabels = false,
  size = 'md'
}) => {
  const links = getActiveSocialLinks();

  const iconSizes = {
    sm: 15,
    md: 18,
    lg: 22
  };

  const buttonDimensions = {
    sm: { width: '32px', height: '32px' },
    md: { width: '40px', height: '40px' },
    lg: { width: '48px', height: '48px' }
  };

  const socialItems = [
    {
      name: 'Facebook',
      url: links.facebook,
      color: '#1877F2',
      bgHover: 'rgba(24, 119, 242, 0.15)',
      icon: (
        <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: links.instagram,
      color: '#E4405F',
      bgHover: 'rgba(228, 64, 95, 0.15)',
      icon: (
        <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    },
    {
      name: 'WhatsApp',
      url: links.whatsapp,
      color: '#25D366',
      bgHover: 'rgba(37, 211, 102, 0.15)',
      icon: (
        <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.57 20.15 9.12 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.32 4.54 17.88 6.1C19.44 7.66 20.28 9.72 20.27 11.92C20.28 16.46 16.59 20.15 12.05 20.15ZM16.57 14.37C16.32 14.25 15.11 13.65 14.88 13.57C14.66 13.48 14.49 13.44 14.33 13.69C14.16 13.94 13.68 14.51 13.53 14.68C13.39 14.85 13.24 14.87 12.99 14.75C12.74 14.62 11.94 14.36 10.99 13.51C10.25 12.85 9.75 12.04 9.61 11.79C9.46 11.54 9.59 11.41 9.72 11.28C9.83 11.17 9.97 10.99 10.09 10.84C10.22 10.7 10.26 10.59 10.34 10.42C10.42 10.26 10.38 10.11 10.32 9.99C10.26 9.86 9.76 8.64 9.56 8.13C9.36 7.64 9.16 7.71 9.01 7.7C8.87 7.69 8.7 7.69 8.53 7.69C8.36 7.69 8.09 7.75 7.86 8C7.63 8.25 7 8.84 7 10.04C7 11.24 7.88 12.4 8 12.56C8.13 12.73 9.73 15.18 12.18 16.24C12.76 16.49 13.22 16.64 13.57 16.75C14.16 16.94 14.7 16.91 15.13 16.85C15.61 16.78 16.6 16.25 16.81 15.66C17.02 15.07 17.02 14.57 16.95 14.46C16.89 14.35 16.82 14.49 16.57 14.37Z" />
        </svg>
      )
    },
    {
      name: 'TikTok',
      url: links.tiktok,
      color: '#00F2FE',
      bgHover: 'rgba(0, 242, 254, 0.15)',
      icon: (
        <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
        </svg>
      )
    },
    {
      name: 'YouTube',
      url: links.youtube,
      color: '#FF0000',
      bgHover: 'rgba(255, 0, 0, 0.15)',
      icon: (
        <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      url: links.linkedin,
      color: '#0A66C2',
      bgHover: 'rgba(10, 102, 194, 0.15)',
      icon: (
        <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.3a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
        </svg>
      )
    }
  ];

  return (
    <div
      className={`social-links-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        flexWrap: 'wrap'
      }}
      role="list"
      aria-label="Social media channels"
    >
      {socialItems.map((item) => (
        <a
          key={item.name}
          href={item.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          role="listitem"
          aria-label={`Visit MindSparQ on ${item.name}`}
          title={`MindSparQ on ${item.name}`}
          style={{
            ...buttonDimensions[size],
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface-hover)',
            border: '1px solid var(--color-border)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text)',
            textDecoration: 'none',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = item.color;
            e.currentTarget.style.backgroundColor = item.bgHover;
            e.currentTarget.style.borderColor = item.color;
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text)';
            e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          {item.icon}
          {showLabels && (
            <span style={{ marginLeft: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
              {item.name}
            </span>
          )}
        </a>
      ))}
    </div>
  );
};
