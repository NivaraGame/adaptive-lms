/**
 * Content-related TypeScript types
 * Maps to backend schema: @backend/app/schemas/content.py
 * Backend contract source: @backend/scripts/content_generator.py
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
 * Lesson content_data shape (backend contract)
 * @backend/scripts/content_generator.py:get_lesson_content
 */
export interface LessonContentData {
  introduction: string;
  sections: Array<{ heading: string; content: string }>;
  key_points: string[];
}

/**
 * Exercise content_data shape (backend contract)
 * @backend/scripts/content_generator.py:get_exercise_content
 */
export interface ExerciseContentData {
  question: string;
  description?: string;
  starter_code?: string;
  solution?: string;
  test_cases?: string[];
}

/**
 * Quiz content_data shape (backend contract)
 * @backend/scripts/content_generator.py:get_quiz_content
 */
export interface QuizContentData {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  quiz_type?: 'multiple_choice' | 'true_false' | 'multiple_select';
}

/**
 * Visual content_data shape
 */
export interface VisualContentData {
  image_url?: string;
  caption?: string;
  description?: string;
  alt_text?: string;
}

/**
 * Video content_data shape
 */
export interface VideoContentData {
  video_url?: string;
  duration?: number;
  subtitles?: string;
  thumbnail_url?: string;
}

/**
 * Reference answer structure for exercises
 */
export interface ReferenceAnswer {
  solution?: string;
  answer?: string;
  correct_answer?: string;
  value?: string;
}

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
  reference_answer: ReferenceAnswer | string | null;
  hints: any[];
  explanations: any[];
  skills: string[];
  prerequisites: string[];
  extra_data: Record<string, any>;
}

/**
 * Typed content items with discriminated unions
 */
export type LessonContentItem = ContentItem & {
  content_type: 'lesson';
  content_data: LessonContentData;
};

export type ExerciseContentItem = ContentItem & {
  content_type: 'exercise';
  content_data: ExerciseContentData;
};

export type QuizContentItem = ContentItem & {
  content_type: 'quiz';
  content_data: QuizContentData;
};

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
