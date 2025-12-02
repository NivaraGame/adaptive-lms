/**
 * Generic API-related TypeScript types
 * Used for consistent API response handling across the application
 */

/**
 * Generic API-related TypeScript types
 * Used for consistent API response handling across the application
 */
import type { PaginationMetadata } from './content';

/**
 * Generic API response wrapper
 * Wraps API responses with consistent structure
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

/**
 * API error interface
 * Represents error responses from the backend
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Re-export PaginationMetadata for convenience
 * @backend/app/schemas/content.py:PaginationMetadata (lines 110-119)
 */
export type { PaginationMetadata };

/**
 * Generic paginated response
 * Used for any paginated API endpoints
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}
