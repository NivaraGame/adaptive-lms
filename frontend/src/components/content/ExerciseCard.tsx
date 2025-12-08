/**
 * ExerciseCard Component
 *
 * Displays practice exercise with answer input field.
 * Supports short answer, code exercises, and math exercises.
 * Shows feedback after submission with correct/incorrect indication.
 *
 * @module components/content/ExerciseCard
 */

import { useState, type CSSProperties } from 'react';
import type { ContentItem } from '../../types/content';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, fontFamily } from '../../styles/designTokens';
import { parseContentData, type ParsedTextContent } from '../../utils/contentFormatter';

interface ExerciseCardProps {
  /**
   * Content item with content_type === 'exercise'
   */
  content: ContentItem;

  /**
   * Callback when user submits an answer
   */
  onSubmitAnswer: (answer: string) => Promise<void>;

  /**
   * Whether to show feedback (correct/incorrect)
   */
  showFeedback: boolean;

  /**
   * Whether the answer was correct (only used if showFeedback is true)
   */
  isCorrect?: boolean;
}

/**
 * ExerciseCard Component
 *
 * Interactive exercise card with answer input and submission.
 *
 * @example
 * ```tsx
 * <ExerciseCard
 *   content={exerciseContent}
 *   onSubmitAnswer={async (answer) => { await handleSubmit(answer); }}
 *   showFeedback={submitted}
 *   isCorrect={answerCorrect}
 * />
 * ```
 */
export function ExerciseCard({
  content,
  onSubmitAnswer,
  showFeedback,
  isCorrect,
}: ExerciseCardProps) {
  const { colors } = useTheme();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedContent = parseContentData(content.content_data, content.format);
  const exercisePrompt =
    (parsedContent as ParsedTextContent)?.text ||
    content.content_data.question ||
    content.content_data.prompt ||
    '';

  const exerciseType = content.content_data.exercise_type || 'short_answer';
  const isCodeExercise = exerciseType === 'code' || content.format === 'interactive';

  // Determine border color based on feedback
  const getBorderColor = () => {
    if (!showFeedback) return colors.border;
    return isCorrect ? colors.successBorder : colors.errorBorder;
  };

  // Container style
  const containerStyle: CSSProperties = {
    backgroundColor: colors.bgSecondary,
    borderRadius: '16px',
    padding: spacing['3xl'],
    boxShadow: colors.shadowCard,
    border: `2px solid ${getBorderColor()}`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
    transition: 'all 0.3s ease',
  };

  // Title style
  const titleStyle: CSSProperties = {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  };

  // Badge container style
  const badgeContainerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  };

  // Badge style factory
  const getBadgeStyle = (bgColor: string): CSSProperties => ({
    backgroundColor: bgColor,
    color: colors.textPrimary,
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
  });

  // Difficulty badge color
  const difficultyColors: Record<string, string> = {
    easy: colors.successLight,
    normal: colors.infoLight,
    hard: colors.warningLight,
    challenge: colors.errorLight,
  };

  // Prompt style
  const promptStyle: CSSProperties = {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    lineHeight: '1.6',
    marginBottom: spacing.lg,
  };

  // Input style (textarea or code editor)
  const inputStyle: CSSProperties = {
    width: '100%',
    minHeight: isCodeExercise ? '200px' : '100px',
    padding: spacing.lg,
    fontSize: fontSize.base,
    fontFamily: isCodeExercise ? fontFamily.mono : fontFamily.base,
    color: colors.textPrimary,
    backgroundColor: colors.bgPrimary,
    border: `1px solid ${colors.borderInput}`,
    borderRadius: borderRadius.lg,
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s',
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
    cursor: answer.trim() && !submitted ? 'pointer' : 'not-allowed',
    opacity: answer.trim() && !submitted ? 1 : 0.5,
    transition: 'all 0.2s',
    alignSelf: 'flex-start',
  };

  // Feedback style
  const feedbackStyle: CSSProperties = {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: isCorrect ? colors.successLight : colors.errorLight,
    color: colors.textPrimary,
    borderLeft: `4px solid ${isCorrect ? colors.success : colors.error}`,
  };

  // Reference answer style
  const referenceStyle: CSSProperties = {
    backgroundColor: colors.infoLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeft: `4px solid ${colors.info}`,
  };

  // Handle answer submission
  const handleSubmit = async () => {
    if (!answer.trim() || submitted || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitted(true);

    try {
      await onSubmitAnswer(answer);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };

  // Handle input focus
  const handleInputFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = colors.primary;
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = colors.borderInput;
  };

  return (
    <article style={containerStyle}>
      {/* Title */}
      <h2 style={titleStyle}>{content.title}</h2>

      {/* Badges */}
      <div style={badgeContainerStyle}>
        <span style={getBadgeStyle(colors.accentLight)}>
          📝 Exercise
        </span>
        <span style={getBadgeStyle(difficultyColors[content.difficulty_level] || colors.infoLight)}>
          {content.difficulty_level}
        </span>
        <span style={getBadgeStyle(colors.purpleLight)}>
          {content.format}
        </span>
      </div>

      {/* Exercise Prompt */}
      <div style={promptStyle}>
        <div dangerouslySetInnerHTML={{ __html: exercisePrompt.replace(/\n/g, '<br/>') }} />
      </div>

      {/* Answer Input */}
      <div>
        <label
          htmlFor="exercise-answer"
          style={{
            display: 'block',
            marginBottom: spacing.md,
            fontSize: fontSize.base,
            fontWeight: fontWeight.medium,
            color: colors.textLabel,
          }}
        >
          Your Answer:
        </label>
        <textarea
          id="exercise-answer"
          value={answer}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={submitted}
          placeholder={
            isCodeExercise
              ? 'Enter your code here...'
              : 'Type your answer here...'
          }
          style={inputStyle}
          aria-label="Exercise answer input"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!answer.trim() || submitted || isSubmitting}
        style={buttonStyle}
        onMouseEnter={(e) => {
          if (answer.trim() && !submitted) {
            e.currentTarget.style.backgroundColor = colors.primaryHover;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = colors.shadowMd;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.primary;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {isSubmitting ? 'Submitting...' : submitted ? 'Submitted' : 'Submit Answer'}
      </button>

      {/* Feedback */}
      {showFeedback && (
        <div style={feedbackStyle}>
          <span style={{ fontSize: fontSize.xl }}>
            {isCorrect ? '✅' : '❌'}
          </span>
          <span>
            {isCorrect
              ? 'Great job! Your answer is correct.'
              : 'Not quite right. Review the explanation below.'}
          </span>
        </div>
      )}

      {/* Reference Answer */}
      {showFeedback && !isCorrect && content.reference_answer && (
        <div style={referenceStyle}>
          <h3
            style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.semibold,
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            Reference Answer:
          </h3>
          <div
            style={{
              fontFamily: isCodeExercise ? fontFamily.mono : fontFamily.base,
              color: colors.textPrimary,
              whiteSpace: 'pre-wrap',
            }}
          >
            {typeof content.reference_answer === 'string'
              ? content.reference_answer
              : JSON.stringify(content.reference_answer, null, 2)}
          </div>
        </div>
      )}
    </article>
  );
}
