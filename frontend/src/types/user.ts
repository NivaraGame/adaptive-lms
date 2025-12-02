/**
 * User-related TypeScript types
 * Maps to backend schemas: @backend/app/schemas/user.py and @backend/app/schemas/user_profile.py
 */

/**
 * User interface matching backend UserResponse schema
 * @backend/app/schemas/user.py:UserResponse
 */
export interface User {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * User profile interface matching backend UserProfileResponse schema
 * @backend/app/schemas/user_profile.py:UserProfileResponse
 */
export interface UserProfile {
  profile_id: number;
  user_id: number;
  topic_mastery: Record<string, number>;
  preferred_format: 'text' | 'visual' | 'video' | 'interactive' | null;
  learning_pace: 'slow' | 'medium' | 'fast';
  error_patterns: any[];
  avg_response_time: number | null;
  avg_accuracy: number | null;
  total_interactions: number;
  total_time_spent: number;
  current_difficulty: 'easy' | 'normal' | 'hard' | 'challenge';
  extra_data: Record<string, any>;
  last_updated: string;
}
