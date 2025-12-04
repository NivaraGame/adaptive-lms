/**
 * User Service
 *
 * Handles user-related API operations including:
 * - User registration and authentication
 * - Fetching user information
 * - User profile management
 *
 * Backend references:
 * - User routes: @backend/app/api/routes/users.py
 * - User profile routes: @backend/app/api/routes/user_profiles.py
 * - User schema: @backend/app/schemas/user.py
 * - User profile schema: @backend/app/schemas/user_profile.py
 */

import api from './api';
import type { User, UserProfile } from '../types/user';

/**
 * User creation payload
 * Maps to backend UserCreate schema (@backend/app/schemas/user.py:19-21)
 */
export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
}

/**
 * Create a new user
 *
 * POST /api/v1/users
 *
 * Backend reference: @backend/app/api/routes/users.py:17-59
 *
 * Note: User profile is automatically created on user registration
 * (@backend/app/api/routes/users.py:49-57)
 *
 * @param userData - User creation data (username, email, password)
 * @returns Promise<User> - Created user object (UserResponse)
 * @throws ApiError - If username/email already exists or validation fails
 */
export const createUser = async (userData: CreateUserPayload): Promise<User> => {
  try {
    return await api.post('/api/v1/users', userData);
  } catch (error) {
    console.error('[userService] Failed to create user:', error);
    throw error;
  }
};

/**
 * Get user by ID
 *
 * GET /api/v1/users/{user_id}
 *
 * Backend reference: @backend/app/api/routes/users.py:62-75
 *
 * @param userId - User ID
 * @returns Promise<User> - User object (UserResponse)
 * @throws ApiError - If user not found (404)
 */
export const getUser = async (userId: number): Promise<User> => {
  try {
    return await api.get(`/api/v1/users/${userId}`);
  } catch (error) {
    console.error(`[userService] Failed to fetch user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get user profile by user ID
 *
 * GET /api/v1/user-profiles/user/{user_id}
 *
 * Backend reference: @backend/app/api/routes/user_profiles.py:38-53
 *
 * Returns the user's learning profile including:
 * - topic_mastery: Record<string, number> - Mastery levels per topic (0-1)
 * - preferred_format: 'text' | 'visual' | 'video' | 'interactive' | null
 * - learning_pace: 'slow' | 'medium' | 'fast'
 * - avg_accuracy: number | null - Average accuracy across all interactions
 * - current_difficulty: 'easy' | 'normal' | 'hard' | 'challenge'
 * - total_interactions: number - Total number of learning interactions
 * - total_time_spent: number - Total time spent learning (seconds)
 * - And more statistics...
 *
 * @param userId - User ID
 * @returns Promise<UserProfile> - User profile object (UserProfileResponse)
 * @throws ApiError - If profile not found (404)
 */
export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  try {
    return await api.get(`/api/v1/user-profiles/user/${userId}`);
  } catch (error) {
    console.error(`[userService] Failed to fetch user profile for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Update user profile preferences
 *
 * PATCH /api/v1/user-profiles/user/{user_id}
 *
 * Backend reference: @backend/app/api/routes/user_profiles.py:72-100
 *
 * Use this to update profile preferences like:
 * - preferred_format (text/visual/video/interactive)
 * - learning_pace (slow/medium/fast)
 * - current_difficulty (easy/normal/hard/challenge)
 *
 * Note: Metrics like topic_mastery and avg_response_time are updated automatically
 * through the metrics workflow, not through this endpoint.
 *
 * @param userId - User ID
 * @param updates - Partial profile updates
 * @returns Promise<UserProfile> - Updated user profile
 * @throws ApiError - If profile not found (404)
 */
export const updateUserProfile = async (
  userId: number,
  updates: Partial<Pick<UserProfile, 'preferred_format' | 'learning_pace' | 'current_difficulty'>>
): Promise<UserProfile> => {
  try {
    return await api.patch(
      `/api/v1/user-profiles/user/${userId}`,
      updates
    );
  } catch (error) {
    console.error(`[userService] Failed to update user profile for user ${userId}:`, error);
    throw error;
  }
};

/**
 * List all users (paginated)
 *
 * GET /api/v1/users
 *
 * Backend reference: @backend/app/api/routes/users.py:78-84
 *
 * @param skip - Number of users to skip (default: 0)
 * @param limit - Maximum number of users to return (default: 100)
 * @returns Promise<User[]> - Array of user objects
 */
export const listUsers = async (skip: number = 0, limit: number = 100): Promise<User[]> => {
  try {
    return await api.get('/api/v1/users', {
      params: { skip, limit }
    });
  } catch (error) {
    console.error('[userService] Failed to list users:', error);
    throw error;
  }
};

// Export all functions as named exports
export default {
  createUser,
  getUser,
  getUserProfile,
  updateUserProfile,
  listUsers,
};
