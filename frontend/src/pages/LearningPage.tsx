/**
 * LearningPage Component
 *
 * Main learning interface orchestrating the complete adaptive learning experience.
 * Manages user session initialization, content recommendations, dialog interactions,
 * and progress tracking.
 *
 * Workflow:
 * 1. Initialize session (create user + dialog if needed, or restore from sessionStorage)
 * 2. Get initial content recommendation
 * 3. Display content and chat interface
 * 4. Handle user interactions (answers, hints, next content)
 * 5. Update metrics and get next recommendations
 * 6. Allow session end
 *
 * References:
 * - Hooks: @frontend/src/hooks/useDialog.ts, useContent.ts, useRecommendation.ts
 * - Components: @frontend/src/components/dialogs/, @frontend/src/components/content/
 * - Services: @frontend/src/services/userService.ts, dialogService.ts
 * - Utils: @frontend/src/utils/sessionStorage.ts
 *
 * @module pages/LearningPage
 */

import { useState, useEffect, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight } from '../styles/designTokens';
import { useDialog } from '../hooks/useDialog';
import { useContent } from '../hooks/useContent';
import { useRecommendation } from '../hooks/useRecommendation';
import { createUser } from '../services/userService';
import { sendMessage } from '../services/dialogService';
import DialogHeader from '../components/dialogs/DialogHeader';
import ChatInterface from '../components/dialogs/ChatInterface';
import { ContentViewer } from '../components/content/ContentViewer';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import * as sessionStorageUtil from '../utils/sessionStorage';

/**
 * LearningPage Component
 *
 * Orchestrates the complete learning flow from initialization to session end.
 */
