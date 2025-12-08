/**
 * Learning Interface Data Mapping Utilities
 *
 * Pure, framework-agnostic data mappers that convert backend models
 * to UI-friendly shapes. All functions are side-effect free and fully typed.
 *
 * @module utils/learning/mappers
 */

import type { ContentItem } from '../../types/content';
import type { Dialog, Message } from '../../types/dialog';

/**
 * UI-friendly content summary for display in lists and cards
 */
export interface ContentSummary {
  id: number;
  title: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  type: string;
  format: string;
  hasHints: boolean;
  hasExplanations: boolean;
  skillCount: number;
}

/**
 * UI-friendly dialog summary for display in headers and lists
 */
export interface DialogSummary {
  id: number;
  userId: number;
  type: string;
  topic: string;
  startedAt: Date;
  endedAt: Date | null;
  isActive: boolean;
  duration: number | null; // in minutes
}

/**
 * UI-friendly message display data
 */
export interface MessageDisplay {
  id: number;
  content: string;
  isUser: boolean;
  isQuestion: boolean;
  timestamp: Date;
  formattedTime: string;
}

/**
 * Map ContentItem to UI-friendly ContentSummary
 *
 * @param content - Backend ContentItem model
 * @returns UI-friendly content summary
 *
 * @example
 * ```typescript
 * const summary = mapContentToSummary(contentItem);
 * console.log(summary.title); // Human-readable title
 * console.log(summary.hasHints); // Boolean flag
 * ```
 */
export function mapContentToSummary(content: ContentItem): ContentSummary {
  return {
    id: content.content_id,
    title: content.title,
    topic: content.topic,
    subtopic: content.subtopic || 'General',
    difficulty: content.difficulty_level,
    type: content.content_type,
    format: content.format,
    hasHints: Array.isArray(content.hints) && content.hints.length > 0,
    hasExplanations: Array.isArray(content.explanations) && content.explanations.length > 0,
    skillCount: Array.isArray(content.skills) ? content.skills.length : 0,
  };
}

/**
 * Map Dialog to UI-friendly DialogSummary
 *
 * @param dialog - Backend Dialog model
 * @returns UI-friendly dialog summary
 *
 * @example
 * ```typescript
 * const summary = mapDialogToSummary(dialog);
 * console.log(summary.isActive); // Boolean
 * console.log(summary.duration); // Number in minutes or null
 * ```
 */
export function mapDialogToSummary(dialog: Dialog): DialogSummary {
  const startedAt = new Date(dialog.started_at);
  const endedAt = dialog.ended_at ? new Date(dialog.ended_at) : null;

  let duration: number | null = null;
  if (endedAt) {
    duration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 60000);
  }

  return {
    id: dialog.dialog_id,
    userId: dialog.user_id,
    type: dialog.dialog_type,
    topic: dialog.topic || 'General Learning',
    startedAt,
    endedAt,
    isActive: !dialog.ended_at,
    duration,
  };
}

/**
 * Map Message to UI-friendly MessageDisplay
 *
 * @param message - Backend Message model
 * @param formatTime - Optional function to format timestamp
 * @returns UI-friendly message display data
 *
 * @example
 * ```typescript
 * const display = mapMessageToDisplay(message, formatTimestamp);
 * console.log(display.isUser); // Boolean
 * console.log(display.formattedTime); // "Just now"
 * ```
 */
export function mapMessageToDisplay(
  message: Message,
  formatTime?: (timestamp: string) => string
): MessageDisplay {
  const timestamp = new Date(message.timestamp);
  const formattedTime = formatTime ? formatTime(message.timestamp) : timestamp.toLocaleTimeString();

  return {
    id: message.message_id,
    content: message.content,
    isUser: message.sender_type === 'user',
    isQuestion: message.is_question,
    timestamp,
    formattedTime,
  };
}

/**
 * Extract learning statistics from content array
 *
 * @param contents - Array of ContentItem models
 * @returns Statistics object with counts by type, difficulty, etc.
 *
 * @example
 * ```typescript
 * const stats = extractLearningStats(contentArray);
 * console.log(stats.totalContent); // 25
 * console.log(stats.byDifficulty.easy); // 10
 * ```
 */
export function extractLearningStats(contents: ContentItem[]): {
  totalContent: number;
  byType: Record<string, number>;
  byDifficulty: Record<string, number>;
  byFormat: Record<string, number>;
  totalSkills: number;
} {
  const stats = {
    totalContent: contents.length,
    byType: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    byFormat: {} as Record<string, number>,
    totalSkills: 0,
  };

  const uniqueSkills = new Set<string>();

  contents.forEach((content) => {
    // Count by type
    stats.byType[content.content_type] = (stats.byType[content.content_type] || 0) + 1;

    // Count by difficulty
    stats.byDifficulty[content.difficulty_level] =
      (stats.byDifficulty[content.difficulty_level] || 0) + 1;

    // Count by format
    stats.byFormat[content.format] = (stats.byFormat[content.format] || 0) + 1;

    // Collect unique skills
    if (Array.isArray(content.skills)) {
      content.skills.forEach((skill) => uniqueSkills.add(skill));
    }
  });

  stats.totalSkills = uniqueSkills.size;

  return stats;
}

/**
 * Group messages by sender for conversation threading
 *
 * @param messages - Array of Message models
 * @returns Grouped messages array with consecutive messages from same sender combined
 *
 * @example
 * ```typescript
 * const grouped = groupMessagesBySender(messages);
 * // [{sender: 'user', messages: [...]}, {sender: 'system', messages: [...]}]
 * ```
 */
export function groupMessagesBySender(messages: Message[]): Array<{
  sender: 'user' | 'system';
  messages: Message[];
}> {
  if (messages.length === 0) return [];

  const grouped: Array<{ sender: 'user' | 'system'; messages: Message[] }> = [];
  let currentGroup: { sender: 'user' | 'system'; messages: Message[] } | null = null;

  messages.forEach((message) => {
    if (!currentGroup || currentGroup.sender !== message.sender_type) {
      currentGroup = { sender: message.sender_type, messages: [message] };
      grouped.push(currentGroup);
    } else {
      currentGroup.messages.push(message);
    }
  });

  return grouped;
}

/**
 * Extract question-answer pairs from messages for review
 *
 * @param messages - Array of Message models
 * @returns Array of Q&A pairs
 *
 * @example
 * ```typescript
 * const qaHistory = extractQuestionAnswerPairs(messages);
 * qaHistory.forEach(qa => {
 *   console.log(qa.question); // User question
 *   console.log(qa.answer); // System response
 * });
 * ```
 */
export function extractQuestionAnswerPairs(messages: Message[]): Array<{
  question: string;
  answer: string | null;
  timestamp: Date;
}> {
  const pairs: Array<{ question: string; answer: string | null; timestamp: Date }> = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    // If this is a user question
    if (message.sender_type === 'user' && message.is_question) {
      const nextMessage = messages[i + 1];
      const answer = nextMessage && nextMessage.sender_type === 'system' ? nextMessage.content : null;

      pairs.push({
        question: message.content,
        answer,
        timestamp: new Date(message.timestamp),
      });
    }
  }

  return pairs;
}
