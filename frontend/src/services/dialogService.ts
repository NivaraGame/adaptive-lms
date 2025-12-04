/**
 * Dialog Service
 *
 * Handles all dialog-related API operations including:
 * - Creating and retrieving dialogs
 * - Managing messages within dialogs
 * - Ending dialog sessions
 *
 * Backend API Routes Reference:
 * @backend/app/api/routes/dialogs.py
 * @backend/app/api/routes/messages.py
 */

import api from './api';
import type { Dialog, DialogType, Message } from '../types/dialog';

/**
 * Dialog creation request payload
 * @backend/app/schemas/dialog.py:DialogCreate
 */
export interface DialogCreateRequest {
  user_id: number;
  dialog_type: DialogType;
  topic?: string | null;
}

/**
 * Message creation request payload
 * @backend/app/schemas/message.py:MessageCreate
 */
export interface MessageCreateRequest {
  dialog_id: number;
  sender_type: 'user' | 'system';
  content: string;
  is_question?: boolean;
  extra_data?: Record<string, any>;
}

/**
 * Create a new dialog/learning session
 *
 * @param userId - The ID of the user creating the dialog
 * @param dialogType - Type of dialog ('educational' | 'test' | 'assessment' | 'reflective')
 * @param topic - Optional topic for the dialog
 * @returns Promise<Dialog> - The created dialog
 *
 * @backend/app/api/routes/dialogs.py:18-42 (POST /api/v1/dialogs)
 *
 * @example
 * ```typescript
 * const dialog = await createDialog(1, 'educational', 'Python basics');
 * console.log(`Dialog created with ID: ${dialog.dialog_id}`);
 * ```
 */
export async function createDialog(
  userId: number,
  dialogType: DialogType = 'educational',
  topic?: string | null
): Promise<Dialog> {
  const payload: DialogCreateRequest = {
    user_id: userId,
    dialog_type: dialogType,
    topic: topic || null,
  };

  const dialog = await api.post('/api/v1/dialogs', payload);
  return dialog as unknown as Dialog;
}

/**
 * Get a dialog by ID
 *
 * @param dialogId - The ID of the dialog to retrieve
 * @returns Promise<Dialog> - The requested dialog
 * @throws {ApiError} - Throws 404 if dialog not found
 *
 * @backend/app/api/routes/dialogs.py:45-58 (GET /api/v1/dialogs/{dialog_id})
 *
 * @example
 * ```typescript
 * const dialog = await getDialog(42);
 * console.log(`Dialog topic: ${dialog.topic}`);
 * ```
 */
export async function getDialog(dialogId: number): Promise<Dialog> {
  const dialog = await api.get(`/api/v1/dialogs/${dialogId}`);
  return dialog as unknown as Dialog;
}

/**
 * List all dialogs for a specific user
 *
 * @param userId - The ID of the user
 * @param skip - Number of records to skip (default: 0)
 * @param limit - Maximum number of records to return (default: 50)
 * @returns Promise<Dialog[]> - List of user's dialogs
 *
 * @backend/app/api/routes/dialogs.py:61-67 (GET /api/v1/dialogs/user/{user_id})
 *
 * @example
 * ```typescript
 * const dialogs = await listUserDialogs(1, 0, 10);
 * console.log(`User has ${dialogs.length} dialogs`);
 * ```
 */
export async function listUserDialogs(
  userId: number,
  skip: number = 0,
  limit: number = 50
): Promise<Dialog[]> {
  const dialogs = await api.get(`/api/v1/dialogs/user/${userId}`, {
    params: { skip, limit },
  });
  return dialogs as unknown as Dialog[];
}

/**
 * Get all messages in a dialog
 *
 * @param dialogId - The ID of the dialog
 * @returns Promise<Message[]> - List of messages ordered by timestamp
 *
 * @backend/app/api/routes/messages.py:250-256 (GET /api/v1/messages/dialog/{dialog_id})
 *
 * @example
 * ```typescript
 * const messages = await getDialogMessages(42);
 * console.log(`Dialog has ${messages.length} messages`);
 * ```
 */
export async function getDialogMessages(dialogId: number): Promise<Message[]> {
  const messages = await api.get(`/api/v1/messages/dialog/${dialogId}`);
  return messages as unknown as Message[];
}

/**
 * Send a message in a dialog
 *
 * Creates a new message in the specified dialog. For user messages, this automatically
 * triggers the metrics computation workflow in the backend.
 *
 * @param dialogId - The ID of the dialog
 * @param content - The message content
 * @param senderType - Who sent the message ('user' | 'system'), defaults to 'user'
 * @param isQuestion - Whether this message is a question (default: false)
 * @param extraData - Optional additional data to store with the message
 * @returns Promise<Message> - The created message
 *
 * @backend/app/api/routes/dialogs.py:70-126 (POST /api/v1/dialogs/{dialog_id}/messages)
 *
 * @example
 * ```typescript
 * // User sends an answer
 * const message = await sendMessage(42, 'The answer is 42', 'user', false);
 *
 * // System asks a question
 * const question = await sendMessage(42, 'What is 2+2?', 'system', true);
 * ```
 *
 * @note
 * The backend also supports an `include_recommendation` query parameter when using
 * POST /api/v1/messages directly. See @backend/app/api/routes/messages.py:20-23
 */
export async function sendMessage(
  dialogId: number,
  content: string,
  senderType: 'user' | 'system' = 'user',
  isQuestion: boolean = false,
  extraData: Record<string, any> = {}
): Promise<Message> {
  const payload: MessageCreateRequest = {
    dialog_id: dialogId,
    sender_type: senderType,
    content,
    is_question: isQuestion,
    extra_data: extraData,
  };

  const message = await api.post(
    `/api/v1/dialogs/${dialogId}/messages`,
    payload
  );
  return message as unknown as Message;
}

/**
 * End a dialog session
 *
 * Marks the dialog as ended by setting the ended_at timestamp.
 *
 * @param dialogId - The ID of the dialog to end
 * @returns Promise<Dialog> - The updated dialog with ended_at set
 * @throws {ApiError} - Throws 404 if dialog not found
 *
 * @backend/app/api/routes/dialogs.py:129-146 (PATCH /api/v1/dialogs/{dialog_id}/end)
 *
 * @example
 * ```typescript
 * const dialog = await endDialog(42);
 * console.log(`Dialog ended at: ${dialog.ended_at}`);
 * ```
 */
export async function endDialog(dialogId: number): Promise<Dialog> {
  const dialog = await api.patch(`/api/v1/dialogs/${dialogId}/end`);
  return dialog as unknown as Dialog;
}

/**
 * Export all dialog service functions
 */
export default {
  createDialog,
  getDialog,
  listUserDialogs,
  getDialogMessages,
  sendMessage,
  endDialog,
};
