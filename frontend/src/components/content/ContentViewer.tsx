/**
 * ContentViewer Component
 *
 * Main container that renders appropriate content type component.
 * Routes to LessonViewer, ExerciseCard, or QuizCard based on content_type.
 * Manages hint revelation and feedback display state.
 *
 * @module components/content/ContentViewer
 */

import { useState, type CSSProperties } from 'react';
import type { ContentItem } from '../../types/content';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing } from '../../styles/designTokens';
import { Loading } from '../Loading';
import { LessonViewer } from './LessonViewer';
import { ExerciseCard } from './ExerciseCard';
import { QuizCard } from './QuizCard';
import { HintPanel } from './HintPanel';
import { ExplanationPanel } from './ExplanationPanel';

interface ContentViewerProps {
  /**
   * Content item to display (null if no content loaded)
   */
  content: ContentItem | null;

  /**
   * Callback when user submits an answer
   */
  onSubmitAnswer: (answer: string) => Promise<void>;

  /**
   * Callback when user requests next content
   */
  onRequestNextContent: () => void;

  /**
   * Loading state
   */
  loading: boolean;
}

/**
 * ContentViewer Component
 *
 * Renders the appropriate content display component based on content type.
 * Manages interaction state for exercises and quizzes.
 *
 * @example
 * ```tsx
 * <ContentViewer
 *   content={currentContent}
 *   onSubmitAnswer={async (answer) => { await submitAnswer(answer); }}
 *   onRequestNextContent={() => loadNextContent()}
 *   loading={isLoading}
 * />
 * ```
 */
export function ContentViewer({
  content,
  onSubmitAnswer,
  onRequestNextContent,
  loading,
}: ContentViewerProps) {
  const { colors } = useTheme();

  // State management
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [revealedHintCount, setRevealedHintCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');

  // Container style
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
    padding: spacing.lg,
  };

  // Empty state style
  const emptyStateStyle: CSSProperties = {
    backgroundColor: colors.bgSecondary,
    borderRadius: '16px',
    padding: spacing['3xl'],
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: '1.1rem',
  };

  // Handle answer submission
  const handleSubmitAnswer = async (answer: string) => {
    setUserAnswer(answer);

    try {
      await onSubmitAnswer(answer);

      // Determine correctness
      // This is a simplified check - in reality, backend should return correctness
      const correct = checkAnswerCorrectness(answer);
      setIsCorrect(correct);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  };

  // Check answer correctness
  // In a real implementation, this would come from the backend response
  const checkAnswerCorrectness = (answer: string): boolean => {
    if (!content || !content.reference_answer) {
      return false;
    }

    const referenceAnswer: any = content.reference_answer;

    // Handle different answer formats
    if (typeof referenceAnswer === 'string') {
      // Case-insensitive comparison for text answers
      return answer.trim().toLowerCase() === referenceAnswer.trim().toLowerCase();
    } else if (typeof referenceAnswer === 'object' && referenceAnswer !== null) {
      // Handle structured answers
      const correctAnswerValue =
        referenceAnswer.correct_answer ||
        referenceAnswer.answer ||
        referenceAnswer.value;

      if (typeof correctAnswerValue === 'string') {
        return answer.trim().toLowerCase() === correctAnswerValue.trim().toLowerCase();
      }

      // Handle multiple correct answers
      if (Array.isArray(correctAnswerValue)) {
        const userAnswers = answer.split('|').map((a) => a.trim().toLowerCase());
        const correctAnswers = correctAnswerValue.map((a: string) => a.trim().toLowerCase());

        // Check if arrays are equal (order doesn't matter for multiple select)
        return (
          userAnswers.length === correctAnswers.length &&
          userAnswers.every((a) => correctAnswers.includes(a))
        );
      }
    }

    return false;
  };

  // Handle hint request
  const handleRequestHint = (hintIndex: number) => {
    setRevealedHintCount(hintIndex + 1);
    console.log(`Hint ${hintIndex + 1} revealed`);
  };

  // Handle next content request
  const handleNextContent = () => {
    // Reset states
    setShowFeedback(false);
    setIsCorrect(null);
    setRevealedHintCount(0);
    setUserAnswer('');

    // Request next content
    onRequestNextContent();
  };

  // Loading state
  if (loading) {
    return (
      <div style={containerStyle}>
        <Loading message="Loading content..." />
      </div>
    );
  }

  // Empty state
  if (!content) {
    return (
      <div style={containerStyle}>
        <div style={emptyStateStyle}>
          <p style={{ marginBottom: spacing.lg }}>📚</p>
          <p>No content available.</p>
          <p style={{ fontSize: '0.9rem', marginTop: spacing.md }}>
            Get a recommendation to start learning!
          </p>
        </div>
      </div>
    );
  }

  // Render appropriate content component based on content_type
  const renderContentComponent = () => {
    switch (content.content_type) {
      case 'lesson':
        return <LessonViewer content={content} onContinue={handleNextContent} />;

      case 'exercise':
        return (
          <ExerciseCard
            content={content}
            onSubmitAnswer={handleSubmitAnswer}
            showFeedback={showFeedback}
            isCorrect={isCorrect || false}
          />
        );

      case 'quiz':
        return (
          <QuizCard
            content={content}
            onSubmitAnswer={handleSubmitAnswer}
            showFeedback={showFeedback}
            isCorrect={isCorrect || false}
          />
        );

      case 'explanation':
        // If content is explicitly an explanation type, show only explanation
        return (
          <ExplanationPanel
            explanations={content.explanations || []}
            isCorrect={true}
            skills={content.skills}
            onContinue={handleNextContent}
          />
        );

      default:
        return (
          <div style={emptyStateStyle}>
            <p>Unknown content type: {content.content_type}</p>
          </div>
        );
    }
  };

  // Check if hints should be displayed
  const shouldShowHints =
    (content.content_type === 'exercise' || content.content_type === 'quiz') &&
    content.hints &&
    content.hints.length > 0;

  // Check if explanation should be displayed
  const shouldShowExplanation =
    showFeedback &&
    content.explanations &&
    content.explanations.length > 0 &&
    content.content_type !== 'lesson';

  return (
    <div style={containerStyle}>
      {/* Main Content Component */}
      {renderContentComponent()}

      {/* Hint Panel (for exercises and quizzes) */}
      {shouldShowHints && (
        <HintPanel
          hints={content.hints}
          onRequestHint={handleRequestHint}
          revealedHintCount={revealedHintCount}
        />
      )}

      {/* Explanation Panel (after answer submission) */}
      {shouldShowExplanation && (
        <ExplanationPanel
          explanations={content.explanations}
          isCorrect={isCorrect || false}
          userAnswer={userAnswer}
          correctAnswer={
            typeof content.reference_answer === 'string'
              ? content.reference_answer
              : content.content_data.correct_answer ||
                (content.reference_answer as any)?.correct_answer ||
                (content.reference_answer as any)?.answer
          }
          skills={content.skills}
          onContinue={handleNextContent}
        />
      )}
    </div>
  );
}
