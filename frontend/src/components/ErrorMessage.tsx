import type { CSSProperties } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, transition } from '../styles/designTokens';

interface ErrorMessageProps {
  /**
   * The error message to display
   */
  message: string;

  /**
   * Optional error details (e.g., for debugging)
   */
  details?: string;

  /**
   * Optional retry callback
   */
  onRetry?: () => void;

  /**
   * Optional dismiss callback
   */
  onDismiss?: () => void;
}

/**
 * ErrorMessage Component
 *
 * Displays error messages with consistent styling using design tokens.
 * Supports optional retry functionality and dismissal.
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   message="Failed to load content"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function ErrorMessage({ message, details, onRetry, onDismiss }: ErrorMessageProps) {
  const { colors } = useTheme();

  const containerStyle: CSSProperties = {
    backgroundColor: colors.errorLight,
    border: `1px solid ${colors.errorBorder}`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'space-between',
  };

  const iconStyle: CSSProperties = {
    color: colors.error,
    fontSize: fontSize.xl,
    flexShrink: 0,
  };

  const messageContainerStyle: CSSProperties = {
    flex: 1,
  };

  const messageTextStyle: CSSProperties = {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    margin: 0,
  };

  const detailsTextStyle: CSSProperties = {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    margin: `${spacing.xs} 0 0 0`,
    fontFamily: 'monospace',
  };

  const buttonContainerStyle: CSSProperties = {
    display: 'flex',
    gap: spacing.sm,
    marginTop: spacing.sm,
  };

  const buttonBaseStyle: CSSProperties = {
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.md,
    border: 'none',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    cursor: 'pointer',
    transition: transition.fast,
  };

  const retryButtonStyle: CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: colors.error,
    color: '#ffffff',
  };

  const dismissButtonStyle: CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: colors.textMuted,
    fontSize: fontSize.lg,
    cursor: 'pointer',
    padding: spacing.xs,
    lineHeight: 1,
    transition: transition.fast,
  };

  return (
    <div style={containerStyle} role="alert" aria-live="assertive">
      <div style={headerStyle}>
        <div style={messageContainerStyle}>
          <div style={iconStyle} aria-hidden="true">⚠️</div>
          <p style={messageTextStyle}>{message}</p>
          {details && (
            <p style={detailsTextStyle}>{details}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={closeButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.textMuted;
            }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>

      {(onRetry || onDismiss) && (
        <div style={buttonContainerStyle}>
          {onRetry && (
            <button
              onClick={onRetry}
              style={retryButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.errorHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.error;
              }}
            >
              Retry
            </button>
          )}
          {onDismiss && !onRetry && (
            <button
              onClick={onDismiss}
              style={dismissButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bgTertiary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}
