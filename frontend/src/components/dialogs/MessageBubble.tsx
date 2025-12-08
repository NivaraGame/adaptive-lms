/**
 * MessageBubble Component
 *
 * Displays an individual message in the chat interface with appropriate styling
 * based on sender type (user or system). Includes timestamp and question badge.
 *
 * References:
 * - Message types: @frontend/src/types/dialog.ts
 * - Theme context: @frontend/src/contexts/ThemeContext.tsx
 * - Design tokens: @frontend/src/styles/designTokens.ts
 *
 * @example
 * ```tsx
 * <MessageBubble
 *   message={messageObject}
 *   isUser={message.sender_type === 'user'}
 * />
 * ```
 */

import type { CSSProperties } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../styles/designTokens';
import type { Message } from '../../types/dialog';

/**
 * Props interface for MessageBubble component
 */
export interface MessageBubbleProps {
  /** Message object containing content, sender, timestamp, etc. */
  message: Message;
  /** Whether this message is from the user (vs system) */
  isUser: boolean;
}

/**
 * Format timestamp to readable time string
 * Shows relative time for recent messages, absolute time otherwise
 */
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    // Just now (< 1 minute)
    if (diffMins < 1) {
      return 'Just now';
    }

    // X minutes ago (< 60 minutes)
    if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    }

    // HH:MM for today
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

    // MMM DD, HH:MM for this year
    const isThisYear = date.getFullYear() === now.getFullYear();
    if (isThisYear) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // MMM DD, YYYY for older
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

/**
 * MessageBubble component
 *
 * Renders a single message with chat bubble styling.
 * User messages appear on the right with primary color background.
 * System messages appear on the left with secondary background.
 */
export default function MessageBubble({ message, isUser }: MessageBubbleProps) {
  const { colors } = useTheme();

  // Container style - controls alignment
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: isUser ? 'flex-end' : 'flex-start',
    marginBottom: spacing.lg,
    animation: 'fadeInSlideUp 0.3s ease-out',
  };

  // Bubble style - the message box itself
  const bubbleStyle: CSSProperties = {
    maxWidth: '70%',
    padding: spacing.lg,
    backgroundColor: isUser ? colors.primary : colors.bgSecondary,
    color: isUser ? '#ffffff' : colors.textPrimary,
    borderRadius: '16px',
    // Different corner radiuses for "tail" effect
    borderTopLeftRadius: isUser ? '16px' : '4px',
    borderTopRightRadius: isUser ? '4px' : '16px',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    boxShadow: colors.shadowSm,
    border: isUser ? 'none' : `1px solid ${colors.border}`,
    wordWrap: 'break-word',
    lineHeight: '1.5',
    position: 'relative',
  };

  // Content wrapper - for text and badges
  const contentStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  };

  // Question badge style
  const questionBadgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    padding: `${spacing.xs} ${spacing.sm}`,
    backgroundColor: isUser
      ? 'rgba(255, 255, 255, 0.2)'
      : colors.infoLight,
    color: isUser ? '#ffffff' : colors.info,
    borderRadius: '6px',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    alignSelf: 'flex-start',
  };

  // Message text style
  const textStyle: CSSProperties = {
    fontSize: fontSize.base,
    margin: 0,
    whiteSpace: 'pre-wrap',
  };

  // Timestamp style
  const timestampStyle: CSSProperties = {
    fontSize: fontSize.xs,
    color: isUser ? 'rgba(255, 255, 255, 0.7)' : colors.textMuted,
    marginTop: spacing.xs,
    textAlign: isUser ? 'right' : 'left',
  };

  return (
    <div style={containerStyle}>
      <div style={bubbleStyle}>
        <div style={contentStyle}>
          {/* Question badge if message is a question */}
          {message.is_question && (
            <div style={questionBadgeStyle}>
              <span>❓</span>
              <span>Question</span>
            </div>
          )}

          {/* Message content */}
          <div style={textStyle}>{message.content}</div>
        </div>
      </div>

      {/* Timestamp below bubble */}
      <div style={timestampStyle}>{formatTimestamp(message.timestamp)}</div>

      {/* CSS keyframes for animation - injected once */}
      <style>{`
        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
