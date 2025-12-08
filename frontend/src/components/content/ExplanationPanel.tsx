/**
 * ExplanationPanel Component
 *
 * Displays detailed explanation after answer submission.
 * Shows user's answer, correct answer (if incorrect), and explanation sections.
 *
 * @module components/content/ExplanationPanel
 */

import type { CSSProperties } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../../styles/designTokens';

interface ExplanationPanelProps {
  /**
   * Array of explanation strings from content.explanations
   */
  explanations: string[];

  /**
   * Whether the user's answer was correct
   */
  isCorrect: boolean;

  /**
   * User's submitted answer (optional)
   */
  userAnswer?: string;

  /**
   * The correct answer (optional)
   */
  correctAnswer?: string;

  /**
   * Skills learned from this content (optional)
   */
  skills?: string[];

  /**
   * Callback when user clicks "Continue to Next"
   */
  onContinue?: () => void;
}

/**
 * ExplanationPanel Component
 *
 * Shows feedback and detailed explanations after answer submission.
 *
 * @example
 * ```tsx
 * <ExplanationPanel
 *   explanations={content.explanations}
 *   isCorrect={true}
 *   userAnswer="42"
 *   skills={content.skills}
 *   onContinue={() => loadNextContent()}
 * />
 * ```
 */
export function ExplanationPanel({
  explanations,
  isCorrect,
  userAnswer,
  correctAnswer,
  skills,
  onContinue,
}: ExplanationPanelProps) {
  const { colors } = useTheme();

  // Container style
  const containerStyle: CSSProperties = {
    backgroundColor: isCorrect ? colors.successLight : colors.errorLight,
    border: `2px solid ${isCorrect ? colors.success : colors.error}`,
    borderLeft: `4px solid ${isCorrect ? colors.success : colors.error}`,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    animation: 'slideIn 0.3s ease',
  };

  // Header style
  const headerStyle: CSSProperties = {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: isCorrect ? colors.success : colors.error,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  };

  // Section style
  const sectionStyle: CSSProperties = {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.border}`,
  };

  // Section title style
  const sectionTitleStyle: CSSProperties = {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textLabel,
    marginBottom: spacing.md,
  };

  // Text style
  const textStyle: CSSProperties = {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    lineHeight: '1.6',
  };

  // Skills container style
  const skillsContainerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  };

  // Skill badge style
  const skillBadgeStyle: CSSProperties = {
    backgroundColor: colors.infoLight,
    color: colors.info,
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    border: `1px solid ${colors.info}`,
  };

  // Button style
  const buttonStyle: CSSProperties = {
    backgroundColor: colors.primary,
    color: '#ffffff',
    padding: `${spacing.md} ${spacing.xl}`,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  };

  // Inject slideIn animation
  if (typeof document !== 'undefined') {
    const styleId = 'explanation-panel-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
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

  return (
    <div style={containerStyle} role="region" aria-label="Answer explanation">
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ fontSize: fontSize['2xl'] }}>{isCorrect ? '✅' : '❌'}</span>
        <span>{isCorrect ? 'Great job!' : 'Not quite right'}</span>
      </div>

      {/* User's Answer */}
      {userAnswer && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Your answer:</div>
          <div style={textStyle}>{userAnswer}</div>
        </div>
      )}

      {/* Correct Answer (only if incorrect) */}
      {!isCorrect && correctAnswer && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Correct answer:</div>
          <div style={{ ...textStyle, fontWeight: fontWeight.semibold, color: colors.success }}>
            {correctAnswer}
          </div>
        </div>
      )}

      {/* Explanations */}
      {explanations && explanations.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Explanation:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {explanations.map((explanation, index) => (
              <div
                key={index}
                style={textStyle}
                dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br/>') }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Related Skills */}
      {skills && skills.length > 0 && (
        <div>
          <div style={sectionTitleStyle}>Skills learned:</div>
          <div style={skillsContainerStyle}>
            {skills.map((skill, index) => (
              <span key={index} style={skillBadgeStyle}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {onContinue && (
        <button
          style={buttonStyle}
          onClick={onContinue}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primaryHover;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = colors.shadowMd;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Continue to Next →
        </button>
      )}
    </div>
  );
}
