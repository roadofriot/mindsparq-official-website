import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'minimal' | 'full';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'pill', className = '' }) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
        className={`lang-switcher-minimal ${className}`}
        aria-label={`Switch language. Current: ${language === 'en' ? 'English' : 'Nepali'}`}
        title={`Switch to ${language === 'en' ? 'नेपाली (Nepali)' : 'English'}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '4px 8px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--color-text)',
          cursor: 'pointer',
          backgroundColor: 'var(--color-surface-hover)',
          transition: 'all var(--transition-fast)'
        }}
      >
        <Globe size={14} style={{ color: 'var(--color-primary-600)' }} />
        <span>{language === 'en' ? '🇳🇵 NE' : '🇬🇧 EN'}</span>
      </button>
    );
  }

  return (
    <div
      className={`lang-switcher-pill ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px',
        borderRadius: '20px',
        backgroundColor: 'var(--color-surface-hover)',
        border: '1px solid var(--color-border)',
        fontSize: '0.75rem',
        fontWeight: 600
      }}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        style={{
          padding: '4px 10px',
          borderRadius: '16px',
          border: 'none',
          background: language === 'en' ? 'var(--color-primary-600)' : 'transparent',
          color: language === 'en' ? '#ffffff' : 'var(--color-text-secondary)',
          cursor: 'pointer',
          fontWeight: language === 'en' ? 700 : 500,
          transition: 'all var(--transition-fast)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
        aria-pressed={language === 'en'}
      >
        <span>🇬🇧</span>
        <span>English</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('ne')}
        style={{
          padding: '4px 10px',
          borderRadius: '16px',
          border: 'none',
          background: language === 'ne' ? 'var(--color-primary-600)' : 'transparent',
          color: language === 'ne' ? '#ffffff' : 'var(--color-text-secondary)',
          cursor: 'pointer',
          fontWeight: language === 'ne' ? 700 : 500,
          transition: 'all var(--transition-fast)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
        aria-pressed={language === 'ne'}
      >
        <span>🇳🇵</span>
        <span>नेपाली</span>
      </button>
    </div>
  );
};
