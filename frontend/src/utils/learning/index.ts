/**
 * Learning Interface Utilities
 *
 * Central export point for all learning interface utility functions.
 * All utilities are pure, framework-agnostic, and fully typed.
 *
 * @module utils/learning
 */

// Formatting utilities
export {
  formatDifficultyLabel,
  getDifficultyColor,
  formatContentTypeLabel,
  formatContentFormatLabel,
  formatDialogTypeLabel,
  getContentTypeIcon,
  getDialogTypeIcon,
  formatDuration,
  formatProgress,
  formatNumber,
  formatStreak,
  formatAccuracy,
} from './formatters';

// Data mapping utilities
export {
  mapContentToSummary,
  mapDialogToSummary,
  mapMessageToDisplay,
  extractLearningStats,
  groupMessagesBySender,
  extractQuestionAnswerPairs,
} from './mappers';

export type { ContentSummary, DialogSummary, MessageDisplay } from './mappers';

// State and flow helper utilities
export {
  isSessionActive,
  hasHints,
  hasMoreHints,
  hasExplanations,
  requiresAnswer,
  shouldEnableNext,
  isAnswerValid,
  isSessionLong,
  calculateProgress,
  shouldPromptBreak,
  isInteractive,
  hasRecentActivity,
  updateStreak,
  shouldShowReferenceAnswer,
  isContentValid,
  getCompletionState,
} from './stateHelpers';
