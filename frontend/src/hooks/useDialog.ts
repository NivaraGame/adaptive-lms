/**
 * useDialog Hook
 *
 * Custom React Query hook for managing dialog state and operations.
 * Provides functions to create, retrieve, and end learning dialog sessions.
 *
 * References:
 * - Dialog service: @frontend/src/services/dialogService.ts
 * - Dialog types: @frontend/src/types/dialog.ts
 * - Backend routes: @backend/app/api/routes/dialogs.py
 *
 * @example
 * ```typescript
 * const { dialog, createDialog, endDialog, loading, error } = useDialog();
 *
 * // Create a new dialog
 * await createDialog(userId);
 *
 * // End the current dialog
 * await endDialog(dialogId);
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Dialog, DialogType } from '../types/dialog';
import * as dialogService from '../services/dialogService';

/**
 * Return type for useDialog hook
 */
export interface UseDialogReturn {
  dialog: Dialog | null;
  loading: boolean;
  error: Error | null;
  createDialog: (userId: number, dialogType?: DialogType, topic?: string | null) => Promise<Dialog>;
  endDialog: (dialogId: number) => Promise<Dialog>;
  getDialog: (dialogId: number) => void;
}

/**
 * Custom hook for managing dialog state and operations
 *
 * @returns {UseDialogReturn} Dialog state and functions
 *
 * @example
 * ```typescript
 * const { dialog, createDialog, loading } = useDialog();
 * await createDialog(userId);
 * ```
 */
export function useDialog(): UseDialogReturn {
  const queryClient = useQueryClient();

  // Query for fetching a specific dialog
  // This query is disabled by default and manually triggered via getDialog function
  const {
    data: dialog = null,
    isLoading,
    error,
  } = useQuery<Dialog | null, Error>({
    queryKey: ['dialog'],
    queryFn: () => null,
    enabled: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for creating a new dialog
  const createDialogMutation = useMutation<
    Dialog,
    Error,
    { userId: number; dialogType?: DialogType; topic?: string | null }
  >({
    mutationFn: async ({ userId, dialogType = 'educational', topic }) => {
      const newDialog = await dialogService.createDialog(userId, dialogType, topic);
      return newDialog;
    },
    onSuccess: (newDialog) => {
      // Store dialog_id in sessionStorage for persistence
      sessionStorage.setItem('dialogId', String(newDialog.dialog_id));

      // Update the dialog query cache with the new dialog
      queryClient.setQueryData(['dialog'], newDialog);
      queryClient.setQueryData(['dialog', newDialog.dialog_id], newDialog);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['dialogs'] });
    },
  });

  // Mutation for ending a dialog
  const endDialogMutation = useMutation<Dialog, Error, number>({
    mutationFn: async (dialogId: number) => {
      const endedDialog = await dialogService.endDialog(dialogId);
      return endedDialog;
    },
    onSuccess: (endedDialog) => {
      // Clear sessionStorage
      sessionStorage.removeItem('dialogId');

      // Update cache with ended dialog
      queryClient.setQueryData(['dialog'], endedDialog);
      queryClient.setQueryData(['dialog', endedDialog.dialog_id], endedDialog);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['dialogs'] });
    },
  });

  // Function to manually fetch a dialog by ID
  const getDialog = (dialogId: number) => {
    queryClient.fetchQuery({
      queryKey: ['dialog', dialogId],
      queryFn: async () => {
        const fetchedDialog = await dialogService.getDialog(dialogId);
        // Update the main dialog cache
        queryClient.setQueryData(['dialog'], fetchedDialog);
        return fetchedDialog;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Wrapper function for createDialog mutation
  const createDialog = async (
    userId: number,
    dialogType: DialogType = 'educational',
    topic?: string | null
  ): Promise<Dialog> => {
    const result = await createDialogMutation.mutateAsync({
      userId,
      dialogType,
      topic,
    });
    return result;
  };

  // Wrapper function for endDialog mutation
  const endDialog = async (dialogId: number): Promise<Dialog> => {
    const result = await endDialogMutation.mutateAsync(dialogId);
    return result;
  };

  return {
    dialog,
    loading: isLoading || createDialogMutation.isPending || endDialogMutation.isPending,
    error: (error || createDialogMutation.error || endDialogMutation.error) as Error | null,
    createDialog,
    endDialog,
    getDialog,
  };
}
