import React, { useState } from 'react';

export interface AccessibleHintProps {
  content?: string;
  text?: string;
  shortcut?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  ariaLabel?: string;
}

/**
 * AccessibleHint
 * Provides high-visibility hover & keyboard focus hints on every admin button & icon.
 * Includes optional keyboard shortcut indicator and full aria accessibility.
 */
export const AccessibleHint: React.FC<AccessibleHintProps> = ({
  content,
  text,
  shortcut,
  placement = 'top',
  children,
  ariaLabel
}) => {
  const [visible, setVisible] = useState(false);
  const hintText = text || content || '';

  // Position coordinates styling based on placement
  const getPlacementStyles = (): React.CSSProperties => {
    switch (placement) {
      case 'bottom':
        return {
          top: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          right: 'calc(100% + 6px)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          left: 'calc(100% + 6px)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
      case 'top':
      default:
        return {
          bottom: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
    }
  };

  const childWithEvents = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      setVisible(true);
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      setVisible(false);
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      setVisible(true);
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      setVisible(false);
      children.props.onBlur?.(e);
    },
    'aria-label': ariaLabel || hintText,
    title: '' // Prevent native browser tooltip collision
  });

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {childWithEvents}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 9999,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            padding: '5px 9px',
            borderRadius: '6px',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
            fontSize: '11px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'fadeIn 0.15s ease-out',
            ...getPlacementStyles()
          }}
        >
          <span>{hintText}</span>
          {shortcut && (
            <kbd
              style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 4px',
                borderRadius: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  );
};
