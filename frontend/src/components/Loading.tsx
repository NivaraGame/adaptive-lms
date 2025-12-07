import type { CSSProperties } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight } from '../styles/designTokens';

interface LoadingProps {
  /**
   * Optional loading message to display
   */
  message?: string;

  /**
   * Size of the spinner ('small' | 'medium' | 'large')
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether to display as fullscreen centered loading
   * @default false
   */
  fullscreen?: boolean;
}

/**
 * Loading Component
 *
 * Displays a loading spinner with optional message.
 * Reusable across the application for consistent loading states.
 *
 * @example
 * ```tsx
 * <Loading message="Loading content..." />
 * <Loading size="small" />
 * <Loading fullscreen message="Initializing..." />
 * ```
 */
export function Loading({ message, size = 'medium', fullscreen = false }: LoadingProps) {
  const { colors } = useTheme();

  const sizeMap = {
    small: '24px',
    medium: '40px',
    large: '64px',
  };

  const spinnerSize = sizeMap[size];

  const containerStyle: CSSProperties = fullscreen
    ? {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: spacing.lg,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        gap: spacing.lg,
      };

  const spinnerContainerStyle: CSSProperties = {
    position: 'relative',
    width: spinnerSize,
    height: spinnerSize,
  };

  const spinnerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    border: `3px solid ${colors.border}`,
    borderTop: `3px solid ${colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  const messageStyle: CSSProperties = {
    color: colors.textSecondary,
    fontSize: size === 'small' ? fontSize.sm : fontSize.base,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  };

  // Inject keyframe animation into the document head if not already present
  if (typeof document !== 'undefined') {
    const styleId = 'loading-spinner-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  return (
    <div style={containerStyle} role="status" aria-live="polite">
      <div style={spinnerContainerStyle}>
        <div style={spinnerStyle} aria-hidden="true"></div>
      </div>
      {message && <p style={messageStyle}>{message}</p>}
      <span className="sr-only">{message || 'Loading...'}</span>
    </div>
  );
}
