import type { CSSProperties } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../styles/designTokens';

/**
 * MessageSkeleton Component
 *
 * Displays a skeleton loader mimicking message bubble layout.
 * Used while messages are being fetched to provide visual feedback.
 *
 * @example
 * ```tsx
 * <MessageSkeleton />
 * ```
 */
export function MessageSkeleton() {
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
    gap: spacing.xl,
    padding: spacing['2xl'],
  };

  const skeletonBaseStyle: CSSProperties = {
    backgroundColor: colors.border,
    borderRadius: borderRadius.lg,
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
  };

  // Left-aligned message (system)
  const leftMessageContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.md,
    justifyContent: 'flex-start',
  };

  const leftAvatarStyle: CSSProperties = {
    ...skeletonBaseStyle,
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    flexShrink: 0,
  };

  const leftBubbleStyle: CSSProperties = {
    ...skeletonBaseStyle,
    height: '60px',
    maxWidth: '70%',
    width: '50%',
    borderBottomLeftRadius: borderRadius.sm,
  };

  // Right-aligned message (user)
  const rightMessageContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.md,
    justifyContent: 'flex-end',
  };

  const rightAvatarStyle: CSSProperties = {
    ...skeletonBaseStyle,
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    flexShrink: 0,
  };

  const rightBubbleStyle: CSSProperties = {
    ...skeletonBaseStyle,
    height: '48px',
    maxWidth: '70%',
    width: '40%',
    borderBottomRightRadius: borderRadius.sm,
  };

  return (
    <div style={containerStyle} role="status" aria-label="Loading messages">
      {/* Left-aligned message (system) */}
      <div style={leftMessageContainerStyle}>
        <div style={leftAvatarStyle} />
        <div style={leftBubbleStyle} />
      </div>

      {/* Right-aligned message (user) */}
      <div style={rightMessageContainerStyle}>
        <div style={rightBubbleStyle} />
        <div style={rightAvatarStyle} />
      </div>

      {/* Left-aligned message (system) */}
      <div style={leftMessageContainerStyle}>
        <div style={leftAvatarStyle} />
        <div style={{ ...leftBubbleStyle, width: '55%', height: '72px' }} />
      </div>

      <span className="sr-only">Loading messages...</span>
    </div>
  );
}
