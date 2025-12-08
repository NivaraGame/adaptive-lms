/**
 * DialogHeader Component
 *
 * Displays session information and controls for a learning dialog.
 * Shows dialog topic, type badge, session start time, and end session button.
 *
 * References:
 * - Dialog types: @frontend/src/types/dialog.ts
 * - Theme context: @frontend/src/contexts/ThemeContext.tsx
 * - Design tokens: @frontend/src/styles/designTokens.ts
 *
 * @example
 * ```tsx
 * <DialogHeader
 *   dialog={currentDialog}
 *   onEndSession={() => handleEndSession()}
 *   loading={isLoading}
 * />
 * ```
 */

import type { CSSProperties } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../styles/designTokens';
import type { Dialog } from '../../types/dialog';

/**
 * Props interface for DialogHeader component
 */
export interface DialogHeaderProps {
  /** Dialog object containing session information, or null if not loaded */
  dialog: Dialog | null;
  /** Callback function to end the current session */
  onEndSession: () => void;
  /** Loading state for async operations (disables button) */
  loading: boolean;
}

/**
 * Get display label for dialog type
 */
const getDialogTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    educational: '📚 Educational',
    test: '📝 Test',
    assessment: '📊 Assessment',
    reflective: '🤔 Reflective',
  };
  return labels[type] || '📚 Dialog';
};

/**
 * Format timestamp to readable date/time string
 */
const formatStartTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown';
  }
};

/**
 * DialogHeader component
 *
 * Displays session information at the top of the learning interface.
 * Includes dialog topic, type badge, start time, and end session button.
 */
export default function DialogHeader({
  dialog,
  onEndSession,
  loading,
}: DialogHeaderProps) {
  const { colors } = useTheme();

  // Container style - modern card with elevation
  const headerStyle: CSSProperties = {
    padding: spacing['2xl'],
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    marginBottom: spacing['2xl'],
    boxShadow: colors.shadowCard,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  };

  // Top row: Topic and end button
  const topRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
  };

  // Topic heading style
  const topicStyle: CSSProperties = {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  };

  // Bottom row: Type badge and time
  const bottomRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
    flexWrap: 'wrap',
  };

  // Badge style for dialog type
  const badgeStyle: CSSProperties = {
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    borderRadius: '8px',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    border: `1px solid ${colors.primaryBorder}`,
  };

  // Time display style
  const timeStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  };

  // End session button style
  const endButtonStyle: CSSProperties = {
    padding: `${spacing.md} ${spacing.xl}`,
    backgroundColor: colors.error,
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    transition: 'all 0.2s',
  };

  // Handle end button hover
  const handleEndButtonHover = (
    e: React.MouseEvent<HTMLButtonElement>,
    enter: boolean
  ) => {
    if (loading) return;
    const target = e.currentTarget;
    if (enter) {
      target.style.backgroundColor = colors.errorHover;
      target.style.transform = 'scale(1.02)';
    } else {
      target.style.backgroundColor = colors.error;
      target.style.transform = 'scale(1)';
    }
  };

  // Show loading state if dialog is not loaded
  if (!dialog) {
    return (
      <div style={headerStyle}>
        <div style={{ color: colors.textMuted, fontSize: fontSize.base }}>
          ⏳ Loading session...
        </div>
      </div>
    );
  }

  return (
    <div style={headerStyle}>
      {/* Top Row: Topic and End Button */}
      <div style={topRowStyle}>
        <h2 style={topicStyle}>
          <span>🎓</span>
          <span>{dialog.topic || 'Learning Session'}</span>
        </h2>

        <button
          onClick={onEndSession}
          disabled={loading}
          style={endButtonStyle}
          onMouseEnter={(e) => handleEndButtonHover(e, true)}
          onMouseLeave={(e) => handleEndButtonHover(e, false)}
          aria-label="End learning session"
        >
          {loading ? '⏳ Ending...' : 'End Session'}
        </button>
      </div>

      {/* Bottom Row: Type Badge and Time */}
      <div style={bottomRowStyle}>
        <div style={badgeStyle}>{getDialogTypeLabel(dialog.dialog_type)}</div>

        <div style={timeStyle}>
          <span>⏱️</span>
          <span>Started: {formatStartTime(dialog.started_at)}</span>
        </div>

        {dialog.ended_at && (
          <div
            style={{
              ...timeStyle,
              color: colors.textMuted,
            }}
          >
            <span>🏁</span>
            <span>Ended: {formatStartTime(dialog.ended_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
