/**
 * Content Formatter Utilities
 *
 * Parses content_data from backend into typed structures.
 * Backend contract: @backend/scripts/content_generator.py
 *
 * IMPORTANT: All content is rendered as plain text for security.
 * No HTML rendering except with explicit sanitization.
 *
 * @module utils/contentFormatter
 */

import type {
  ContentFormat,
  ContentType,
} from '../types/content';

/**
 * Normalized lesson data
 */
export interface NormalizedLessonData {
  introduction: string;
  sections: Array<{ heading: string; content: string }>;
  key_points: string[];
}

/**
 * Normalized exercise data
 */
export interface NormalizedExerciseData {
  question: string;
  description: string;
  starter_code: string;
  solution: string;
  test_cases: string[];
}

/**
 * Normalized quiz data
 */
export interface NormalizedQuizData {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  quiz_type: 'multiple_choice' | 'true_false' | 'multiple_select';
}

/**
 * Normalized visual data
 */
export interface NormalizedVisualData {
  image_url: string;
  caption: string;
  description: string;
  alt_text: string;
}

/**
 * Normalized video data
 */
export interface NormalizedVideoData {
  video_url: string;
  duration?: number;
  subtitles: string;
  thumbnail_url: string;
}

/**
 * Parse lesson content_data
 * Backend shape: { introduction, sections: [{heading, content}], key_points: [] }
 */
export function parseLessonData(contentData: Record<string, any>): NormalizedLessonData {
  return {
    introduction: String(contentData.introduction || ''),
    sections: Array.isArray(contentData.sections)
      ? contentData.sections.map((s: any) => ({
          heading: String(s?.heading || ''),
          content: String(s?.content || ''),
        }))
      : [],
    key_points: Array.isArray(contentData.key_points)
      ? contentData.key_points.map((kp: any) => String(kp || ''))
      : [],
  };
}

/**
 * Parse exercise content_data
 * Backend shape: { question, starter_code?, solution?, test_cases?: [] }
 */
export function parseExerciseData(contentData: Record<string, any>): NormalizedExerciseData {
  return {
    question: String(contentData.question || contentData.prompt || ''),
    description: String(contentData.description || ''),
    starter_code: String(contentData.starter_code || ''),
    solution: String(contentData.solution || ''),
    test_cases: Array.isArray(contentData.test_cases)
      ? contentData.test_cases.map((tc: any) => String(tc || ''))
      : [],
  };
}

/**
 * Parse quiz content_data
 * Backend shape: { question, options: [], correct_answer, explanation }
 */
export function parseQuizData(contentData: Record<string, any>): NormalizedQuizData {
  const quizType = contentData.quiz_type || 'multiple_choice';

  return {
    question: String(contentData.question || ''),
    options: Array.isArray(contentData.options)
      ? contentData.options.map((o: any) => String(o || ''))
      : [],
    correct_answer: String(contentData.correct_answer || ''),
    explanation: String(contentData.explanation || ''),
    quiz_type:
      quizType === 'true_false' || quizType === 'multiple_select'
        ? quizType
        : 'multiple_choice',
  };
}

/**
 * Parse visual content_data
 */
export function parseVisualData(contentData: Record<string, any>): NormalizedVisualData {
  return {
    image_url: String(contentData.image_url || contentData.imageUrl || ''),
    caption: String(contentData.caption || ''),
    description: String(contentData.description || ''),
    alt_text: String(contentData.alt_text || contentData.altText || contentData.description || 'Visual content'),
  };
}

/**
 * Parse video content_data
 */
export function parseVideoData(contentData: Record<string, any>): NormalizedVideoData {
  return {
    video_url: String(contentData.video_url || contentData.videoUrl || ''),
    duration: typeof contentData.duration === 'number' ? contentData.duration : undefined,
    subtitles: String(contentData.subtitles || ''),
    thumbnail_url: String(contentData.thumbnail_url || contentData.thumbnailUrl || ''),
  };
}

/**
 * Main parser: routes by content_type
 *
 * @param contentData - Raw content_data from backend
 * @param contentType - Content type discriminator
 * @param format - Format (used for lessons that may have visual/video formats)
 * @returns Normalized, type-safe data structure
 */
export function parseContentData(
  contentData: Record<string, any>,
  contentType: ContentType,
  format: ContentFormat
):
  | NormalizedLessonData
  | NormalizedExerciseData
  | NormalizedQuizData
  | NormalizedVisualData
  | NormalizedVideoData
  | null {

  if (!contentData || typeof contentData !== 'object') {
    console.warn('Invalid content_data:', contentData);
    return null;
  }

  try {
    switch (contentType) {
      case 'lesson':
        if (format === 'visual') return parseVisualData(contentData);
        if (format === 'video') return parseVideoData(contentData);
        return parseLessonData(contentData);

      case 'exercise':
        return parseExerciseData(contentData);

      case 'quiz':
        return parseQuizData(contentData);

      case 'explanation':
        return parseLessonData(contentData);

      default:
        console.warn('Unknown content_type:', contentType);
        return null;
    }
  } catch (error) {
    console.error('Error parsing content_data:', error);
    return null;
  }
}

/**
 * Format timestamp to human-readable string
 *
 * @param timestamp - ISO 8601 timestamp string
 * @returns Formatted string (e.g., "Just now", "5 minutes ago", "14:30", "Mar 15, 14:30")
 */
export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;

    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    const isThisYear = date.getFullYear() === now.getFullYear();
    if (isThisYear) {
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleString('en-US', options);
    }

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleString('en-US', options);
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return timestamp;
  }
}

/**
 * Sanitize user input (basic - strips scripts/iframes)
 * For production with HTML support, integrate DOMPurify
 */
export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') return '';

  let sanitized = input.trim();
  const MAX_LENGTH = 5000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return sanitized;
}
