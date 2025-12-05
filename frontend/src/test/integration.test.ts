import { describe, it, expect, beforeAll } from 'vitest';
import { createUser, getUser, getUserProfile } from '../services/userService';
import { createDialog, getDialog, sendMessage, getDialogMessages } from '../services/dialogService';
import { getContent, getContentById, getTopics, getRandomContent } from '../services/contentService';
import { getRecommendation, getRecommendationHistory } from '../services/recommendationService';
import { generateTestData } from './testUtils';
import type { User } from '../types/user';
import type { Dialog } from '../types/dialog';

/**
 * Integration Tests for Week 4 Frontend-Backend Communication
 *
 * These tests verify that:
 * 1. Core services (API client, Dialog, Content, User, Recommendation) work together
 * 2. The app can communicate with the backend end-to-end
 * 3. All API responses match TypeScript type definitions
 * 4. The complete user learning flow works as expected
 *
 * Prerequisites:
 * - Backend server must be running at http://localhost:8000
 * - Database must be populated with content items
 */

describe('Integration Tests - Complete Flow', () => {
  let testUser: User;
  let testDialog: Dialog;

  /**
   * Test 1: Create User
   * Verifies userService can create a new user and receive proper response
   */
  it('should create a new user via userService', async () => {
    const userData = generateTestData.user();

    testUser = await createUser(userData);

    expect(testUser).toBeDefined();
    expect(testUser.user_id).toBeTypeOf('number');
    expect(testUser.username).toBe(userData.username);
    expect(testUser.email).toBe(userData.email);
    expect(testUser.created_at).toBeTypeOf('string');
    expect(testUser.updated_at).toBeTypeOf('string');
  }, 10000);

  /**
   * Test 2: Get User by ID
   * Verifies userService can retrieve user details
   */
  it('should fetch user by ID', async () => {
    expect(testUser).toBeDefined();

    const fetchedUser = await getUser(testUser.user_id);

    expect(fetchedUser).toBeDefined();
    expect(fetchedUser.user_id).toBe(testUser.user_id);
    expect(fetchedUser.username).toBe(testUser.username);
    expect(fetchedUser.email).toBe(testUser.email);
  }, 10000);

  /**
   * Test 3: Get User Profile
   * Verifies user profile is auto-created and can be retrieved
   */
  it('should fetch user profile (auto-created on user creation)', async () => {
    expect(testUser).toBeDefined();

    const userProfile = await getUserProfile(testUser.user_id);

    expect(userProfile).toBeDefined();
    expect(userProfile.profile_id).toBeTypeOf('number');
    expect(userProfile.user_id).toBe(testUser.user_id);
    expect(userProfile.topic_mastery).toBeTypeOf('object');
    expect(userProfile.preferred_format).toBeDefined();
    expect(userProfile.learning_pace).toBeTypeOf('string');
    expect(['slow', 'medium', 'fast']).toContain(userProfile.learning_pace);
    expect(userProfile.current_difficulty).toBeTypeOf('string');
    expect(['easy', 'normal', 'hard', 'challenge']).toContain(userProfile.current_difficulty);
  }, 10000);

  /**
   * Test 4: Fetch Available Content Topics
   * Verifies contentService can list all topics
   */
  it('should fetch available topics', async () => {
    const topics = await getTopics();

    expect(topics).toBeDefined();
    expect(Array.isArray(topics)).toBe(true);
    expect(topics.length).toBeGreaterThan(0);
    expect(typeof topics[0]).toBe('string');
  }, 10000);

  /**
   * Test 5: Fetch Content with Filters
   * Verifies contentService can retrieve content with optional filters
   */
  it('should fetch content with filters and pagination', async () => {
    const result = await getContent({
      limit: 5,
      offset: 0,
    });

    expect(result).toBeDefined();
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.pagination).toBeDefined();
    expect(result.pagination.total).toBeTypeOf('number');
    expect(result.pagination.limit).toBe(5);
    expect(result.pagination.offset).toBe(0);

    // Verify content item structure
    if (result.items.length > 0) {
      const item = result.items[0];
      expect(item.content_id).toBeTypeOf('number');
      expect(item.title).toBeTypeOf('string');
      expect(item.topic).toBeTypeOf('string');
      expect(item.difficulty_level).toBeDefined();
      expect(item.format).toBeDefined();
      expect(item.content_type).toBeDefined();
    }
  }, 10000);

  /**
   * Test 6: Fetch Content by ID
   * Verifies contentService can retrieve a specific content item
   */
  it('should fetch content by ID', async () => {
    // First get a content item
    const result = await getContent({ limit: 1 });
    expect(result.items.length).toBeGreaterThan(0);

    const contentId = result.items[0].content_id;
    const content = await getContentById(contentId);

    expect(content).toBeDefined();
    expect(content.content_id).toBe(contentId);
    expect(content.title).toBeTypeOf('string');
    expect(content.content_data).toBeDefined();
  }, 10000);

  /**
   * Test 7: Get Random Content
   * Verifies contentService can retrieve random content
   */
  it('should get random content', async () => {
    const content = await getRandomContent();

    expect(content).toBeDefined();
    expect(content.content_id).toBeTypeOf('number');
    expect(content.title).toBeTypeOf('string');
  }, 10000);

  /**
   * Test 8: Create Dialog
   * Verifies dialogService can create a new learning dialog
   */
  it('should create a dialog', async () => {
    expect(testUser).toBeDefined();

    testDialog = await createDialog(testUser.user_id, 'educational', 'Test Topic');

    expect(testDialog).toBeDefined();
    expect(testDialog.dialog_id).toBeTypeOf('number');
    expect(testDialog.user_id).toBe(testUser.user_id);
    expect(testDialog.dialog_type).toBe('educational');
    expect(testDialog.topic).toBe('Test Topic');
    expect(testDialog.started_at).toBeTypeOf('string');
  }, 10000);

  /**
   * Test 9: Get Dialog by ID
   * Verifies dialogService can retrieve dialog details
   */
  it('should fetch dialog by ID', async () => {
    expect(testDialog).toBeDefined();

    const fetchedDialog = await getDialog(testDialog.dialog_id);

    expect(fetchedDialog).toBeDefined();
    expect(fetchedDialog.dialog_id).toBe(testDialog.dialog_id);
    expect(fetchedDialog.user_id).toBe(testUser.user_id);
    expect(fetchedDialog.topic).toBe(testDialog.topic);
  }, 10000);

  /**
   * Test 10: Get Recommendation
   * Verifies recommendationService can generate next content recommendation
   */
  it('should get a recommendation for the user', async () => {
    expect(testUser).toBeDefined();
    expect(testDialog).toBeDefined();

    const recommendation = await getRecommendation(testUser.user_id, testDialog.dialog_id);

    expect(recommendation).toBeDefined();
    expect(recommendation.content).toBeDefined();
    expect(recommendation.content.content_id).toBeTypeOf('number');
    expect(recommendation.reasoning).toBeTypeOf('string');
    expect(recommendation.confidence).toBeTypeOf('number');
    expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
    expect(recommendation.confidence).toBeLessThanOrEqual(1);
    expect(recommendation.strategy_used).toBeTypeOf('string');
  }, 10000);

  /**
   * Test 11: Send Message in Dialog
   * Verifies dialogService can send user messages
   */
  it('should send a message in the dialog', async () => {
    expect(testDialog).toBeDefined();

    const message = await sendMessage(
      testDialog.dialog_id,
      'This is a test message',
      'user',
      false
    );

    expect(message).toBeDefined();
    expect(message.message_id).toBeTypeOf('number');
    expect(message.dialog_id).toBe(testDialog.dialog_id);
    expect(message.content).toBe('This is a test message');
    expect(message.sender_type).toBe('user');
    expect(message.timestamp).toBeTypeOf('string');
  }, 10000);

  /**
   * Test 12: Get Dialog Messages
   * Verifies dialogService can retrieve all messages in a dialog
   */
  it('should fetch all messages in a dialog', async () => {
    expect(testDialog).toBeDefined();

    const messages = await getDialogMessages(testDialog.dialog_id);

    expect(messages).toBeDefined();
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);

    // Verify message structure
    const message = messages[0];
    expect(message.message_id).toBeTypeOf('number');
    expect(message.dialog_id).toBe(testDialog.dialog_id);
    expect(message.sender_type).toBeDefined();
    expect(message.content).toBeTypeOf('string');
  }, 10000);

  /**
   * Test 13: Get Recommendation History
   * Verifies recommendationService can retrieve user's recommendation history
   */
  it('should fetch recommendation history', async () => {
    expect(testUser).toBeDefined();

    const response = await getRecommendationHistory(testUser.user_id, 5);

    expect(response).toBeDefined();
    expect(response).toHaveProperty('user_id');
    expect(response.user_id).toBe(testUser.user_id);
    expect(response).toHaveProperty('history');
    expect(Array.isArray(response.history)).toBe(true);
    expect(response).toHaveProperty('total_count');
    expect(response.total_count).toBeTypeOf('number');
    // History might be empty for new users, so we just check structure is correct
  }, 10000);
});

