/**
 * HintPanel Component
 *
 * Displays progressive hints in collapsible accordion format.
 * Hints are revealed one at a time with "Reveal Next Hint" button.
 *
 * @module components/content/HintPanel
 */

import { useState, type CSSProperties } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../../styles/designTokens';

interface HintPanelProps {
  /**
   * Array of hint strings from content.hints
   */
  hints: string[];

  /**
   * Callback when user requests a hint
   */
  onRequestHint: (hintIndex: number) => void;

  /**
   * Number of hints currently revealed
   */
  revealedHintCount: number;
}

/**
 * HintPanel Component
 *
 * Collapsible panel showing progressive hints for exercises and quizzes.
 *
 * @example
 * ```tsx
 * <HintPanel
 *   hints={content.hints}
 *   onRequestHint={(index) => console.log(`Hint ${index} requested`)}
 *   revealedHintCount={hintCount}
 * />
 * ```
 */
export function HintPanel({ hints, onRequestHint, revealedHintCount }: HintPanelProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  // If no hints available, don't render
  if (!hints || hints.length === 0) {
    return null;
  }

  // Container style
  const containerStyle: CSSProperties = {
    backgroundColor: colors.warningLight,
    border: `2px solid ${colors.warning}`,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  };

  // Header style
  const headerStyle: CSSProperties = {
    padding: spacing.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    backgroundColor: colors.warningLight,
    transition: 'background-color 0.2s',
  };

  // Header text style
  const headerTextStyle: CSSProperties = {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  };

  // Icon style
  const iconStyle: CSSProperties = {
    fontSize: fontSize.lg,
    transition: 'transform 0.3s ease',
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  };

  // Content container style
  const contentContainerStyle: CSSProperties = {
    maxHeight: expanded ? '500px' : '0',
    opacity: expanded ? 1 : 0,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    padding: expanded ? spacing.lg : '0',
  };

  // Hint list style
  const hintListStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  };

  // Individual hint style
  const hintStyle: CSSProperties = {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderLeft: `4px solid ${colors.warning}`,
    color: colors.textPrimary,
    fontSize: fontSize.base,
    lineHeight: '1.6',
    animation: 'fadeIn 0.3s ease',
  };

  // Hint number style
  const hintNumberStyle: CSSProperties = {
    fontWeight: fontWeight.bold,
    color: colors.warning,
    marginBottom: spacing.sm,
    fontSize: fontSize.sm,
  };

  // Button style
  const buttonStyle: CSSProperties = {
    backgroundColor: colors.warning,
    color: '#ffffff',
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: borderRadius.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: spacing.md,
    width: '100%',
  };

  // All hints revealed message style
  const allRevealedStyle: CSSProperties = {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
  };

  // Inject fadeIn animation
  if (typeof document !== 'undefined') {
    const styleId = 'hint-panel-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  // Handle reveal next hint
  const handleRevealHint = () => {
    if (revealedHintCount < hints.length) {
      onRequestHint(revealedHintCount);
    }
  };

  // Check if more hints available
  const hasMoreHints = revealedHintCount < hints.length;

  return (
    <div style={containerStyle} role="region" aria-label="Hints panel">
      {/* Header */}
      <div
        style={headerStyle}
        onClick={toggleExpanded}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.warningHover + '30';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.warningLight;
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <span style={headerTextStyle}>
          <span>💡</span>
          <span>Need a hint?</span>
          {revealedHintCount > 0 && (
            <span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>
              ({revealedHintCount} of {hints.length} revealed)
            </span>
          )}
        </span>
        <span style={iconStyle}>▼</span>
      </div>

      {/* Content */}
      <div style={contentContainerStyle}>
        <div style={hintListStyle}>
          {/* Revealed hints */}
          {hints.slice(0, revealedHintCount).map((hint, index) => (
            <div key={index} style={hintStyle}>
              <div style={hintNumberStyle}>Hint {index + 1}</div>
              <div dangerouslySetInnerHTML={{ __html: hint.replace(/\n/g, '<br/>') }} />
            </div>
          ))}
        </div>

        {/* Reveal next hint button */}
        {hasMoreHints && (
          <button
            style={buttonStyle}
            onClick={handleRevealHint}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.warningHover;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = colors.shadowMd;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.warning;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Reveal Next Hint ({revealedHintCount + 1}/{hints.length})
          </button>
        )}

        {/* All hints revealed message */}
        {!hasMoreHints && revealedHintCount > 0 && (
          <div style={allRevealedStyle}>
            All hints revealed! You've got this! 🎉
          </div>
        )}

        {/* No hints revealed yet */}
        {revealedHintCount === 0 && expanded && (
          <div
            style={{
              color: colors.textMuted,
              fontSize: fontSize.sm,
              textAlign: 'center',
              marginTop: spacing.md,
            }}
          >
            Click the button below to reveal your first hint.
          </div>
        )}
      </div>
    </div>
  );
}
