/**
 * Session Storage Utilities
 *
 * Manages session storage for user and dialog state persistence.
 * Allows learning sessions to survive page refreshes.
 *
 * References:
 * - Browser sessionStorage API
 * - Used in: @frontend/src/pages/LearningPage.tsx
 *
 * @module utils/sessionStorage
 */

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  USER_ID: 'adaptive_lms_user_id',
  DIALOG_ID: 'adaptive_lms_dialog_id',
  SESSION_START: 'adaptive_lms_session_start',
} as const;

/**
 * Save user ID to sessionStorage
 *
 * @param userId - User ID to store
 */
export const saveUserId = (userId: number): void => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.USER_ID, String(userId));
  } catch (error) {
    console.error('[sessionStorage] Failed to save userId:', error);
  }
};

/**
 * Retrieve user ID from sessionStorage
 *
 * @returns User ID as number, or null if not found
 */
export const getUserId = (): number | null => {
  try {
    const userId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
    return userId ? parseInt(userId, 10) : null;
  } catch (error) {
    console.error('[sessionStorage] Failed to get userId:', error);
    return null;
  }
};

/**
 * Save dialog ID to sessionStorage
 *
 * @param dialogId - Dialog ID to store
 */
export const saveDialogId = (dialogId: number): void => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.DIALOG_ID, String(dialogId));
  } catch (error) {
    console.error('[sessionStorage] Failed to save dialogId:', error);
  }
};

/**
 * Retrieve dialog ID from sessionStorage
 *
 * @returns Dialog ID as number, or null if not found
 */
export const getDialogId = (): number | null => {
  try {
    const dialogId = sessionStorage.getItem(STORAGE_KEYS.DIALOG_ID);
    return dialogId ? parseInt(dialogId, 10) : null;
  } catch (error) {
    console.error('[sessionStorage] Failed to get dialogId:', error);
    return null;
  }
};

/**
 * Save session start timestamp to sessionStorage
 *
 * @param timestamp - ISO 8601 timestamp string
 */
export const saveSessionStart = (timestamp: string): void => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_START, timestamp);
  } catch (error) {
    console.error('[sessionStorage] Failed to save session start:', error);
  }
};

/**
 * Retrieve session start timestamp from sessionStorage
 *
 * @returns ISO 8601 timestamp string, or null if not found
 */
export const getSessionStart = (): string | null => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.SESSION_START);
  } catch (error) {
    console.error('[sessionStorage] Failed to get session start:', error);
    return null;
  }
};

/**
 * Get session duration in minutes
 *
 * Calculates duration from stored session start time to now.
 *
 * @returns Duration in minutes, or 0 if session start not found
 */
export const getSessionDuration = (): number => {
  try {
    const sessionStart = getSessionStart();
    if (!sessionStart) {
      return 0;
    }

    const startTime = new Date(sessionStart).getTime();
    const currentTime = new Date().getTime();
    const durationMs = currentTime - startTime;

    // Convert milliseconds to minutes
    return Math.floor(durationMs / (1000 * 60));
  } catch (error) {
    console.error('[sessionStorage] Failed to calculate session duration:', error);
    return 0;
  }
};

/**
 * Clear all session data from sessionStorage
 *
 * Removes user ID, dialog ID, and session start time.
 * Call this when ending a session or logging out.
 */
export const clearSession = (): void => {
  try {
    // sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
    sessionStorage.removeItem(STORAGE_KEYS.DIALOG_ID);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_START);
  } catch (error) {
    console.error('[sessionStorage] Failed to clear session:', error);
  }
};

// Export all functions as default
export default {
  STORAGE_KEYS,
  saveUserId,
  getUserId,
  saveDialogId,
  getDialogId,
  saveSessionStart,
  getSessionStart,
  getSessionDuration,
  clearSession,
};
