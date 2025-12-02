/**
 * Recommendation-related TypeScript types
 * Maps to backend schema: @backend/app/schemas/recommendation.py
 */

import type { DifficultyLevel, ContentFormat, ContentType } from './content';

/**
 * Recommendation request interface
 * @backend/app/schemas/recommendation.py:RecommendationRequest (lines 5-45)
 */
export interface RecommendationRequest {
  user_id: number;
  dialog_id?: number;
  override_difficulty?: DifficultyLevel;
  override_format?: ContentFormat;
}

/**
 * Content summary for recommendation response
 * @backend/app/schemas/recommendation.py:ContentSummary (lines 58-72)
 */
export interface ContentSummary {
  content_id: number;
  title: string;
  difficulty_level: DifficultyLevel;
  format: ContentFormat;
  content_type: ContentType;
  topic: string;
  subtopic: string | null;
}

/**
 * Recommendation metadata interface
 * @backend/app/schemas/recommendation.py:RecommendationMetadata (lines 74-90)
 */
export interface RecommendationMetadata {
  difficulty: DifficultyLevel;
  format: ContentFormat;
  topic: string | null;
  tempo: string;
  remediation_topics: string[];
  adaptation_metadata: Record<string, any>;
}

/**
 * Recommendation response interface
 * @backend/app/schemas/recommendation.py:RecommendationResponse (lines 92-137)
 */
export interface Recommendation {
  content: ContentSummary;
  reasoning: string;
  confidence: number;
  recommendation_metadata: RecommendationMetadata;
  strategy_used: string;
  timestamp: string;
}

/**
 * Recommendation history item
 * @backend/app/schemas/recommendation.py:RecommendationHistoryItem (lines 140-151)
 */
export interface RecommendationHistoryItem {
  content_id: number;
  content_title: string;
  difficulty: DifficultyLevel;
  format: ContentFormat;
  topic: string;
  timestamp: string;
  dialog_id: number | null;
}

/**
 * Recommendation history response
 * @backend/app/schemas/recommendation.py:RecommendationHistoryResponse (lines 153-160)
 */
export interface RecommendationHistoryResponse {
  user_id: number;
  history: RecommendationHistoryItem[];
  total_count: number;
}
