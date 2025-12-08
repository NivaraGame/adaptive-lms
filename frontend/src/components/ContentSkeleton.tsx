import type { CSSProperties } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../styles/designTokens';

/**
 * ContentSkeleton Component
 *
 * Displays a skeleton loader mimicking content layout.
 * Used while content is being fetched to provide visual feedback.
 *
 * @example
 * ```tsx
 * <ContentSkeleton />
 * ```
 */
export function ContentSkeleton() {
  const { colors } = useTheme();

  // Inject pulsing animation into the document head if not already present
  if (typeof document !== 'undefined') {
    const styleId = 'skeleton-pulse-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    padding: spacing['3xl'],
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    boxShadow: `0 2px 8px ${colors.border}`,
  };

  const skeletonBaseStyle: CSSProperties = {
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
  };

  // Title skeleton (wide rectangle)
  const titleStyle: CSSProperties = {
    ...skeletonBaseStyle,
    height: '32px',
    width: '70%',
  };

  // Subtitle skeleton
  const subtitleStyle: CSSProperties = {
    ...skeletonBaseStyle,
    height: '20px',
    width: '40%',
  };

  // Body skeleton (multiple lines)
  const bodyLineStyle: CSSProperties = {
    ...skeletonBaseStyle,
    height: '16px',
    width: '100%',
  };

  const bodyLineShortStyle: CSSProperties = {
    ...skeletonBaseStyle,
    height: '16px',
    width: '85%',
  };

  const bodyLineMediumStyle: CSSProperties = {
    ...skeletonBaseStyle,
    height: '16px',
    width: '92%',
  };

  // Button skeleton at bottom
  const buttonStyle: CSSProperties = {
    ...skeletonBaseStyle,
    height: '40px',
    width: '120px',
    marginTop: spacing.lg,
  };

  const bodyContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    marginTop: spacing.lg,
  };

  return (
    <div style={containerStyle} role="status" aria-label="Loading content">
      {/* Title skeleton */}
      <div style={titleStyle} />

      {/* Subtitle skeleton */}
      <div style={subtitleStyle} />

      {/* Body skeleton (multiple lines) */}
      <div style={bodyContainerStyle}>
        <div style={bodyLineStyle} />
        <div style={bodyLineMediumStyle} />
        <div style={bodyLineShortStyle} />
        <div style={bodyLineStyle} />
        <div style={bodyLineMediumStyle} />
        <div style={bodyLineStyle} />
      </div>

      {/* Button skeleton */}
      <div style={buttonStyle} />

      <span className="sr-only">Loading content...</span>
    </div>
  );
}
