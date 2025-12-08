/**
 * Learning Interface State and Flow Helpers
 *
 * Pure, framework-agnostic decision helpers for learning flow logic.
 * Determines UI state, validation, and flow control without side effects.
 *
 * @module utils/learning/stateHelpers
 */

import type { ContentItem } from '../../types/content';
import type { Dialog, Message } from '../../types/dialog';

/**
 * Check if a dialog session is active
 *
 * @param dialog - Dialog object or null
 * @returns True if session is active (not ended)
 *
 * @example
 * ```typescript
 * if (isSessionActive(dialog)) {
 *   // Show active session UI
 * }
 * ```
 */
export function isSessionActive(dialog: Dialog | null): boolean {
  if (!dialog) return false;
  return dialog.ended_at === null;
}

/**
 * Check if content has hints available
 *
 * @param content - ContentItem object or null
 * @returns True if content has at least one hint
 *
 * @example
 * ```typescript
 * if (hasHints(content)) {
 *   // Show hint button
 * }
 * ```
 */
export function hasHints(content: ContentItem | null): boolean {
  if (!content) return false;
  return Array.isArray(content.hints) && content.hints.length > 0;
}

/**
 * Check if more hints are available to reveal
 *
 * @param content - ContentItem object or null
 * @param revealedCount - Number of hints already revealed
 * @returns True if more hints can be revealed
 *
 * @example
 * ```typescript
 * if (hasMoreHints(content, 2)) {
 *   // Show "Reveal Next Hint" button
 * }
 * ```
 */
export function hasMoreHints(content: ContentItem | null, revealedCount: number): boolean {
  if (!content || !Array.isArray(content.hints)) return false;
  return revealedCount < content.hints.length;
}

/**
 * Check if content has explanations available
 *
 * @param content - ContentItem object or null
 * @returns True if content has at least one explanation
 *
 * @example
 * ```typescript
 * if (hasExplanations(content)) {
 *   // Show explanation after answer
 * }
 * ```
 */
export function hasExplanations(content: ContentItem | null): boolean {
  if (!content) return false;
  return Array.isArray(content.explanations) && content.explanations.length > 0;
}

/**
 * Check if content requires user answer submission
 *
 * @param content - ContentItem object or null
 * @returns True if content type requires answer (exercise or quiz)
 *
 * @example
 * ```typescript
 * if (requiresAnswer(content)) {
 *   // Show answer input
 * } else {
 *   // Show "Continue" button
 * }
 * ```
 */
export function requiresAnswer(content: ContentItem | null): boolean {
  if (!content) return false;
  return content.content_type === 'exercise' || content.content_type === 'quiz';
}

/**
 * Check if "Next" button should be enabled
 *
 * @param content - Current content item
 * @param hasSubmittedAnswer - Whether user has submitted an answer
 * @returns True if user can proceed to next content
 *
 * @example
 * ```typescript
 * const canProceed = shouldEnableNext(content, hasSubmitted);
 * <button disabled={!canProceed}>Next</button>
 * ```
 */
export function shouldEnableNext(content: ContentItem | null, hasSubmittedAnswer: boolean): boolean {
  if (!content) return false;

  // Lessons can proceed immediately
  if (content.content_type === 'lesson') return true;

  // Exercises and quizzes require answer submission
  if (requiresAnswer(content)) return hasSubmittedAnswer;

  // Explanations can proceed immediately
  return true;
}

/**
 * Check if answer input is valid for submission
 *
 * @param answer - User's answer string
 * @param contentType - Type of content (exercise, quiz, etc.)
 * @returns True if answer is valid for submission
 *
 * @example
 * ```typescript
 * const isValid = isAnswerValid(userAnswer, content.content_type);
 * <button disabled={!isValid}>Submit</button>
 * ```
 */
export function isAnswerValid(answer: string, contentType: string): boolean {
  // Answer must not be empty after trimming
  const trimmed = answer.trim();
  if (trimmed.length === 0) return false;

  // For exercises, require at least 1 character
  if (contentType === 'exercise') {
    return trimmed.length >= 1;
  }

  // For quizzes, answer must be non-empty
  if (contentType === 'quiz') {
    return trimmed.length > 0;
  }

  return true;
}

/**
 * Check if session duration has exceeded a threshold
 *
 * @param sessionStart - ISO 8601 timestamp of session start
 * @param thresholdMinutes - Threshold in minutes
 * @returns True if session has exceeded threshold
 *
 * @example
 * ```typescript
 * if (isSessionLong(sessionStart, 30)) {
 *   // Show break reminder
 * }
 * ```
 */
export function isSessionLong(sessionStart: string | null, thresholdMinutes: number): boolean {
  if (!sessionStart) return false;

  try {
    const start = new Date(sessionStart);
    const now = new Date();
    const durationMinutes = (now.getTime() - start.getTime()) / 60000;
    return durationMinutes >= thresholdMinutes;
  } catch {
    return false;
  }
}

/**
 * Calculate session progress percentage
 *
 * @param completedCount - Number of completed content items
 * @param totalCount - Total content items in session
 * @returns Progress percentage (0-100)
 *
 * @example
 * ```typescript
 * const progress = calculateProgress(7, 10); // 70
 * ```
 */
