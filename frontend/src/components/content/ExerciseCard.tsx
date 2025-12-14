/**
 * ExerciseCard Component
 *
 * Displays practice exercise with answer input field.
 * Supports code exercises and text exercises based on starter_code presence.
 *
 * @module components/content/ExerciseCard
 */

import { useState, type CSSProperties } from 'react';
import type { ContentItem } from '../../types/content';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, fontFamily } from '../../styles/designTokens';
import { parseContentData, type NormalizedExerciseData } from '../../utils/contentFormatter';

interface ExerciseCardProps {
  content: ContentItem;
  onSubmitAnswer: (answer: string) => Promise<void>;
  showFeedback: boolean;
  isCorrect?: boolean;
  onContinue?: () => void;
}

export function ExerciseCard({
  content,
  onSubmitAnswer,
  showFeedback,
  isCorrect,
  onContinue,
}: ExerciseCardProps) {
  const { colors } = useTheme();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedContent = parseContentData(content.content_data, content.content_type, content.format) as NormalizedExerciseData | null;

  const exerciseData: NormalizedExerciseData = parsedContent || {
    question: 'Exercise question not available',
    description: '',
    starter_code: '',
    solution: '',
    test_cases: [],
  };

  const isCodeExercise = !!exerciseData.starter_code;

  const getBorderColor = () => {
    if (!showFeedback) return colors.border;
    return isCorrect ? colors.successBorder : colors.errorBorder;
  };

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

  const titleStyle: CSSProperties = {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  };

  const badgeContainerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  };

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

  const difficultyColors: Record<string, string> = {
    easy: colors.successLight,
    normal: colors.infoLight,
    hard: colors.warningLight,
    challenge: colors.errorLight,
  };

  const promptStyle: CSSProperties = {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    lineHeight: '1.6',
    marginBottom: spacing.lg,
    whiteSpace: 'pre-wrap',
  };

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

  const referenceStyle: CSSProperties = {
    backgroundColor: colors.infoLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeft: `4px solid ${colors.info}`,
  };

  const handleSubmit = async () => {
    if (!answer.trim() || submitted || isSubmitting) return;

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = colors.primary;
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = colors.borderInput;
  };

  const getReferenceSolution = (): string => {
    if (exerciseData.solution) return exerciseData.solution;

    const ref = content.reference_answer;
    if (!ref) return '';

    if (typeof ref === 'string') return ref;
    if (typeof ref === 'object' && ref !== null) {
      return ref.solution || ref.answer || ref.value || '';
    }

    return '';
  };

  return (
    <article style={containerStyle}>
      <h2 style={titleStyle}>{content.title}</h2>

      <div style={badgeContainerStyle}>
        <span style={getBadgeStyle(colors.accentLight)}>Exercise</span>
        <span style={getBadgeStyle(difficultyColors[content.difficulty_level] || colors.infoLight)}>
          {content.difficulty_level}
        </span>
        <span style={getBadgeStyle(colors.purpleLight)}>{content.format}</span>
      </div>

      <div style={promptStyle}>{exerciseData.question}</div>

      {exerciseData.description && (
        <div
          style={{
            backgroundColor: colors.infoLight,
            padding: spacing.md,
            borderRadius: borderRadius.md,
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            whiteSpace: 'pre-wrap',
          }}
        >
          {exerciseData.description}
        </div>
      )}

      {isCodeExercise && exerciseData.starter_code && (
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: spacing.sm,
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              color: colors.textLabel,
            }}
          >
            Starter Code:
          </label>
          <pre
            style={{
              backgroundColor: colors.bgPrimary,
              padding: spacing.md,
              borderRadius: borderRadius.md,
              fontSize: fontSize.sm,
              fontFamily: fontFamily.mono,
              color: colors.textSecondary,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {exerciseData.starter_code}
          </pre>
        </div>
      )}

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
          placeholder={isCodeExercise ? 'Enter your code here...' : 'Type your answer here...'}
          style={inputStyle}
          aria-label="Exercise answer input"
        />
      </div>

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

      {showFeedback && (
        <div style={feedbackStyle}>
          <span style={{ fontSize: fontSize.xl }}>{isCorrect ? '✅' : '❌'}</span>
          <span>
            {isCorrect
              ? 'Great job! Your answer is correct.'
              : 'Not quite right. Review the explanation below.'}
          </span>
        </div>
      )}

      {showFeedback && !isCorrect && getReferenceSolution() && (
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
          <pre
            style={{
              fontFamily: isCodeExercise ? fontFamily.mono : fontFamily.base,
              color: colors.textPrimary,
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {getReferenceSolution()}
          </pre>
        </div>
      )}

      {showFeedback && onContinue && (
        <button
          onClick={onContinue}
          style={{
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
            marginTop: spacing.lg,
          }}
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
          aria-label="Continue to next content"
        >
          Continue →
        </button>
      )}
    </article>
  );
}
