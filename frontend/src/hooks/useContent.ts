/**
 * useContent Hook
 *
 * Custom React Query hook for managing content item fetching.
 * Provides smart caching since content items are relatively static.
 *
 * References:
 * - Content service: @frontend/src/services/contentService.ts
 * - Content types: @frontend/src/types/content.ts
 * - Backend routes: @backend/app/api/routes/content.py
 *
 * @example
 * ```typescript
 * const { content, loadContent, loading, error } = useContent();
 *
 * // Load a content item by ID
 * loadContent(42);
 *
 * // Content automatically fetches and caches
 * if (content) {
 *   console.log(content.title, content.content_type);
 * }
 * ```
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ContentItem } from '../types/content';
import * as contentService from '../services/contentService';

/**
 * Return type for useContent hook
 */
export interface UseContentReturn {
  content: ContentItem | null;
  loadContent: (contentId: number) => void;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for managing content item fetching
 *
 * Uses long cache times since content is relatively static.
 * Call loadContent(id) to fetch a specific content item.
 *
 * @returns {UseContentReturn} Content state and functions
 *
 * @example
 * ```typescript
 * const { content, loadContent, loading } = useContent();
 *
 * // Load content
 * useEffect(() => {
 *   loadContent(123);
 * }, []);
 *
 * // Display content
 * if (loading) return <Loading />;
 * if (content) return <ContentViewer content={content} />;
 * ```
 */
export function useContent(): UseContentReturn {
  // Local state to track which content ID to fetch
  const [currentContentId, setCurrentContentId] = useState<number | null>(null);

  // Query for fetching content by ID
  const {
    data: content = null,
    isLoading,
    error,
  } = useQuery<ContentItem | null, Error>({
    queryKey: ['content', currentContentId],
    queryFn: async () => {
      if (currentContentId === null) {
        return null;
      }
      const fetchedContent = await contentService.getContentById(currentContentId);
      return fetchedContent;
    },
    enabled: currentContentId !== null, // Only fetch when contentId is set
    staleTime: 10 * 60 * 1000, // 10 minutes - content is static
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
  });

  // Function to load a specific content item
  const loadContent = (contentId: number) => {
    setCurrentContentId(contentId);
  };

  return {
    content,
    loadContent,
    loading: isLoading,
    error: error as Error | null,
  };
}