export function calculateProgress(completedCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

/**
 * Determine if user should be prompted to take a break
 *
 * @param sessionStart - ISO 8601 timestamp of session start
 * @param completedCount - Number of completed items
 * @returns True if break is recommended
 *
 * @example
 * ```typescript
 * if (shouldPromptBreak(sessionStart, 15)) {
 *   // Show break suggestion
 * }
 * ```
 */
export function shouldPromptBreak(sessionStart: string | null, completedCount: number): boolean {
  // Suggest break after 30 minutes
  const longSession = isSessionLong(sessionStart, 30);

  // Or after completing 10 items
  const manyItems = completedCount >= 10;

  return longSession || manyItems;
}

/**
 * Check if content is interactive (requires user engagement)
 *
 * @param content - ContentItem object or null
 * @returns True if content requires interaction
 *
 * @example
 * ```typescript
 * if (isInteractive(content)) {
 *   // Enable interaction handlers
 * }
 * ```
 */
export function isInteractive(content: ContentItem | null): boolean {
  if (!content) return false;

  // Exercises and quizzes are interactive
  if (content.content_type === 'exercise' || content.content_type === 'quiz') {
    return true;
  }

  // Interactive format is always interactive
  return content.format === 'interactive';
}

/**
 * Check if message list has recent activity
 *
 * @param messages - Array of messages
 * @param minutesThreshold - Time threshold in minutes
 * @returns True if there's a message within the threshold
 *
 * @example
 * ```typescript
 * if (hasRecentActivity(messages, 5)) {
 *   // Session is active
 * }
 * ```
 */
export function hasRecentActivity(messages: Message[], minutesThreshold: number): boolean {
  if (messages.length === 0) return false;

  const lastMessage = messages[messages.length - 1];
  const lastTimestamp = new Date(lastMessage.timestamp);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastTimestamp.getTime()) / 60000;

  return diffMinutes <= minutesThreshold;
}

/**
 * Determine if streak should be incremented
 *
 * @param isCorrect - Whether the current answer is correct
 * @param previousStreak - Previous streak count
 * @returns New streak count
 *
 * @example
 * ```typescript
 * const newStreak = updateStreak(true, 4); // 5
 * const resetStreak = updateStreak(false, 4); // 0
 * ```
 */
export function updateStreak(isCorrect: boolean, previousStreak: number): number {
  return isCorrect ? previousStreak + 1 : 0;
}

/**
 * Check if content should show reference answer
 *
 * @param content - ContentItem object
 * @param hasSubmitted - Whether user has submitted an answer
 * @param isCorrect - Whether the answer is correct
 * @returns True if reference answer should be shown
 *
 * @example
 * ```typescript
 * if (shouldShowReferenceAnswer(content, true, false)) {
 *   // Display reference answer
 * }
 * ```
 */
export function shouldShowReferenceAnswer(
  content: ContentItem | null,
  hasSubmitted: boolean,
  isCorrect: boolean | null
): boolean {
  if (!content || !hasSubmitted) return false;

  // Show reference answer if user got it wrong
  if (isCorrect === false) return true;

  // For exercises with reference answers, always show after submission
  if (content.content_type === 'exercise' && content.reference_answer) {
    return true;
  }

  return false;
}

/**
 * Validate that all required content fields are present
 *
 * @param content - ContentItem object or null
 * @returns True if content has all required fields
 *
 * @example
 * ```typescript
 * if (isContentValid(content)) {
 *   // Render content
 * } else {
 *   // Show error
 * }
 * ```
 */
export function isContentValid(content: ContentItem | null): boolean {
  if (!content) return false;

  // Check required fields
  return (
    typeof content.content_id === 'number' &&
    typeof content.title === 'string' &&
    content.title.length > 0 &&
    typeof content.topic === 'string' &&
    typeof content.difficulty_level === 'string' &&
    typeof content.format === 'string' &&
    typeof content.content_type === 'string' &&
    typeof content.content_data === 'object' &&
    content.content_data !== null
  );
}

/**
 * Determine content completion state
 *
 * @param content - ContentItem object
 * @param hasViewed - Whether user has viewed the content
 * @param hasSubmittedAnswer - Whether user has submitted an answer (if required)
 * @returns Completion state: 'not-started', 'in-progress', 'completed'
 *
 * @example
 * ```typescript
 * const state = getCompletionState(content, true, true);
 * // Returns 'completed' for exercise that's been answered
 * ```
 */
export function getCompletionState(
  content: ContentItem | null,
  hasViewed: boolean,
  hasSubmittedAnswer: boolean
): 'not-started' | 'in-progress' | 'completed' {
  if (!content) return 'not-started';

  if (!hasViewed) return 'not-started';

  // For lessons, viewing completes them
  if (content.content_type === 'lesson') {
    return hasViewed ? 'completed' : 'not-started';
  }

  // For interactive content, submission completes them
  if (requiresAnswer(content)) {
    if (hasSubmittedAnswer) return 'completed';
    if (hasViewed) return 'in-progress';
    return 'not-started';
  }

  // For explanations, viewing completes them
  return hasViewed ? 'completed' : 'not-started';
}
