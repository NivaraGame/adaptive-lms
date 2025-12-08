/**
 * Content Formatter Utilities
 *
 * Utilities for parsing and formatting content_data from backend.
 * Handles different content formats: text, visual, video, interactive.
 *
 * @module utils/contentFormatter
 */

import type { ContentFormat } from '../types/content';

/**
 * Parsed text content structure
 */
export interface ParsedTextContent {
  text?: string;
  headings?: string[];
  lists?: string[][];
  emphasis?: string[];
}

/**
 * Parsed visual content structure
 */
export interface ParsedVisualContent {
  image_url?: string;
  caption?: string;
  description?: string;
  alt_text?: string;
}

/**
 * Parsed video content structure
 */
export interface ParsedVideoContent {
  video_url?: string;
  duration?: number;
  subtitles?: string;
  thumbnail_url?: string;
}

/**
 * Parsed interactive content structure
 */
export interface ParsedInteractiveContent {
  interactive_elements?: any[];
  type?: string;
}

/**
 * Union type for all parsed content types
 */
export type ParsedContentData =
  | ParsedTextContent
  | ParsedVisualContent
  | ParsedVideoContent
  | ParsedInteractiveContent;

/**
 * Parse content_data JSON based on format type
 *
 * @param contentData - Raw content_data object from backend
 * @param format - Content format type
 * @returns Parsed content object with typed fields, or null if parsing fails
 *
 * @example
 * ```typescript
 * const parsed = parseContentData(content.content_data, content.format);
 * if (parsed && 'text' in parsed) {
 *   console.log(parsed.text);
 * }
 * ```
 */
export function parseContentData(
  contentData: Record<string, any>,
  format: ContentFormat
): ParsedContentData | null {
  if (!contentData || typeof contentData !== 'object') {
    console.warn('Invalid content_data provided to parseContentData');
    return null;
  }

  try {
    switch (format) {
      case 'text': {
        return {
          text: contentData.text || contentData.content || '',
          headings: Array.isArray(contentData.headings) ? contentData.headings : [],
          lists: Array.isArray(contentData.lists) ? contentData.lists : [],
          emphasis: Array.isArray(contentData.emphasis) ? contentData.emphasis : [],
        } as ParsedTextContent;
      }

      case 'visual': {
        return {
          image_url: contentData.image_url || contentData.imageUrl || '',
          caption: contentData.caption || '',
          description: contentData.description || '',
          alt_text: contentData.alt_text || contentData.altText || contentData.description || '',
        } as ParsedVisualContent;
      }

      case 'video': {
        return {
          video_url: contentData.video_url || contentData.videoUrl || '',
          duration: typeof contentData.duration === 'number' ? contentData.duration : undefined,
          subtitles: contentData.subtitles || '',
          thumbnail_url: contentData.thumbnail_url || contentData.thumbnailUrl || '',
        } as ParsedVideoContent;
      }

      case 'interactive': {
        return {
          interactive_elements: Array.isArray(contentData.interactive_elements)
            ? contentData.interactive_elements
            : contentData.elements || [],
          type: contentData.type || 'generic',
        } as ParsedInteractiveContent;
      }

      default: {
        console.warn(`Unknown content format: ${format}`);
        return null;
      }
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
 *
 * @example
 * ```typescript
 * const formatted = formatTimestamp('2024-03-15T14:30:00Z');
 * console.log(formatted); // "Mar 15, 14:30" (if not today)
 * ```
 */
export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    // Less than 1 minute ago
    if (diffMinutes < 1) {
      return 'Just now';
    }

    // Less than 1 hour ago
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }

    // Today
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    // This year
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

    // Older
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
 * Sanitize user input to prevent XSS and other security issues
 *
 * @param input - User input string
 * @returns Sanitized string
 *
 * @example
 * ```typescript
 * const safe = sanitizeUserInput(userInput);
 * ```
 */
export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Limit length (max 5000 characters)
  const MAX_LENGTH = 5000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  // Remove potentially harmful HTML/scripts
  // This is a basic sanitization - for production, consider using DOMPurify
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return sanitized;
}
