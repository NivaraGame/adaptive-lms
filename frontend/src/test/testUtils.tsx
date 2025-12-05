import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a fresh QueryClient for each test to avoid state pollution
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests
        gcTime: 0, // Don't cache in tests
      },
    },
  });
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: { queryClient?: QueryClient } & Omit<RenderOptions, 'wrapper'> = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Wait for async operations to complete
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate unique test data
 */
export const generateTestData = {
  user: (overrides?: Partial<{ username: string; email: string; password: string }>) => ({
    username: `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    ...overrides,
  }),
  dialog: (userId: number, overrides?: Partial<{ dialog_type: string; topic: string }>) => ({
    user_id: userId,
    dialog_type: 'educational' as const,
    topic: 'Test Topic',
    ...overrides,
  }),
  message: (dialogId: number, content: string, overrides?: Partial<{ sender_type: string; is_question: boolean }>) => ({
    dialog_id: dialogId,
    sender_type: 'user' as const,
    content,
    is_question: false,
    ...overrides,
  }),
};

/**
 * Re-export everything from React Testing Library
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
