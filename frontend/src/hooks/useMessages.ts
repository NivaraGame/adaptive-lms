/**
 * useMessages Hook
 *
 * Custom React Query hook for managing messages within dialogs.
 * Provides functions to fetch message history and send new messages
 * with optimistic updates for better UX.
 *
 * References:
 * - Dialog service: @frontend/src/services/dialogService.ts
 * - Message types: @frontend/src/types/dialog.ts
 * - Backend routes: @backend/app/api/routes/dialogs.py, @backend/app/api/routes/messages.py
 *
 * @example
 * ```typescript
 * const { messages, sendMessage, loading, error } = useMessages(dialogId);
 *
 * // Send a user message
 * await sendMessage('The answer is 42', false);
 *
 * // Send a question
 * await sendMessage('What is 2+2?', true);
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Message } from '../types/dialog';
import * as dialogService from '../services/dialogService';

/**
 * Return type for useMessages hook
 */
export interface UseMessagesReturn {
  messages: Message[];
  sendMessage: (content: string, isQuestion?: boolean, extraData?: any) => Promise<Message>;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for managing messages within a dialog
 *
 * Fetches message history and provides optimistic updates when sending new messages.
 * Auto-refetches every 30 seconds to retrieve system responses.
 *
 * @param dialogId - The ID of the dialog to fetch messages for
 * @returns {UseMessagesReturn} Messages array and functions
 *
 * @example
 * ```typescript
 * const { messages, sendMessage, loading } = useMessages(42);
 *
 * // Display messages
 * messages.forEach(msg => console.log(msg.content));
 *
 * // Send a new message
 * await sendMessage('Hello!');
 * ```
 */
export function useMessages(dialogId: number): UseMessagesReturn {
  const queryClient = useQueryClient();

  // Query for fetching dialog messages
  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Message[], Error>({
    queryKey: ['messages', dialogId],
    queryFn: async () => {
      const fetchedMessages = await dialogService.getDialogMessages(dialogId);
      return fetchedMessages;
    },
    enabled: !!dialogId, // Only fetch when dialogId exists
    staleTime: 3 * 1000, // 3 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 3 * 1000, // Auto-refetch every 3 seconds for new system messages
  });

  // Mutation for sending a new message
  const sendMessageMutation = useMutation<
    Message,
    Error,
    { content: string; isQuestion: boolean; extraData?: any }
  >({
    mutationFn: async ({ content, isQuestion, extraData }) => {
      const newMessage = await dialogService.sendMessage(
        dialogId,
        content,
        'user', // Always 'user' sender type from frontend
        isQuestion,
        extraData || {}
      );
      return newMessage;
    },
    onMutate: async ({ content, isQuestion }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages', dialogId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>(['messages', dialogId]);

      // Optimistically update to the new value with a temporary message
      const optimisticMessage: Message = {
        message_id: Date.now(), // Temporary ID (will be replaced by server ID)
        dialog_id: dialogId,
        sender_type: 'user',
        content,
        is_question: isQuestion,
        timestamp: new Date().toISOString(),
        extra_data: {},
      };

      queryClient.setQueryData<Message[]>(['messages', dialogId], (old = []) => [
        ...old,
        optimisticMessage,
      ]);

      // Return context with previous messages for potential rollback
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', dialogId], context.previousMessages);
      }
    },
    onSuccess: (newMessage) => {
      // Invalidate and refetch messages to get the real message from server
      // This replaces the optimistic message with the actual one
      queryClient.invalidateQueries({ queryKey: ['messages', dialogId] });
    },
  });

  // Wrapper function for sendMessage mutation
  const sendMessage = async (
    content: string,
    isQuestion: boolean = false,
    extraData?: any
  ): Promise<Message> => {
    const result = await sendMessageMutation.mutateAsync({
      content,
      isQuestion,
      extraData,
    });
    return result;
  };

  return {
    messages,
    sendMessage,
    loading: isLoading || sendMessageMutation.isPending,
    error: (error || sendMessageMutation.error) as Error | null,
    refetch,
  };
}
