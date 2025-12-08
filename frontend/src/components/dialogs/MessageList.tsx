/**
 * MessageList Component
 *
 * Displays a list of messages in the chat interface with auto-scroll functionality.
 * Maps over messages array and renders MessageBubble for each message.
 * Automatically scrolls to bottom when new messages arrive.
 *
 * References:
 * - MessageBubble: @frontend/src/components/dialogs/MessageBubble.tsx
 * - Message types: @frontend/src/types/dialog.ts
 * - Theme context: @frontend/src/contexts/ThemeContext.tsx
 * - Design tokens: @frontend/src/styles/designTokens.ts
 *
 * @example
 * ```tsx
 * <MessageList
 *   messages={messagesArray}
 *   loading={isLoadingMessages}
 * />
 * ```
 */

import { useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize } from '../../styles/designTokens';
import type { Message } from '../../types/dialog';
import MessageBubble from './MessageBubble';

/**
 * Props interface for MessageList component
 */
export interface MessageListProps {
  /** Array of messages to display */
  messages: Message[];
  /** Loading state for message fetching */
  loading: boolean;
}

/**
 * MessageList component
 *
 * Renders a scrollable list of messages with auto-scroll to bottom.
 * Shows loading spinner when fetching messages.
 * Displays empty state when no messages exist.
 */
export default function MessageList({ messages, loading }: MessageListProps) {
  const { colors } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollContainerRef.current && messages.length > 0) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Container style - scrollable area
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    padding: spacing['2xl'],
    overflowY: 'auto',
    // Calculate height: viewport height minus header, input area, and padding
    // This allows the message list to scroll independently
    maxHeight: 'calc(100vh - 250px)',
    minHeight: '400px',
    backgroundColor: colors.bgPrimary,
  };

  // Empty state style
  const emptyStateStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '300px',
    color: colors.textMuted,
    fontSize: fontSize.base,
    textAlign: 'center',
    gap: spacing.md,
  };

  // Loading spinner style
  const loadingStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    color: colors.textSecondary,
    fontSize: fontSize.base,
    gap: spacing.sm,
  };

  // Spinner animation style
  const spinnerStyle: CSSProperties = {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: `3px solid ${colors.border}`,
    borderTopColor: colors.primary,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  return (
    <div ref={scrollContainerRef} style={containerStyle}>
      {/* Loading indicator */}
      {loading && messages.length === 0 && (
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          <span>Loading messages...</span>
        </div>
      )}

      {/* Empty state - no messages yet */}
      {!loading && messages.length === 0 && (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '3rem' }}>💬</div>
          <div>
            <div style={{ marginBottom: spacing.sm }}>No messages yet.</div>
            <div style={{ fontSize: fontSize.sm }}>
              Start the conversation!
            </div>
          </div>
        </div>
      )}

      {/* Message list */}
      {messages.map((message) => (
        <MessageBubble
          key={message.message_id}
          message={message}
          isUser={message.sender_type === 'user'}
        />
      ))}

      {/* Loading indicator for new messages (when messages already exist) */}
      {loading && messages.length > 0 && (
        <div
          style={{
            ...loadingStyle,
            justifyContent: 'flex-start',
            padding: spacing.md,
          }}
        >
          <div style={spinnerStyle}></div>
          <span style={{ fontSize: fontSize.sm }}>Loading...</span>
        </div>
      )}

      {/* CSS keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
