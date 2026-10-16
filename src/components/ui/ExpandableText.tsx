import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxLength = 100,
  className = '',
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language } = useLanguage();

  if (!text || text.length <= maxLength) {
    return (
      <p className={className} style={{ margin: 0, lineHeight: 1.5, ...style }}>
        {text}
      </p>
    );
  }

  const displayText = isExpanded ? text : text.slice(0, maxLength).trim() + '...';

  const readMoreLabel = language === 'ne' ? 'थप पढ्नुहोस्' : 'Read More';
  const showLessLabel = language === 'ne' ? 'कम देखाउनुहोस्' : 'Show Less';

  return (
    <div className={`expandable-text-wrapper ${className}`} style={{ ...style }}>
      <p style={{ margin: 0, lineHeight: 1.5, display: 'inline', fontSize: 'inherit', color: 'inherit' }}>
        {displayText}{' '}
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        aria-expanded={isExpanded}
        style={{
          background: 'none',
          border: 'none',
          padding: '0 2px',
          color: 'var(--color-primary-600)',
          fontWeight: 700,
          fontSize: '0.8125em',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          textDecoration: 'underline',
          verticalAlign: 'baseline'
        }}
      >
        <span>{isExpanded ? showLessLabel : readMoreLabel}</span>
        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
    </div>
  );
};