/**
 * Integration Tests - Error Handling
 *
 * Verifies that services handle errors appropriately
 */
describe('Integration Tests - Error Handling', () => {

  /**
   * Test: Handle Invalid User ID
   */
  it('should handle non-existent user gracefully', async () => {
    const invalidUserId = 999999999;

    await expect(getUser(invalidUserId)).rejects.toThrow();
  }, 10000);

  /**
   * Test: Handle Invalid Dialog ID
   */
  it('should handle non-existent dialog gracefully', async () => {
    const invalidDialogId = 999999999;

    await expect(getDialog(invalidDialogId)).rejects.toThrow();
  }, 10000);

  /**
   * Test: Handle Invalid Content ID
   */
  it('should handle non-existent content gracefully', async () => {
    const invalidContentId = 999999999;

    await expect(getContentById(invalidContentId)).rejects.toThrow();
  }, 10000);
});

/**
 * Integration Tests - Data Consistency
 *
 * Verifies that data remains consistent across multiple operations
 */
describe('Integration Tests - Data Consistency', () => {

  /**
   * Test: Verify TypeScript types match backend schemas
   */
  it('should have consistent data types across services', async () => {
    const userData = generateTestData.user();
    const user = await createUser(userData);

    // Verify all required User fields exist
    expect(user).toHaveProperty('user_id');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('created_at');
    expect(user).toHaveProperty('updated_at');

    // Create dialog and verify structure
    const dialog = await createDialog(user.user_id, 'educational', 'Data Consistency Test');

    expect(dialog).toHaveProperty('dialog_id');
    expect(dialog).toHaveProperty('user_id');
    expect(dialog).toHaveProperty('dialog_type');
    expect(dialog).toHaveProperty('topic');
    expect(dialog).toHaveProperty('started_at');
  }, 15000);
});