export default function LearningPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  // Custom hooks
  const { dialog, createDialog, endDialog, getDialog, loading: dialogLoading } = useDialog();
  const { content, loadContent, loading: contentLoading } = useContent();
  const {
    recommendation,
    getRecommendation,
    loading: recommendationLoading,
  } = useRecommendation();

  // Page-level state
  const [userId, setUserId] = useState<number | null>(null);
  const [currentContentId, setCurrentContentId] = useState<number | null>(null);
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Initialization flow
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsInitializing(true);
        setInitializationError(null);

        // Step 1: Check sessionStorage for existing userId and dialogId
        let storedUserId = sessionStorageUtil.getUserId();
        let storedDialogId = sessionStorageUtil.getDialogId();

        // Step 2: Use static user from database
        if (!storedUserId) {
          storedUserId = 1;
          sessionStorageUtil.saveUserId(storedUserId);
          console.log('[LearningPage] Using static user:', storedUserId);
        } else {
          console.log('[LearningPage] Found stored userId:', storedUserId);
        }

        setUserId(storedUserId);

        // Step 3: Create or retrieve dialog
        if (!storedDialogId) {
          console.log('[LearningPage] No stored dialogId found. Creating new dialog...');

          // Create new dialog
          const newDialog = await createDialog(storedUserId, 'educational', 'General Learning');
          storedDialogId = newDialog.dialog_id;

          // Store session start time
          sessionStorageUtil.saveSessionStart(new Date().toISOString());

          console.log('[LearningPage] Dialog created:', storedDialogId);
        } else {
          console.log('[LearningPage] Found stored dialogId:', storedDialogId);

          // Load existing dialog
          getDialog(storedDialogId);
        }

        setSessionActive(true);

        // Step 4: Get initial recommendation
        console.log('[LearningPage] Getting initial recommendation...');
        const initialRecommendation = await getRecommendation(storedUserId, storedDialogId);

        console.log('[LearningPage] Recommendation received:', initialRecommendation);

        // Step 5: Load initial content
        if (initialRecommendation.content.content_id) {
          const contentId = initialRecommendation.content.content_id;
          setCurrentContentId(contentId);
          loadContent(contentId);
          console.log('[LearningPage] Loading content:', contentId);
        } else {
          throw new Error('Recommendation did not include a content ID');
        }

        setIsInitializing(false);
      } catch (error) {
        console.error('[LearningPage] Initialization failed:', error);
        setInitializationError(
          error instanceof Error ? error : new Error('Failed to initialize session')
        );
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, []); // Run only on mount

  // Event Handlers

  /**
   * Handle answer submission
   *
   * Called when user submits an answer to an exercise or quiz.
   * Creates a message in the dialog, which triggers backend metrics computation.
   */
  const handleSubmitAnswer = async (answer: string): Promise<void> => {
    try {
      if (!dialog || !content) {
        throw new Error('No active dialog or content');
      }

      console.log('[LearningPage] Submitting answer:', answer);

      // TODO: Move correctness evaluation to backend
      const isCorrect = checkAnswerCorrectness(answer, content);

      // TODO: Track response time from content display to submission
      const responseTimeSeconds = 0; // Placeholder - implement timer in ContentViewer

      const extraData = {
        message_type: 'content_answer',
        content_meta: {
          content_id: content.content_id,
          content_type: content.content_type,
          topic: content.topic,
          difficulty_level: content.difficulty_level,
          format: content.format,
        },
        answer_meta: {
          is_correct: isCorrect,
          response_time_seconds: responseTimeSeconds,
          hints_used: 0, // TODO: Pass from ContentViewer
        },
      };

      // Send as regular message with content metadata
      await sendMessage(
        dialog.dialog_id,
        answer,
        'user',
        false,
        extraData
      );

      // Note: Profile updates happen automatically on backend via metrics workflow
      // If using React Query, invalidate profile cache here:
      // queryClient.invalidateQueries(['userProfile', userId])

      console.log('[LearningPage] Answer submitted successfully');
    } catch (error) {
      console.error('[LearningPage] Failed to submit answer:', error);
      throw error;
    }
  };

  // TODO: Move to backend - temporary frontend correctness check
  const checkAnswerCorrectness = (answer: string, content: any): boolean => {
    let correctValue: string | string[] | undefined;

    if (content.content_type === 'quiz' && content.content_data?.correct_answer) {
      correctValue = content.content_data.correct_answer;
    } else if (content.content_type === 'exercise') {
      if (content.content_data?.solution) {
        correctValue = content.content_data.solution;
      } else if (content.reference_answer) {
        const ref = content.reference_answer;
        if (typeof ref === 'string') {
          correctValue = ref;
        } else if (typeof ref === 'object' && ref !== null) {
          correctValue = ref.solution || ref.answer || ref.correct_answer || ref.value;
        }
      }
    }

    if (!correctValue) return false;

    if (typeof correctValue === 'string') {
      return answer.trim().toLowerCase() === correctValue.trim().toLowerCase();
    }

    if (Array.isArray(correctValue)) {
      const userAnswers = answer.split('|').map((a) => a.trim().toLowerCase());
      const correctAnswers = (correctValue as string[]).map((a: string) => a.trim().toLowerCase());
      return (
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((a) => correctAnswers.includes(a))
      );
    }

    return false;
  };

  /**
   * Handle request for next content
   *
   * Called when user clicks "Continue" or completes current content.
   * Gets a new recommendation and loads the next content item.
   */
  const handleRequestNextContent = async (): Promise<void> => {
    try {
      if (!userId) {
        throw new Error('No user ID available');
      }

      console.log('[LearningPage] Requesting next content...');

      // Get new recommendation
      const nextRecommendation = await getRecommendation(
        userId,
        dialog?.dialog_id
      );

      console.log('[LearningPage] Next recommendation received:', nextRecommendation);

      // Load new content
      if (nextRecommendation.content.content_id) {
        const contentId = nextRecommendation.content.content_id;
        setCurrentContentId(contentId);
        loadContent(contentId);

        console.log('[LearningPage] Loading next content:', contentId);

        // Optionally, create a system message announcing the new content
        // This would be handled by ChatInterface if we send a system message
      } else {
        throw new Error('Next recommendation did not include a content ID');
      }
    } catch (error) {
      console.error('[LearningPage] Failed to get next content:', error);
      throw error;
    }
  };

  /**
   * Handle session end
   *
   * Called when user clicks "End Session" button.
   * Ends the dialog, clears sessionStorage, and navigates to home.
   */
  const handleEndSession = async (): Promise<void> => {
    try {
      if (!dialog) {
        console.warn('[LearningPage] No dialog to end');
        return;
      }

      // Optional: Confirm with user
      const confirmed = window.confirm(
        'Are you sure you want to end this learning session?'
      );

      if (!confirmed) {
        return;
      }

      console.log('[LearningPage] Ending session...');

      // End dialog
      await endDialog(dialog.dialog_id);

      // Clear sessionStorage
      sessionStorageUtil.clearSession();

      console.log('[LearningPage] Session ended successfully');

      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('[LearningPage] Failed to end session:', error);
      throw error;
    }
  };

  /**
   * Handle retry after initialization error
   */
  const handleRetryInitialization = (): void => {
    // Clear session storage and reload page
    sessionStorageUtil.clearSession();
    window.location.reload();
  };

  // Styles

  const pageContainerStyle: CSSProperties = {
    padding: spacing['3xl'],
    backgroundColor: colors.bgPrimary,
    minHeight: '100vh',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const layoutContainerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2fr 3fr',
    gap: spacing['2xl'],
    marginTop: spacing['2xl'],
  };

  const chatColumnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '600px',
    maxHeight: 'calc(100vh - 300px)',
  };

  const contentColumnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  const emptyStateStyle: CSSProperties = {
    textAlign: 'center',
    padding: spacing['3xl'],
    backgroundColor: colors.bgSecondary,
    borderRadius: '16px',
    color: colors.textMuted,
  };

  // Responsive style adjustments
  const responsiveStyle = `
    /* Mobile: Stack layout, content first */
    @media (max-width: 768px) {
      .learning-layout {
        grid-template-columns: 1fr !important;
        gap: 1rem !important;
      }
      .content-column {
        order: -1;
      }
      .chat-column {
        min-height: 400px !important;
        max-height: 500px !important;
      }
    }

    /* Tablet: Narrower columns */
    @media (min-width: 769px) and (max-width: 1024px) {
      .learning-layout {
        grid-template-columns: 1fr 1fr !important;
      }
    }

    /* Desktop: Default two-column layout */
    @media (min-width: 1025px) {
      .learning-layout {
        grid-template-columns: 2fr 3fr !important;
      }
    }
  `;

  // Inject responsive styles
  useEffect(() => {
    const styleId = 'learning-page-responsive';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = responsiveStyle;
      document.head.appendChild(style);
    }
  }, []);

  // Render States

  // Full-page loading during initialization
  if (isInitializing) {
    return (
      <div style={pageContainerStyle}>
        <Loading
          fullscreen
          message="Initializing your learning session..."
          size="large"
        />
      </div>
    );
  }

  // Initialization error
  if (initializationError) {
    return (
      <div style={pageContainerStyle}>
        <ErrorMessage
          message="Failed to initialize learning session"
          details={initializationError.message}
          onRetry={handleRetryInitialization}
        />
      </div>
    );
  }

  // No dialog loaded
  if (!dialog) {
    return (
      <div style={pageContainerStyle}>
        <div style={emptyStateStyle}>
          <p style={{ fontSize: fontSize.xl, marginBottom: spacing.lg }}>⏳</p>
          <p style={{ fontSize: fontSize.lg, fontWeight: fontWeight.medium }}>
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  // Main Layout
  return (
    <div style={pageContainerStyle}>
      {/* Dialog Header */}
      <DialogHeader
        dialog={dialog}
        onEndSession={handleEndSession}
        loading={dialogLoading}
      />

      {/* Two-Column Layout */}
      <div style={layoutContainerStyle} className="learning-layout">
        {/* Left Column: Chat Interface */}
        <div style={chatColumnStyle} className="chat-column">
          <ChatInterface
            dialogId={dialog.dialog_id}
            currentContentId={currentContentId || undefined}
            onMessageSent={() => {
              console.log('[LearningPage] Message sent');
            }}
          />
        </div>

        {/* Right Column: Content Viewer */}
        <div style={contentColumnStyle} className="content-column">
          <ContentViewer
            content={content}
            onSubmitAnswer={handleSubmitAnswer}
            onRequestNextContent={handleRequestNextContent}
            loading={contentLoading || recommendationLoading}
          />
        </div>
      </div>
    </div>
  );
}
