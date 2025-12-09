/**
 * InputArea Component
 *
 * Input area for user messages and answers in the chat interface.
 * Features textarea with auto-resize, send button, and keyboard shortcuts.
 * Handles message submission and provides loading feedback.
 *
 * References:
 * - Theme context: @frontend/src/contexts/ThemeContext.tsx
 * - Design tokens: @frontend/src/styles/designTokens.ts
 *
 * Keyboard shortcuts:
 * - Enter: Send message
 * - Shift+Enter: New line
 * - Escape: Clear input
 *
 * @example
 * ```tsx
 * <InputArea
 *   onSendMessage={async (content) => await sendMessage(content)}
 *   loading={isSending}
 *   placeholder="Type your response..."
 * />
 * ```
 */

import { useState, useRef, useEffect } from 'react';
import type { CSSProperties, KeyboardEvent, ChangeEvent } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../styles/designTokens';

/**
 * Props interface for InputArea component
 */
export interface InputAreaProps {
  /** Callback function to send a message (returns promise) */
  onSendMessage: (content: string) => Promise<void>;
  /** Loading state during message sending */
  loading: boolean;
  /** Optional placeholder text for the input */
  placeholder?: string;
}

/**
 * InputArea component
 *
 * Provides a textarea input with send button for user messages.
 * Features auto-resize (up to 5 lines), keyboard shortcuts, and loading states.
 */
export default function InputArea({
  onSendMessage,
  loading,
  placeholder = 'Type your response...',
}: InputAreaProps) {
  const { colors } = useTheme();
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to calculate correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight (up to max 5 lines ~120px)
      const maxHeight = 120; // 5 lines * 24px per line
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setError(null); // Clear error on input
  };

  // Handle send message
  const handleSend = async () => {
    const trimmedValue = inputValue.trim();

    // Validate input
    if (!trimmedValue) {
      setError('Message cannot be empty');
      return;
    }

    if (trimmedValue.length > 5000) {
      setError('Message too long (max 5000 characters)');
      return;
    }

    try {
      await onSendMessage(trimmedValue);
      // Clear input on success
      setInputValue('');
      setError(null);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send message'
      );
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter: Send message (Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Escape: Clear input
    if (e.key === 'Escape') {
      setInputValue('');
      setError(null);
    }
  };

  // Container style - sticky to bottom
  const containerStyle: CSSProperties = {
    position: 'sticky',
    bottom: 0,
    backgroundColor: colors.bgSecondary,
    borderTop: `1px solid ${colors.border}`,
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  };

  // Input row style - textarea and button
  const inputRowStyle: CSSProperties = {
    display: 'flex',
    gap: spacing.md,
    alignItems: 'flex-end',
  };

  // Textarea style
  const textareaStyle: CSSProperties = {
    flex: 1,
    padding: spacing.md,
    border: `1px solid ${error ? colors.errorBorder : colors.borderInput}`,
    borderRadius: '8px',
    fontSize: fontSize.base,
    fontFamily: 'inherit',
    backgroundColor: colors.bgPrimary,
    color: colors.textPrimary,
    resize: 'none',
    minHeight: '44px',
    maxHeight: '120px',
    lineHeight: '1.5',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  // Send button style
  const sendButtonStyle: CSSProperties = {
    padding: `${spacing.md} ${spacing.xl}`,
    backgroundColor:
      loading || !inputValue.trim() ? colors.bgDisabled : colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    cursor:
      loading || !inputValue.trim() ? 'not-allowed' : 'pointer',
    opacity: loading || !inputValue.trim() ? 0.6 : 1,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: '80px',
    justifyContent: 'center',
  };

  // Error message style
  const errorStyle: CSSProperties = {
    fontSize: fontSize.sm,
    color: colors.error,
    margin: 0,
  };

  // Helper text style
  const helperTextStyle: CSSProperties = {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    margin: 0,
  };

  // Handle button hover
  const handleButtonHover = (
    e: React.MouseEvent<HTMLButtonElement>,
    enter: boolean
  ) => {
    if (loading || !inputValue.trim()) return;
    const target = e.currentTarget;
    if (enter) {
      target.style.backgroundColor = colors.primaryHover;
      target.style.transform = 'scale(1.02)';
    } else {
      target.style.backgroundColor = colors.primary;
      target.style.transform = 'scale(1)';
    }
  };

  return (
    <div style={containerStyle}>
      {/* Input row */}
      <div style={inputRowStyle}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          style={textareaStyle}
          aria-label="Message input"
          rows={1}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={loading || !inputValue.trim()}
          style={sendButtonStyle}
          onMouseEnter={(e) => handleButtonHover(e, true)}
          onMouseLeave={(e) => handleButtonHover(e, false)}
          aria-label="Send message"
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⏳</span>
              <span>Sending</span>
            </>
          ) : (
            <>
              <span>Send</span>
              <span>➤</span>
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && <div style={errorStyle}>❌ {error}</div>}

      {/* Helper text - keyboard shortcuts */}
      {!error && (
        <div style={helperTextStyle}>
          Press <kbd style={{
            padding: '0.15rem 0.4rem',
            backgroundColor: colors.bgTertiary,
            borderRadius: '4px',
            fontSize: fontSize.xs,
            border: `1px solid ${colors.border}`,
          }}>Enter</kbd> to send, <kbd style={{
            padding: '0.15rem 0.4rem',
            backgroundColor: colors.bgTertiary,
            borderRadius: '4px',
            fontSize: fontSize.xs,
            border: `1px solid ${colors.border}`,
          }}>Shift+Enter</kbd> for new line
        </div>
      )}

      {/* CSS keyframes for spinner */}
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
