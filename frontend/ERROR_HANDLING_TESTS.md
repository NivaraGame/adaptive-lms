# Error Handling Testing Guide

This document describes how to test the error handling components in the frontend.

## Components Created

### 1. ErrorMessage Component
**Location**: `src/components/ErrorMessage.tsx`

Features:
- Displays error messages with consistent styling
- Supports optional error details (for debugging)
- Optional retry button functionality
- Optional dismiss button functionality
- Theme-aware (light/dark mode)
- Uses design tokens for consistent styling

### 2. Loading Component
**Location**: `src/components/Loading.tsx`

Features:
- Animated spinner with three sizes (small, medium, large)
- Optional loading message
- Fullscreen mode option
- Theme-aware (light/dark mode)
- Accessible with ARIA labels

### 3. ErrorHandlingDemo Component
**Location**: `src/components/ErrorHandlingDemo.tsx`

A reference component demonstrating proper usage of ErrorMessage and Loading components.

## Testing Instructions

### Test 1: Visual Verification (Demo Page)

1. Start the frontend dev server:
   ```bash
   npm run dev
   ```

2. Navigate to the error handling demo page:
   ```
   http://localhost:5173/error-demo
   ```

3. Test loading states:
   - Click "Small Loading" - verify small spinner appears
   - Click "Medium Loading" - verify medium spinner appears
   - Click "Large Loading" - verify large spinner appears

4. Test error states:
   - Click "Simulate Error" - verify error message appears
   - Click "Retry" button - verify error clears and loading starts
   - Click "Simulate Network Error" - verify error appears
   - Click "Dismiss" button - verify error disappears

5. Test theme switching:
   - Toggle between light and dark themes
   - Verify error and loading components adapt to theme colors

### Test 2: API Integration Test

1. Start both backend and frontend:
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn app.main:app --reload

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. Navigate to API Test page (if available on homepage or create route)

3. Verify the updated ApiTest component uses the new ErrorMessage and Loading components

### Test 3: Backend Down Test

1. Start frontend WITHOUT backend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to the error demo or API test page

3. Try to make API calls - verify error messages display properly

4. Expected error messages should include:
   - Clear error message
   - Network error details
   - Retry functionality (if applicable)

### Test 4: Invalid Request Test

1. Start both backend and frontend

2. Navigate to API Test page

3. Click "Test Error Handling" button

4. Verify:
   - Error message displays (404 error for invalid endpoint)
   - Error details show status code and error code
   - Dismiss button works

## Usage Examples

### Basic Loading
```tsx
import { Loading } from './components/Loading';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <Loading message="Loading data..." />;
  }

  return <div>Content loaded!</div>;
}
```

### Error with Retry
```tsx
import { ErrorMessage } from './components/ErrorMessage';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          setError(null);
          fetchData();
        }}
      />
    );
  }

  return <div>Content</div>;
}
```

### With React Query
```tsx
import { useQuery } from '@tanstack/react-query';
import { Loading } from './components/Loading';
import { ErrorMessage } from './components/ErrorMessage';
import { getContent } from './services/contentService';

function ContentList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['content'],
    queryFn: getContent
  });

  if (isLoading) return <Loading message="Loading content..." />;

  if (error) return (
    <ErrorMessage
      message="Failed to load content"
      details={error.message}
      onRetry={() => refetch()}
    />
  );

  return (
    <div>
      {data?.items.map(item => (
        <div key={item.content_id}>{item.title}</div>
      ))}
    </div>
  );
}
```

## Design Specifications

Both components follow the project's design system:

- **Colors**: Use theme-aware colors from `designTokens.ts`
- **Spacing**: Use spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
- **Typography**: Use fontSize and fontWeight from design tokens
- **Transitions**: Use standard transition timing
- **Accessibility**: Proper ARIA labels and roles

### ErrorMessage Styling
- Background: `colors.errorLight`
- Border: `colors.errorBorder`
- Icon color: `colors.error`
- Border radius: `borderRadius.lg` (8px)
- Button colors: `colors.error` with hover states

### Loading Styling
- Spinner border: `colors.border`
- Spinner active border: `colors.primary`
- Message color: `colors.textSecondary`
- Smooth rotation animation (0.8s linear)

## Component Props

### ErrorMessage Props
```typescript
interface ErrorMessageProps {
  message: string;           // Required: The error message
  details?: string;          // Optional: Additional error details
  onRetry?: () => void;      // Optional: Retry callback
  onDismiss?: () => void;    // Optional: Dismiss callback
}
```

### Loading Props
```typescript
interface LoadingProps {
  message?: string;                          // Optional: Loading message
  size?: 'small' | 'medium' | 'large';      // Optional: Spinner size
  fullscreen?: boolean;                      // Optional: Fullscreen mode
}
```

## Checklist

- [x] ErrorMessage component created
- [x] Loading component created
- [x] Components use design tokens
- [x] Components are theme-aware
- [x] TypeScript types defined
- [x] Accessible (ARIA labels)
- [x] Integrated into ApiTest component (example)
- [x] Demo component created
- [x] Route added for demo page
- [x] Components compile without errors
- [x] Dev server runs successfully

## Next Steps

1. Add these components to other service test components
2. Use in actual pages (HomePage, LearningPage, ProfilePage)
3. Add loading states to all async operations
4. Add error handling to all API calls
5. Consider adding toast notifications for non-blocking errors
