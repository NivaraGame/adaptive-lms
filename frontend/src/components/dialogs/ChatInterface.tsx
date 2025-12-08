/**
 * ChatInterface Component
 *
 * Complete chat UI that composes MessageList and InputArea.
 * Manages message fetching, sending, and error handling.
 * Integrates with useMessages hook for data management.
 *
 * References:
 * - useMessages hook: @frontend/src/hooks/useMessages.ts
 * - MessageList: @frontend/src/components/dialogs/MessageList.tsx
 * - InputArea: @frontend/src/components/dialogs/InputArea.tsx
 * - ErrorMessage: @frontend/src/components/ErrorMessage.tsx
 * - Theme context: @frontend/src/contexts/ThemeContext.tsx
 *
 * @example
 * ```tsx
 * <ChatInterface
 *   dialogId={currentDialogId}
 *   onMessageSent={() => console.log('Message sent')}
 * />
 * ```
 */

import type { CSSProperties } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useMessages } from '../../hooks/useMessages';
import MessageList from './MessageList';
import InputArea from './InputArea';
import { ErrorMessage } from '../ErrorMessage';

/**
 * Props interface for ChatInterface component
 */
export interface ChatInterfaceProps {
  /** Dialog ID to fetch and send messages for */
  dialogId: number;
  /** Optional callback when a message is successfully sent */
  onMessageSent?: () => void;
}

/**
 * ChatInterface component
 *
 * Full-featured chat interface with message history and input.
 * Handles message fetching, sending, loading states, and errors.
 */
export default function ChatInterface({
  dialogId,
  onMessageSent,
}: ChatInterfaceProps) {
  const { colors } = useTheme();
  const { messages, sendMessage, loading, error } = useMessages(dialogId);

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content, false); // is_question defaults to false
      // Call optional callback on success
      onMessageSent?.();
    } catch (err) {
      // Error is already captured by useMessages hook
      console.error('Failed to send message:', err);
      // Re-throw to let InputArea handle display
      throw err;
    }
  };

  // Container style - full height flex container
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.bgPrimary,
    borderRadius: '16px',
    overflow: 'hidden',
  };

  // Messages container style - grows to fill space
  const messagesContainerStyle: CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  // Input container style - fixed at bottom
  const inputContainerStyle: CSSProperties = {
    flexShrink: 0,
  };

  return (
    <div style={containerStyle}>
      {/* Error display at top if present */}
      {error && (
        <div style={{ padding: '1rem' }}>
          <ErrorMessage
            message={error.message || 'An error occurred'}
            details={error instanceof Error ? error.stack : undefined}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* Message list - scrollable area */}
      <div style={messagesContainerStyle}>
        <MessageList messages={messages} loading={loading} />
      </div>

      {/* Input area - sticky to bottom */}
      <div style={inputContainerStyle}>
        <InputArea
          onSendMessage={handleSendMessage}
          loading={loading}
          placeholder="Type your response..."
        />
      </div>
    </div>
  );
}
