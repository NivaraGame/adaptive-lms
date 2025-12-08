import type { CSSProperties } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, transition } from '../styles/designTokens';

/**
 * Error types for different error scenarios
 */
export type ErrorType =
  | 'session-expired'  // 404 on dialog - needs new session
  | 'network'          // Network/connection errors - needs retry with backoff
  | 'validation'       // Field-level validation errors - inline display
  | 'critical'         // Critical errors - redirect to home
  | 'generic';         // Default error type

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

  /**
   * Error type for specialized handling
   */
  type?: ErrorType;

  /**
   * Callback for starting a new session (session-expired errors)
   */
  onStartNewSession?: () => void;

  /**
   * Callback for navigating to home (critical errors)
   */
  onGoToHome?: () => void;

  /**
   * Retry attempt count (for exponential backoff display)
   */
  retryCount?: number;
}

/**
 * ErrorMessage Component
 *
 * Displays error messages with consistent styling using design tokens.
 * Supports specialized error types with appropriate recovery actions.
 *
 * @example
 * ```tsx
 * // Generic error with retry
 * <ErrorMessage
 *   message="Failed to load content"
 *   onRetry={() => refetch()}
 * />
 *
 * // Session expired error
 * <ErrorMessage
 *   type="session-expired"
 *   message="Your session has expired"
 *   onStartNewSession={() => createNewDialog()}
 * />
 *
 * // Network error with retry count
 * <ErrorMessage
 *   type="network"
 *   message="Connection failed"
 *   onRetry={() => refetch()}
 *   retryCount={2}
 * />
 *
 * // Critical error with redirect
 * <ErrorMessage
 *   type="critical"
 *   message="A critical error occurred"
 *   onGoToHome={() => navigate('/')}
 * />
 * ```
 */
export function ErrorMessage({
  message,
  details,
  onRetry,
  onDismiss,
  type = 'generic',
  onStartNewSession,
  onGoToHome,
  retryCount = 0,
}: ErrorMessageProps) {
  const { colors } = useTheme();

  // Log error to console with full details
  console.error('[ErrorMessage]', {
    type,
    message,
    details,
    retryCount,
    timestamp: new Date().toISOString(),
  });

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

  const primaryButtonStyle: CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: colors.primary,
    color: '#ffffff',
  };

  const warningButtonStyle: CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: colors.warning,
    color: '#ffffff',
  };

  // Determine icon and helper text based on error type
  const getErrorTypeInfo = () => {
    switch (type) {
      case 'session-expired':
        return {
          icon: '🔄',
          helperText: 'Your session has ended. Start a new session to continue learning.',
        };
      case 'network':
        return {
          icon: '📡',
          helperText:
            retryCount > 0
              ? `Connection failed (attempt ${retryCount}). Please check your internet connection.`
              : 'Unable to connect to the server. Please check your internet connection.',
        };
      case 'validation':
        return {
          icon: '⚠️',
          helperText: 'Please check your input and try again.',
        };
      case 'critical':
        return {
          icon: '🛑',
          helperText: 'A critical error occurred. You will be redirected to the home page.',
        };
      default:
        return {
          icon: '⚠️',
          helperText: null,
        };
    }
  };

  const { icon, helperText } = getErrorTypeInfo();

  return (
    <div style={containerStyle} role="alert" aria-live="assertive">
      <div style={headerStyle}>
        <div style={messageContainerStyle}>
          <div style={iconStyle} aria-hidden="true">{icon}</div>
          <p style={messageTextStyle}>{message}</p>
          {helperText && (
            <p style={{ ...detailsTextStyle, fontFamily: 'inherit', marginTop: spacing.sm }}>
              {helperText}
            </p>
          )}
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

      <div style={buttonContainerStyle}>
        {/* Session expired - Start New Session button */}
        {type === 'session-expired' && onStartNewSession && (
          <button
            onClick={onStartNewSession}
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            Start New Session
          </button>
        )}

        {/* Network error - Retry with exponential backoff info */}
        {type === 'network' && onRetry && (
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
            {retryCount > 0 ? `Retry (${retryCount})` : 'Retry'}
          </button>
        )}

        {/* Critical error - Go to Home button */}
        {type === 'critical' && onGoToHome && (
          <button
            onClick={onGoToHome}
            style={warningButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.warningHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.warning;
            }}
          >
            Go to Home
          </button>
        )}

        {/* Generic/Validation - Standard retry */}
        {(type === 'generic' || type === 'validation') && onRetry && (
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

        {/* Dismiss button - shown for all types if callback provided and no primary action */}
        {onDismiss && !onRetry && !onStartNewSession && !onGoToHome && (
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
    </div>
  );
}
