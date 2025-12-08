/**
 * ErrorMessage Component Usage Examples
 *
 * This file demonstrates different error scenarios and how to use
 * the enhanced ErrorMessage component with various error types.
 */

import { ErrorMessage } from '../ErrorMessage';

/**
 * Example 1: Generic Error with Retry
 * Use for general errors that can be retried
 */
export function GenericErrorExample() {
  return (
    <ErrorMessage
      message="Failed to load content"
      details="Network request timed out"
      onRetry={() => {
        console.log('Retrying...');
        // Implement retry logic
      }}
      onDismiss={() => console.log('Error dismissed')}
    />
  );
}

/**
 * Example 2: Session Expired Error
 * Use when user session has expired (404 on dialog)
 */
export function SessionExpiredExample() {
  return (
    <ErrorMessage
      type="session-expired"
      message="Your session has expired"
      onStartNewSession={() => {
        console.log('Creating new session...');
        // Clear sessionStorage and create new dialog
      }}
    />
  );
}

/**
 * Example 3: Network Error with Retry Count
 * Use for network/connection errors with exponential backoff
 */
export function NetworkErrorExample() {
  const retryAttempt = 2;

  return (
    <ErrorMessage
      type="network"
      message="Connection failed"
      details="Unable to reach the server"
      retryCount={retryAttempt}
      onRetry={() => {
        console.log(`Retry attempt ${retryAttempt + 1}`);
        // Implement retry with exponential backoff
      }}
    />
  );
}

/**
 * Example 4: Validation Error
 * Use for form validation or input errors
 */
export function ValidationErrorExample() {
  return (
    <ErrorMessage
      type="validation"
      message="Invalid input"
      details="Answer must be at least 10 characters"
      onRetry={() => {
        console.log('User will correct input');
        // Clear error when user edits input
      }}
    />
  );
}

/**
 * Example 5: Critical Error with Redirect
 * Use for severe errors that require navigation to home
 */
export function CriticalErrorExample() {
  return (
    <ErrorMessage
      type="critical"
      message="A critical error occurred"
      details="The application encountered an unexpected error"
      onGoToHome={() => {
        console.log('Navigating to home...');
        // Navigate to home page
      }}
    />
  );
}

/**
 * Example 6: API 500 Error
 * Use for server errors
 */
export function APIErrorExample() {
  return (
    <ErrorMessage
      type="generic"
      message="Server Error (500)"
      details="Internal server error. Please try again later."
      onRetry={() => {
        console.log('Retrying API call...');
      }}
    />
  );
}

/**
 * Example 7: Network Error with Progressive Retry
 * Demonstrates exponential backoff pattern
 */
export function ProgressiveRetryExample({ attemptCount }: { attemptCount: number }) {
  return (
    <ErrorMessage
      type="network"
      message="Connection failed"
      retryCount={attemptCount}
      onRetry={() => {
        // Calculate exponential backoff: 1s, 2s, 4s, 8s, etc.
        const backoffMs = Math.min(1000 * Math.pow(2, attemptCount), 30000);
        console.log(`Will retry after ${backoffMs}ms`);

        setTimeout(() => {
          console.log(`Retrying (attempt ${attemptCount + 1})...`);
          // Retry logic here
        }, backoffMs);
      }}
    />
  );
}
