/**
 * Content Service
 *
 * Handles all content-related API calls including:
 * - Fetching content items with filters and pagination
 * - Getting specific content by ID
 * - Getting random content
 * - Getting available topics
 * - Getting next content in sequence
 *
 * References:
 * - Backend routes: @backend/app/api/routes/content.py
 * - Backend schemas: @backend/app/schemas/content.py
 * - Type definitions: @frontend/src/types/content.ts
 */

import apiClient from './api';
import type {
  ContentItem,
  ContentListResponse,
  DifficultyLevel,
  ContentFormat,
  ContentType,
} from '../types/content';

/**
 * Parameters for filtering content
 */
export interface ContentFilters {
  topic?: string;
  subtopic?: string;
  difficulty?: DifficultyLevel;
  format?: ContentFormat;
  content_type?: ContentType;
  skills?: string[];
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;  // Maximum number of items to return (default: 10, max: 100)
  offset?: number; // Number of items to skip (default: 0)
}

/**
 * Combined parameters for content listing
 */
export interface GetContentParams extends ContentFilters, PaginationParams {}

/**
 * Get content items with optional filters and pagination
 *
 * @param params - Optional filters and pagination parameters
 * @returns Promise resolving to ContentListResponse with items and pagination metadata
 *
 * @example
 * ```typescript
 * // Get all content with default pagination
 * const response = await getContent();
 *
 * // Get content filtered by topic and difficulty
 * const response = await getContent({
 *   topic: 'algebra',
 *   difficulty: 'easy',
 *   limit: 20,
 *   offset: 0
 * });
 * ```
 *
 * @backend GET /api/v1/content (@backend/app/api/routes/content.py:53)
 */
export async function getContent(params?: GetContentParams): Promise<ContentListResponse> {
  return await apiClient.get('/api/v1/content', {
    params: {
      topic: params?.topic,
      subtopic: params?.subtopic,
      difficulty: params?.difficulty,
      format: params?.format,
      content_type: params?.content_type,
      skills: params?.skills,
      limit: params?.limit ?? 10,
      offset: params?.offset ?? 0,
    },
  });
}

/**
 * Get a specific content item by ID
 *
 * @param contentId - The ID of the content item to retrieve
 * @returns Promise resolving to ContentItem
 * @throws ApiError if content not found (404)
 *
 * @example
 * ```typescript
 * const content = await getContentById(42);
 * console.log(content.title, content.difficulty_level);
 * ```
 *
 * @backend GET /api/v1/content/{content_id} (@backend/app/api/routes/content.py:187)
 */
export async function getContentById(contentId: number): Promise<ContentItem> {
  return await apiClient.get(`/api/v1/content/${contentId}`);
}

/**
 * Get a random content item, optionally filtered
 *
 * Useful for cold start scenarios where the system doesn't have enough
 * information about the user to make personalized recommendations.
 *
 * @param filters - Optional filters to apply
 * @returns Promise resolving to a random ContentItem
 * @throws ApiError if no content matches filters (404)
 *
 * @example
 * ```typescript
 * // Get any random content
 * const content = await getRandomContent();
 *
 * // Get random content filtered by topic and difficulty
 * const content = await getRandomContent({
 *   topic: 'algebra',
 *   difficulty: 'easy'
 * });
 * ```
 *
 * @backend GET /api/v1/content/random (@backend/app/api/routes/content.py:125)
 */
export async function getRandomContent(filters?: ContentFilters): Promise<ContentItem> {
  return await apiClient.get('/api/v1/content/random', {
    params: {
      topic: filters?.topic,
      difficulty: filters?.difficulty,
      format: filters?.format,
      content_type: filters?.content_type,
    },
  });
}

/**
 * Get list of all unique topics in the content database
 *
 * Returns a sorted list of topic names that can be used for filtering
 * or displaying available topics to users.
 *
 * @returns Promise resolving to array of topic names
 *
 * @example
 * ```typescript
 * const topics = await getTopics();
 * console.log('Available topics:', topics);
 * // Output: ['algebra', 'geometry', 'calculus', ...]
 * ```
 *
 * @backend GET /api/v1/content/topics (@backend/app/api/routes/content.py:173)
 */
export async function getTopics(): Promise<string[]> {
  return await apiClient.get('/api/v1/content/topics');
}

/**
 * Get the next content item in a learning sequence
 *
 * Determines the next content based on:
 * - Explicit next_id in content metadata
 * - Sequence numbers in content metadata
 * - Difficulty progression (easy → normal → hard → challenge)
 * - Skills and prerequisites relationships
 *
 * @param contentId - ID of the current content item
 * @param userId - ID of the user (for personalization)
 * @returns Promise resolving to next ContentItem
 * @throws ApiError if current content not found (404) or no next content available (204)
 *
 * @example
 * ```typescript
 * try {
 *   const nextContent = await getNextContent(42, 1);
 *   console.log('Next content:', nextContent.title);
 * } catch (error) {
 *   if (error.status === 204) {
 *     console.log('End of sequence - no next content');
 *   }
 * }
 * ```
 *
 * @backend GET /api/v1/content/{content_id}/next (@backend/app/api/routes/content.py:209)
 */
export async function getNextContent(
  contentId: number,
  userId: number
): Promise<ContentItem | null> {
  try {
    return await apiClient.get(
      `/api/v1/content/${contentId}/next`,
      {
        params: { user_id: userId },
      }
    );
  } catch (error: any) {
    // Backend returns 204 No Content when there's no next content
    // This is not an error - just the end of the sequence
    if (error.status === 204) {
      return null;
    }
    throw error;
  }
}

/**
 * Export all functions as a single object for convenient importing
 *
 * @example
 * ```typescript
 * import contentService from './services/contentService';
 *
 * const topics = await contentService.getTopics();
 * const content = await contentService.getRandomContent({ difficulty: 'easy' });
 * ```
 */
export default {
  getContent,
  getContentById,
  getRandomContent,
  getTopics,
  getNextContent,
};
