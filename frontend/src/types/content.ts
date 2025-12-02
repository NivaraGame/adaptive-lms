/**
 * Content-related TypeScript types
 * Maps to backend schema: @backend/app/schemas/content.py
 */

/**
 * Difficulty level enumeration
 * @backend/app/schemas/content.py:21-27
 */
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'challenge';

/**
 * Content format enumeration
 * @backend/app/schemas/content.py:29-35
 */
export type ContentFormat = 'text' | 'visual' | 'video' | 'interactive';

/**
 * Content type enumeration
 * @backend/app/schemas/content.py:37-43
 */
export type ContentType = 'lesson' | 'exercise' | 'quiz' | 'explanation';

/**
 * Content item interface matching backend ContentItemResponse schema
 * @backend/app/schemas/content.py:ContentItemResponse
 */
export interface ContentItem {
  content_id: number;
  title: string;
  topic: string;
  subtopic: string | null;
  difficulty_level: DifficultyLevel;
  format: ContentFormat;
  content_type: ContentType;
  content_data: Record<string, any>;
  reference_answer: Record<string, any> | null;
  hints: any[];
  explanations: any[];
  skills: string[];
  prerequisites: string[];
  extra_data: Record<string, any>;
}

/**
 * Pagination metadata interface
 * @backend/app/schemas/content.py:PaginationMetadata (lines 110-119)
 */
export interface PaginationMetadata {
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
  current_page: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Content list response with pagination
 * @backend/app/schemas/content.py:ContentListResponse (lines 121-124)
 */
export interface ContentListResponse {
  items: ContentItem[];
  pagination: PaginationMetadata;
}
