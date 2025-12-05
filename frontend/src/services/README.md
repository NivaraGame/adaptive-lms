# Services Layer with React Query

This directory contains the service layer for API communication, designed to work seamlessly with React Query.

## Architecture

### Query Client Configuration

The QueryClient is configured in `src/main.tsx` with the following defaults:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes - data is fresh
      gcTime: 10 * 60 * 1000,       // 10 minutes - cache retention (formerly cacheTime)
      retry: 1,                      // Retry failed requests once
      refetchOnWindowFocus: false,   // Don't refetch when window regains focus
    },
  },
})
```

### Provider Hierarchy

The app is wrapped in providers in this order (from `src/main.tsx`):

1. `QueryClientProvider` - React Query data fetching and caching
2. `ThemeProvider` - Theme context for light/dark mode
3. `BrowserRouter` - React Router for navigation (in `App.tsx`)

## Using Services with React Query

### Basic Query Example

```typescript
import { useQuery } from '@tanstack/react-query';
import { getContent } from '../services/contentService';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['content', { limit: 10 }],
    queryFn: () => getContent({ limit: 10 }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### Query Keys Convention

Use descriptive, hierarchical query keys:

- `['users', userId]` - Single user
- `['dialogs', userId]` - User's dialogs
- `['content']` - All content
- `['content', { topic: 'math' }]` - Filtered content
- `['recommendations', userId]` - User recommendations

## Available Services

### contentService.ts
- `getContent(params?)` - Fetch content with optional filters
- `getContentById(id)` - Fetch single content item
- `getRandomContent(filters?)` - Get random content
- `getTopics()` - List available topics
- `getNextContent(contentId, userId)` - Get next content in sequence

### dialogService.ts
- `createDialog(userId)` - Create new dialog
- `getDialog(dialogId)` - Get dialog details
- `getDialogMessages(dialogId)` - Get messages for dialog
- `sendMessage(dialogId, content, ...)` - Send message in dialog

### userService.ts
- `createUser(userData)` - Create new user
- `getUser(userId)` - Get user details
- `getUserProfile(userId)` - Get user profile with mastery data

### recommendationService.ts
- `getRecommendation(userId, dialogId?)` - Get next content recommendation
- `getRecommendationHistory(userId, limit?)` - Get recommendation history

## Caching Strategy

### Automatic Caching
React Query automatically caches all query results for 10 minutes (gcTime). Cached data is considered fresh for 5 minutes (staleTime).

### Manual Cache Invalidation
Use `queryClient.invalidateQueries()` to invalidate cached data:

```typescript
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();

  const handleAction = async () => {
    // Perform action
    await someAction();

    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['content'] });
  };
}
```

### Refetching
Queries can be manually refetched:

```typescript
const { refetch } = useQuery({
  queryKey: ['content'],
  queryFn: getContent,
});

// Later...
refetch();
```

## Error Handling

All services use the centralized API client (`api.ts`) which includes error interceptors. Errors are:

1. Caught by axios interceptors
2. Formatted consistently
3. Logged to console
4. Returned to React Query as errors
5. Accessible via the `error` property from `useQuery`

## Testing

A test component (`QueryTest.tsx`) is available to verify React Query integration. It:

- Fetches content using `useQuery`
- Displays loading and error states
- Shows cached data
- Demonstrates refetching
- Verifies caching behavior

## Best Practices

1. **Always use query keys** - Enables proper caching and invalidation
2. **Handle loading and error states** - Provide good UX
3. **Use TypeScript types** - All services are fully typed
4. **Leverage caching** - Don't over-fetch data
5. **Invalidate strategically** - Update cache after mutations
6. **Use service functions** - Don't make direct axios calls in components

## Resources

- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [API Client Configuration](./api.ts)
- [Backend API Documentation](http://localhost:8000/docs)
