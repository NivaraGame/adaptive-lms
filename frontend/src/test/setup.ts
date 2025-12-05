import '@testing-library/jest-dom';
import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case (unmount React trees, etc.)
afterEach(() => {
  cleanup();
});

// Set up environment variables for testing
beforeAll(() => {
  // Set API base URL to localhost backend
  process.env.VITE_API_BASE_URL = 'http://localhost:8000';
});
