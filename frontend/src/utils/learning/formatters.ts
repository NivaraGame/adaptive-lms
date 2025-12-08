/**
 * Learning Interface Formatting Utilities
 *
 * Pure, framework-agnostic formatting helpers for the learning interface.
 * All functions are side-effect free and fully typed.
 *
 * @module utils/learning/formatters
 */

import type { DifficultyLevel, ContentType, ContentFormat } from '../../types/content';
import type { DialogType } from '../../types/dialog';

/**
 * Format difficulty level to human-readable label
 *
 * @param difficulty - Difficulty level enum value
 * @returns Human-readable difficulty label
 *
 * @example
 * ```typescript
 * formatDifficultyLabel('easy'); // "Easy"
 * formatDifficultyLabel('challenge'); // "Challenge"
 * ```
 */
export function formatDifficultyLabel(difficulty: DifficultyLevel): string {
  const labels: Record<DifficultyLevel, string> = {
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    challenge: 'Challenge',
  };
  return labels[difficulty] || difficulty;
}

/**
 * Get difficulty color indicator for UI theming
 *
 * @param difficulty - Difficulty level enum value
 * @returns Color name for theme color mapping
 *
 * @example
 * ```typescript
 * getDifficultyColor('easy'); // "success"
 * getDifficultyColor('hard'); // "warning"
 * ```
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  const colors: Record<DifficultyLevel, string> = {
    easy: 'success',
    normal: 'info',
    hard: 'warning',
    challenge: 'error',
  };
  return colors[difficulty] || 'info';
}

/**
 * Format content type to human-readable label
 *
 * @param contentType - Content type enum value
 * @returns Human-readable content type label
 *
 * @example
 * ```typescript
 * formatContentTypeLabel('lesson'); // "Lesson"
 * formatContentTypeLabel('quiz'); // "Quiz"
 * ```
 */
export function formatContentTypeLabel(contentType: ContentType): string {
  const labels: Record<ContentType, string> = {
    lesson: 'Lesson',
    exercise: 'Exercise',
    quiz: 'Quiz',
    explanation: 'Explanation',
  };
  return labels[contentType] || contentType;
}

/**
 * Format content format to human-readable label
 *
 * @param format - Content format enum value
 * @returns Human-readable format label
 *
 * @example
 * ```typescript
 * formatContentFormatLabel('text'); // "Text"
 * formatContentFormatLabel('interactive'); // "Interactive"
 * ```
 */
export function formatContentFormatLabel(format: ContentFormat): string {
  const labels: Record<ContentFormat, string> = {
    text: 'Text',
    visual: 'Visual',
    video: 'Video',
    interactive: 'Interactive',
  };
  return labels[format] || format;
}

/**
 * Format dialog type to human-readable label
 *
 * @param dialogType - Dialog type enum value
 * @returns Human-readable dialog type label
 *
 * @example
 * ```typescript
 * formatDialogTypeLabel('educational'); // "Educational"
 * formatDialogTypeLabel('assessment'); // "Assessment"
 * ```
 */
export function formatDialogTypeLabel(dialogType: DialogType): string {
  const labels: Record<DialogType, string> = {
    educational: 'Educational',
    test: 'Test',
    assessment: 'Assessment',
    reflective: 'Reflective',
  };
  return labels[dialogType] || dialogType;
}

/**
 * Get icon for content type
 *
 * @param contentType - Content type enum value
 * @returns Unicode emoji icon
 *
 * @example
 * ```typescript
 * getContentTypeIcon('lesson'); // "📚"
 * getContentTypeIcon('quiz'); // "❓"
 * ```
 */
export function getContentTypeIcon(contentType: ContentType): string {
  const icons: Record<ContentType, string> = {
    lesson: '📚',
    exercise: '✍️',
    quiz: '❓',
    explanation: '💡',
  };
  return icons[contentType] || '📄';
}

/**
 * Get icon for dialog type
 *
 * @param dialogType - Dialog type enum value
 * @returns Unicode emoji icon
 *
 * @example
 * ```typescript
 * getDialogTypeIcon('educational'); // "🎓"
 * getDialogTypeIcon('test'); // "📝"
 * ```
 */
export function getDialogTypeIcon(dialogType: DialogType): string {
  const icons: Record<DialogType, string> = {
    educational: '🎓',
    test: '📝',
    assessment: '📊',
    reflective: '🤔',
  };
  return icons[dialogType] || '💬';
}

/**
 * Format duration in minutes to human-readable string
 *
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 *
 * @example
 * ```typescript
 * formatDuration(5); // "5 min"
 * formatDuration(65); // "1h 5min"
 * formatDuration(125); // "2h 5min"
 * ```
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return '0 min';
  if (minutes < 60) return `${Math.floor(minutes)} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Format progress as percentage string
 *
 * @param current - Current progress value
 * @param total - Total value
 * @returns Formatted percentage string (e.g., "75%")
 *
 * @example
 * ```typescript
 * formatProgress(3, 4); // "75%"
 * formatProgress(5, 10); // "50%"
 * ```
 */
export function formatProgress(current: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = Math.round((current / total) * 100);
  return `${percentage}%`;
}

/**
 * Format large numbers with appropriate suffixes (K, M)
 *
 * @param num - Number to format
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(999); // "999"
 * formatNumber(1500); // "1.5K"
 * formatNumber(1500000); // "1.5M"
 * ```
 */
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
}

/**
 * Format streak count with fire emoji
 *
 * @param streak - Current streak count
 * @returns Formatted streak string
 *
 * @example
 * ```typescript
 * formatStreak(0); // ""
 * formatStreak(5); // "🔥 5 streak"
 * formatStreak(1); // "🔥 1 streak"
 * ```
 */
export function formatStreak(streak: number): string {
  if (streak <= 0) return '';
  return `🔥 ${streak} streak`;
}

/**
 * Format accuracy as percentage with one decimal place
 *
 * @param correct - Number of correct answers
 * @param total - Total number of attempts
 * @returns Formatted accuracy string (e.g., "85.5%")
 *
 * @example
 * ```typescript
 * formatAccuracy(17, 20); // "85.0%"
 * formatAccuracy(0, 0); // "0.0%"
 * ```
 */
export function formatAccuracy(correct: number, total: number): string {
  if (total === 0) return '0.0%';
  const accuracy = (correct / total) * 100;
  return `${accuracy.toFixed(1)}%`;
}
