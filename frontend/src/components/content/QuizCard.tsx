/**
 * QuizCard Component
 *
 * Displays quiz question with multiple choice, true/false, or multiple select options.
 * Shows feedback with correct answer highlighting after submission.
 *
 * @module components/content/QuizCard
 */

import { useState, type CSSProperties } from 'react';
import type { ContentItem } from '../../types/content';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../../styles/designTokens';
import { parseContentData, type ParsedTextContent } from '../../utils/contentFormatter';

interface QuizCardProps {
  /**
   * Content item with content_type === 'quiz'
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
 * QuizCard Component
 *
 * Interactive quiz card with option selection and submission.
 *
 * @example
 * ```tsx
 * <QuizCard
 *   content={quizContent}
 *   onSubmitAnswer={async (answer) => { await handleSubmit(answer); }}
 *   showFeedback={submitted}
 *   isCorrect={answerCorrect}
 * />
 * ```
 */
export function QuizCard({ content, onSubmitAnswer, showFeedback, isCorrect }: QuizCardProps) {
  const { colors } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedContent = parseContentData(content.content_data, content.format);
  const question =
    (parsedContent as ParsedTextContent)?.text ||
    content.content_data.question ||
    'Question not available';

  const options = content.content_data.options || [];
  const quizType = content.content_data.quiz_type || 'multiple_choice';
  const correctAnswer = content.content_data.correct_answer || content.reference_answer;
  const explanation = content.content_data.explanation || '';

  const isMultipleSelect = quizType === 'multiple_select';

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

  // Question style
  const questionStyle: CSSProperties = {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    lineHeight: '1.6',
    marginBottom: spacing.lg,
    fontWeight: fontWeight.medium,
  };

  // Option container style
  const optionsContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  };

  // Get option style based on state
  const getOptionStyle = (option: string): CSSProperties => {
    const isSelected = isMultipleSelect
      ? selectedMultiple.includes(option)
      : selectedAnswer === option;

    let backgroundColor: string = colors.bgPrimary;
    let borderColor: string = colors.border;

    if (showFeedback) {
      const isCorrectOption =
        typeof correctAnswer === 'string'
          ? option === correctAnswer
          : Array.isArray(correctAnswer)
          ? correctAnswer.includes(option)
          : false;

      if (isCorrectOption) {
        backgroundColor = colors.successLight;
        borderColor = colors.success;
      } else if (isSelected && !isCorrectOption) {
        backgroundColor = colors.errorLight;
        borderColor = colors.error;
      }
    } else if (isSelected) {
      backgroundColor = colors.primaryLight;
      borderColor = colors.primary;
    }

    return {
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      border: `2px solid ${borderColor}`,
      backgroundColor,
      cursor: submitted ? 'default' : 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
    };
  };

  // Radio/Checkbox indicator style
  const getIndicatorStyle = (option: string): CSSProperties => {
    const isSelected = isMultipleSelect
      ? selectedMultiple.includes(option)
      : selectedAnswer === option;

    return {
      width: '20px',
      height: '20px',
      borderRadius: isMultipleSelect ? borderRadius.sm : '50%',
      border: `2px solid ${isSelected ? colors.primary : colors.border}`,
      backgroundColor: isSelected ? colors.primary : 'transparent',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: fontSize.xs,
    };
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
    cursor: hasSelection() && !submitted ? 'pointer' : 'not-allowed',
    opacity: hasSelection() && !submitted ? 1 : 0.5,
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

  // Explanation style
  const explanationStyle: CSSProperties = {
    backgroundColor: colors.infoLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeft: `4px solid ${colors.info}`,
  };

  // Check if user has made a selection
  function hasSelection(): boolean {
    return isMultipleSelect ? selectedMultiple.length > 0 : selectedAnswer !== '';
  }

  // Handle option click
  const handleOptionClick = (option: string) => {
    if (submitted) return;

    if (isMultipleSelect) {
      setSelectedMultiple((prev) =>
        prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
      );
    } else {
      setSelectedAnswer(option);
    }
  };

  // Handle answer submission
  const handleSubmit = async () => {
    if (!hasSelection() || submitted || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitted(true);

    const answer = isMultipleSelect ? selectedMultiple.join('|') : selectedAnswer;

    try {
      await onSubmitAnswer(answer);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article style={containerStyle}>
      {/* Title */}
      <h2 style={titleStyle}>{content.title}</h2>

      {/* Badges */}
      <div style={badgeContainerStyle}>
        <span style={getBadgeStyle(colors.accentLight)}>
          ❓ Quiz
        </span>
        <span style={getBadgeStyle(difficultyColors[content.difficulty_level] || colors.infoLight)}>
          {content.difficulty_level}
        </span>
        <span style={getBadgeStyle(colors.purpleLight)}>
          {quizType === 'true_false' ? 'True/False' : isMultipleSelect ? 'Multiple Select' : 'Multiple Choice'}
        </span>
      </div>

      {/* Question */}
      <div style={questionStyle}>
        <div dangerouslySetInnerHTML={{ __html: question.replace(/\n/g, '<br/>') }} />
      </div>

      {/* Options */}
      <div style={optionsContainerStyle}>
        {options.map((option: string, idx: number) => (
          <div
            key={idx}
            style={getOptionStyle(option)}
            onClick={() => handleOptionClick(option)}
            onMouseEnter={(e) => {
              if (!submitted) {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = colors.shadowMd;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            role={isMultipleSelect ? 'checkbox' : 'radio'}
            aria-checked={
              isMultipleSelect ? selectedMultiple.includes(option) : selectedAnswer === option
            }
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOptionClick(option);
              }
            }}
          >
            <div style={getIndicatorStyle(option)}>
              {(isMultipleSelect ? selectedMultiple.includes(option) : selectedAnswer === option) && '✓'}
            </div>
            <span style={{ color: colors.textPrimary, flex: 1 }}>{option}</span>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!hasSelection() || submitted || isSubmitting}
        style={buttonStyle}
        onMouseEnter={(e) => {
          if (hasSelection() && !submitted) {
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
          <span style={{ fontSize: fontSize.xl }}>{isCorrect ? '✅' : '❌'}</span>
          <span>
            {isCorrect
              ? 'Excellent! Your answer is correct.'
              : 'Incorrect. The correct answer is highlighted above.'}
          </span>
        </div>
      )}

      {/* Explanation */}
      {showFeedback && explanation && (
        <div style={explanationStyle}>
          <h3
            style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.semibold,
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            Explanation:
          </h3>
          <div
            style={{
              color: colors.textPrimary,
              lineHeight: '1.6',
            }}
            dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br/>') }}
          />
        </div>
      )}
    </article>
  );
}
