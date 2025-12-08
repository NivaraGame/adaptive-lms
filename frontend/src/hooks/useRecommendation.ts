/**
 * useRecommendation Hook
 *
 * Custom React Query hook for managing content recommendations.
 * Uses mutation-based approach since recommendations depend on dynamic user state
 * and should trigger fresh computation each time.
 *
 * References:
 * - Recommendation service: @frontend/src/services/recommendationService.ts
 * - Recommendation types: @frontend/src/types/recommendation.ts
 * - Content types: @frontend/src/types/content.ts (for DifficultyLevel, ContentFormat)
 * - Backend routes: @backend/app/api/routes/recommendations.py
 *
 * @example
 * ```typescript
 * const { recommendation, getRecommendation, loading } = useRecommendation();
 *
 * // Get a recommendation for a user
 * const rec = await getRecommendation(userId, dialogId);
 * console.log(rec.content.title, rec.reasoning);
 *
 * // Clear recommendation state
 * clearRecommendation();
 * ```
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { Recommendation } from '../types/recommendation';
import type { DifficultyLevel, ContentFormat } from '../types/content';
import * as recommendationService from '../services/recommendationService';

/**
 * Return type for useRecommendation hook
 */
export interface UseRecommendationReturn {
  recommendation: Recommendation | null;
  getRecommendation: (
    userId: number,
    dialogId?: number,
    overrideDifficulty?: DifficultyLevel,
    overrideFormat?: ContentFormat
  ) => Promise<Recommendation>;
  loading: boolean;
  error: Error | null;
  clearRecommendation: () => void;
}

/**
 * Custom hook for managing content recommendations
 *
 * Uses mutation-based approach (not query) because recommendations are based on
 * dynamic user state and each call should trigger fresh computation by the
 * adaptation engine.
 *
 * Note: This hook returns a ContentSummary (not full ContentItem). Use useContent
 * hook to fetch the full content details.
 *
 * @returns {UseRecommendationReturn} Recommendation state and functions
 *
 * @example
 * ```typescript
 * const { recommendation, getRecommendation, clearRecommendation } = useRecommendation();
 *
 * // Get recommendation
 * const rec = await getRecommendation(userId, dialogId);
 *
 * // Access recommendation details
 * console.log(rec.content.content_id); // ID to fetch full content
 * console.log(rec.reasoning); // Why this was recommended
 * console.log(rec.confidence); // Confidence score 0-1
 *
 * // Clear when done
 * clearRecommendation();
 * ```
 */
export function useRecommendation(): UseRecommendationReturn {
  // Local state to store the latest recommendation
  const [latestRecommendation, setLatestRecommendation] = useState<Recommendation | null>(null);

  // Mutation for getting a recommendation
  const getRecommendationMutation = useMutation<
    Recommendation,
    Error,
    {
      userId: number;
      dialogId?: number;
      overrideDifficulty?: DifficultyLevel;
      overrideFormat?: ContentFormat;
    }
  >({
    mutationFn: async ({ userId, dialogId, overrideDifficulty, overrideFormat }) => {
      const recommendation = await recommendationService.getRecommendation(
        userId,
        dialogId,
        overrideDifficulty,
        overrideFormat
      );
      return recommendation;
    },
    onSuccess: (data) => {
      // Store the recommendation in local state
      setLatestRecommendation(data);
    },
  });

  // Wrapper function for getRecommendation mutation
  const getRecommendation = async (
    userId: number,
    dialogId?: number,
    overrideDifficulty?: DifficultyLevel,
    overrideFormat?: ContentFormat
  ): Promise<Recommendation> => {
    const result = await getRecommendationMutation.mutateAsync({
      userId,
      dialogId,
      overrideDifficulty,
      overrideFormat,
    });
    return result;
  };

  // Function to clear the recommendation state
  const clearRecommendation = () => {
    setLatestRecommendation(null);
  };

  return {
    recommendation: latestRecommendation,
    getRecommendation,
    loading: getRecommendationMutation.isPending,
    error: getRecommendationMutation.error as Error | null,
    clearRecommendation,
  };
}
