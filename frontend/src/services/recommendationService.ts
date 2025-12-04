/**
 * Recommendation Service
 *
 * This service handles all recommendation-related API calls.
 * It provides functions to get personalized content recommendations
 * using the adaptive learning engine.
 *
 * Backend Reference:
 * - Routes: @backend/app/api/routes/recommendations.py
 * - Service: @backend/app/services/recommendation_service.py
 * - Adaptation Engine: @backend/app/core/adaptation/engine.py
 */

import api from './api';
import type {
  Recommendation,
  RecommendationRequest,
  RecommendationHistoryResponse,
} from '../types/recommendation';

/**
 * Get next recommended content for a user
 *
 * Uses the adaptation engine to analyze the user's profile, recent metrics,
 * and session context to recommend the most appropriate content.
 *
 * @backend/app/api/routes/recommendations.py:30-241 (POST /api/v1/recommendations/next)
 *
 * The recommendation is based on:
 * - Current difficulty level and performance
 * - Preferred learning format
 * - Topics needing remediation (mastery < 0.4)
 * - Session fatigue and tempo
 *
 * @param userId - Required user ID
 * @param dialogId - Optional dialog ID for session context
 * @param overrideDifficulty - Optional difficulty override for testing
 * @param overrideFormat - Optional format override for testing
 * @returns Promise<Recommendation> - Recommended content with reasoning and metadata
 * @throws ApiError - 404 if user not found or no suitable content, 500 on engine failure
 *
 * @example
 * ```typescript
 * // Get recommendation for user in a dialog
 * const recommendation = await getRecommendation(1, 42);
 *
 * // Get recommendation with difficulty override
 * const easyContent = await getRecommendation(1, 42, 'easy');
 *
 * // Get recommendation without dialog context
 * const recommendation = await getRecommendation(1);
 * ```
 */
export async function getRecommendation(
  userId: number,
  dialogId?: number,
  overrideDifficulty?: 'easy' | 'normal' | 'hard' | 'challenge',
  overrideFormat?: 'text' | 'visual' | 'video' | 'interactive'
): Promise<Recommendation> {
  const requestBody: RecommendationRequest = {
    user_id: userId,
    dialog_id: dialogId,
    override_difficulty: overrideDifficulty,
    override_format: overrideFormat,
  };

  const response: Recommendation = await api.post(
    '/api/v1/recommendations/next',
    requestBody
  );

  return response;
}

/**
 * Get recommendation history for a user
 *
 * Returns the list of content items that have been recommended/shown
 * to the user recently, along with timestamps and context.
 *
 * @backend/app/api/routes/recommendations.py:294-345 (GET /api/v1/recommendations/history)
 *
 * @param userId - User ID
 * @param limit - Maximum number of history items to return (default: 10, max: 50)
 * @returns Promise<RecommendationHistoryResponse> - List of recent recommendations
 * @throws ApiError - 400 for invalid parameters, 500 on server error
 *
 * @example
 * ```typescript
 * // Get last 10 recommendations
 * const history = await getRecommendationHistory(1);
 *
 * // Get last 20 recommendations
 * const history = await getRecommendationHistory(1, 20);
 * ```
 */
export async function getRecommendationHistory(
  userId: number,
  limit: number = 10
): Promise<RecommendationHistoryResponse> {
  const response: RecommendationHistoryResponse = await api.get(
    '/api/v1/recommendations/history',
    {
      params: {
        user_id: userId,
        limit: limit > 50 ? 50 : limit, // Backend enforces max 50
      },
    }
  );

  return response;
}
