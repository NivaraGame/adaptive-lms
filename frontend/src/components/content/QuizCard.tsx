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
import { parseContentData, type NormalizedQuizData } from '../../utils/contentFormatter';

interface QuizCardProps {
  content: ContentItem;
  onSubmitAnswer: (answer: string) => Promise<void>;
  showFeedback: boolean;
  isCorrect?: boolean;
}

export function QuizCard({ content, onSubmitAnswer, showFeedback, isCorrect }: QuizCardProps) {
  const { colors } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedContent = parseContentData(content.content_data, content.content_type, content.format) as NormalizedQuizData | null;

  const quizData: NormalizedQuizData = parsedContent || {
    question: 'Quiz question not available',
    options: [],
    correct_answer: '',
    explanation: '',
    quiz_type: 'multiple_choice',
  };

  const isMultipleSelect = quizData.quiz_type === 'multiple_select';

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

  const questionStyle: CSSProperties = {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    lineHeight: '1.6',
    marginBottom: spacing.lg,
    fontWeight: fontWeight.medium,
    whiteSpace: 'pre-wrap',
  };

  const optionsContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  };

  const getOptionStyle = (option: string): CSSProperties => {
    const isSelected = isMultipleSelect
      ? selectedMultiple.includes(option)
      : selectedAnswer === option;

    let backgroundColor: string = colors.bgPrimary;
    let borderColor: string = colors.border;

    if (showFeedback) {
      const isCorrectOption = option === quizData.correct_answer;

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

  const explanationStyle: CSSProperties = {
    backgroundColor: colors.infoLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeft: `4px solid ${colors.info}`,
  };

  function hasSelection(): boolean {
    return isMultipleSelect ? selectedMultiple.length > 0 : selectedAnswer !== '';
  }

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

  const handleSubmit = async () => {
    if (!hasSelection() || submitted || isSubmitting) return;

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
      <h2 style={titleStyle}>{content.title}</h2>

      <div style={badgeContainerStyle}>
        <span style={getBadgeStyle(colors.accentLight)}>Quiz</span>
        <span style={getBadgeStyle(difficultyColors[content.difficulty_level] || colors.infoLight)}>
          {content.difficulty_level}
        </span>
        <span style={getBadgeStyle(colors.purpleLight)}>
          {quizData.quiz_type === 'true_false'
            ? 'True/False'
            : isMultipleSelect
            ? 'Multiple Select'
            : 'Multiple Choice'}
        </span>
      </div>

      <div style={questionStyle}>{quizData.question}</div>

      {quizData.options.length > 0 ? (
        <div style={optionsContainerStyle}>
          {quizData.options.map((option: string, idx: number) => (
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
      ) : (
        <div style={{ color: colors.textMuted, fontStyle: 'italic' }}>
          No options available for this quiz.
        </div>
      )}

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

      {showFeedback && quizData.explanation && (
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
              whiteSpace: 'pre-wrap',
            }}
          >
            {quizData.explanation}
          </div>
        </div>
      )}
    </article>
  );
}
