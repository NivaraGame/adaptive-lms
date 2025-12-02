/**
 * Dialog-related TypeScript types
 * Maps to backend schemas: @backend/app/schemas/dialog.py and @backend/app/schemas/message.py
 */

/**
 * Dialog type enumeration
 * @backend/app/schemas/dialog.py:13-18
 */
export type DialogType = 'educational' | 'test' | 'assessment' | 'reflective';

/**
 * Dialog interface matching backend DialogResponse schema
 * @backend/app/schemas/dialog.py:DialogResponse
 */
export interface Dialog {
  dialog_id: number;
  user_id: number;
  dialog_type: DialogType;
  topic: string | null;
  started_at: string;
  ended_at: string | null;
  extra_data: Record<string, any>;
}

/**
 * Sender type enumeration
 * @backend/app/schemas/message.py:25-30
 */
export type SenderType = 'user' | 'system';

/**
 * Message interface matching backend MessageResponse schema
 * @backend/app/schemas/message.py:MessageResponse
 */
export interface Message {
  message_id: number;
  dialog_id: number;
  sender_type: SenderType;
  content: string;
  is_question: boolean;
  timestamp: string;
  extra_data: Record<string, any>;
}
