# Frontend Integration Tests

## Overview

This directory contains integration tests for the Week 4 frontend React application. The tests verify end-to-end communication between frontend services and the backend API.

## Test Structure

### Files

- **`setup.ts`** - Global test configuration and setup
  - Configures jsdom environment
  - Sets up @testing-library/jest-dom matchers
  - Configures environment variables

- **`testUtils.tsx`** - Reusable test utilities
  - `createTestQueryClient()` - Creates isolated QueryClient for tests
  - `renderWithProviders()` - Renders components with necessary providers (QueryClient, Router)
  - `generateTestData` - Generates unique test data for users, dialogs, messages
  - Re-exports React Testing Library utilities

- **`integration.test.ts`** - Main integration test suite
  - Tests complete user flow from creation to learning interactions
  - Tests error handling for invalid requests
  - Tests data consistency across services

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once and exit
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

### Complete Flow Tests (13 tests)
1. ✅ Create user via userService
2. ✅ Fetch user by ID
3. ✅ Fetch user profile (auto-created)
4. ✅ Fetch available content topics
5. ✅ Fetch content with filters and pagination
6. ✅ Fetch content by ID
7. ✅ Get random content
8. ✅ Create dialog
9. ✅ Fetch dialog by ID
10. ✅ Get recommendation for user
11. ✅ Send message in dialog
12. ✅ Fetch all messages in dialog
13. ✅ Fetch recommendation history

### Error Handling Tests (3 tests)
1. ✅ Handle non-existent user gracefully
2. ✅ Handle non-existent dialog gracefully
3. ✅ Handle non-existent content gracefully

### Data Consistency Tests (1 test)
1. ✅ Verify TypeScript types match backend schemas

## Prerequisites

- Backend server must be running at `http://localhost:8000`
- Database must be populated with content items
- All Week 4 Part A tasks must be completed

## Test Configuration

Tests are configured in `vite.config.ts`:

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  css: true,
}
```

## Key Verifications

Each test verifies:
- ✅ API calls succeed with correct status codes
- ✅ Response data matches TypeScript interface definitions
- ✅ Data structure matches backend Pydantic schemas
- ✅ Services handle errors appropriately
- ✅ Services work together for complete user flows

## Example Test

```typescript
it('should create a new user via userService', async () => {
  const userData = generateTestData.user();
  const user = await createUser(userData);

  expect(user).toBeDefined();
  expect(user.user_id).toBeTypeOf('number');
  expect(user.username).toBe(userData.username);
  expect(user.email).toBe(userData.email);
});
```

## Writing New Tests

When adding new tests:
1. Use `generateTestData` helpers to create unique test data
2. Use appropriate timeouts for API calls (default: 10000ms)
3. Verify both success and error scenarios
4. Check that TypeScript types match backend schemas
5. Clean up test data if necessary (users are auto-created with unique IDs)

## Troubleshooting

**Backend not running:**
```bash
cd backend && uvicorn app.main:app --reload
```

**Tests timeout:**
- Increase timeout in test definition: `it('test name', async () => {...}, 15000)`
- Check backend is responding: `curl http://localhost:8000/api/v1/content/topics`

**Type errors:**
- Verify TypeScript types in `src/types/` match backend schemas in `@backend/app/schemas/`
- Check Swagger UI for exact schema: `http://localhost:8000/docs`

## Notes

- Tests create real data in the database (unique users, dialogs, messages)
- Tests run sequentially to maintain data dependencies
- Each test suite creates fresh test data
- Backend CORS is configured to allow requests from test environment
