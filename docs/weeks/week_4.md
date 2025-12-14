# Week 4: React Frontend Setup

## Overview

Week 4 focuses on setting up the **React frontend foundation** for the Adaptive Learning Management System. The main goal is to create a functional React application with TypeScript, establish API communication with the backend, and set up routing. This week lays the groundwork for the learning interface (Week 5) and dashboard (Week 6).

---

## General Specifications

### Architecture & Technology Stack

**Framework & Build Tool:**
- React 18+ with TypeScript
- Vite as build tool and dev server
- Development server runs on `http://localhost:5173`

**State Management:**
- React Query (@tanstack/react-query) for server state
- Local component state with useState/useReducer
- Optional: Zustand for global client state (Part B)

**Routing:**
- React Router DOM v6+ for client-side routing
- Routes: `/` (home), `/learn` (learning interface), `/profile` (user profile)

**HTTP Client:**
- Axios for API requests
- Centralized API client with request/response interceptors
- Error handling and logging built-in

**API Communication:**
- Backend base URL: `http://localhost:8000`
- All endpoints use `/api/v1/` prefix
- CORS configured on backend to allow `localhost:5173`
- Environment variable support via `VITE_API_BASE_URL`

### Code Organization

**Directory Structure:**
```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Route-level page components
│   ├── services/        # API service layer
│   ├── styles/          # Shared styles and design tokens
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component with routing
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── vite.config.ts       # Vite configuration
```

**Service Layer Pattern:**
- Each backend resource has a corresponding service file
- Services export pure functions (not classes)
- All services use the centralized API client
- Type-safe with TypeScript interfaces matching backend schemas

**Naming Conventions:**
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Services: camelCase with "Service" suffix (e.g., `userService.ts`)
- Types: PascalCase for interfaces (e.g., `User`, `Dialog`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Utility functions: camelCase (e.g., `formatJSON`)

### Styling Approach

**Design System v2.0 (Modern Education-Focused):**
- Theme system with light/dark mode support via ThemeContext
- Centralized design tokens in `src/styles/designTokens.ts` (lightColors, darkColors)
- Global CSS variables in `src/index.css` (automatically switches with theme)
- Shared style utilities in `src/styles/sharedStyles.ts`
- Inline styles using TypeScript CSSProperties for type safety with theme awareness
- Optional: Tailwind CSS (Part B)

**Design Tokens Include:**
- **Color Palettes**: Complete light and dark theme color sets (50+ tokens each)
  - Primary Indigo (#4f46e5 light, #6366f1 dark) - Educational, trustworthy
  - Accent Amber (#f59e0b light, #fbbf24 dark) - Warm, engaging
  - Semantic colors (success, error, warning, info, purple)
  - Text colors (primary, secondary, muted, label)
  - Background colors (primary, secondary, tertiary)
  - Border colors with multiple levels
- **Shadow System**: Multi-level shadows (sm, md, lg, xl, card, cardHover) for both themes
- **Gradient Backgrounds**: Subtle gradients for modern UI feel
- **Spacing scale**: xs, sm, md, lg, xl, 2xl, 3xl (0.375rem to 2rem)
- **Typography scale**: Font sizes (xs to 2xl), weights (400-700), families (system-ui, monospace)
- **Border radius values**: 4px to 16px (modern cards use 16px)
- **Transitions**: Standard (0.2s) and smooth (0.3s cubic-bezier)

**Component Styling Pattern:**
- Use `useTheme()` hook to access theme-aware colors
- Compose styles using TypeScript objects
- Avoid inline magic values - use design tokens
- Implement hover states with smooth transitions
- Create elevated card designs with shadow effects
- Use gradient text for hero sections
- Icon badges for visual hierarchy
- Modern 16px border radius for cards

### TypeScript Standards

**Type Definitions:**
- All API schemas have corresponding TypeScript interfaces
- Types stored in `src/types/` organized by domain
- Types must match backend Pydantic schemas exactly
- Generic types for common patterns (e.g., `ApiResponse<T>`)

**Type Safety:**
- Strict mode enabled in `tsconfig.json`
- No `any` types unless absolutely necessary
- All service functions fully typed (parameters and returns)
- Axios responses properly typed

### Backend Integration

**API Endpoints Reference:**
- Users: `@backend/app/api/routes/users.py`
- Dialogs: `@backend/app/api/routes/dialogs.py`
- Messages: `@backend/app/api/routes/messages.py`
- Content: `@backend/app/api/routes/content.py`
- Recommendations: `@backend/app/api/routes/recommendations.py`
- User Profiles: `@backend/app/api/routes/user_profiles.py`

**Schema References:**
- User schemas: `@backend/app/schemas/user.py`
- Dialog schemas: `@backend/app/schemas/dialog.py`
- Message schemas: `@backend/app/schemas/message.py`
- Content schemas: `@backend/app/schemas/content.py`
- Recommendation schemas: `@backend/app/schemas/recommendation.py`
- User profile schemas: `@backend/app/schemas/user_profile.py`

**CORS Configuration:**
- Backend configured to allow `http://localhost:5173`
- Credentials allowed for future authentication
- See: `@backend/app/main.py:50-57` and `@backend/app/config.py:31`

### Error Handling

**Client-Side Error Handling:**
- Axios interceptors catch all HTTP errors
- Network errors handled gracefully
- User-friendly error messages displayed
- Errors logged to console for debugging

**Error Display:**
- Reusable `ErrorMessage` component
- Consistent error styling using design tokens
- Optional retry functionality
- Loading states shown during async operations

### Development Workflow

**Running the Application:**
1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Access frontend: `http://localhost:5173`
4. Access backend API docs: `http://localhost:8000/docs`

**Testing API Integration:**
- Use browser DevTools Network tab
- Use Backend Swagger UI (`/docs`) to understand schemas
- Create test components for each service
- Verify CORS and request/response format

**Environment Variables:**
- Never commit `.env` files
- Always update `.env.example` when adding new vars
- Use `VITE_` prefix for client-exposed variables
- Use `import.meta.env.VITE_*` to access in code

### Code Quality Standards

**Best Practices:**
- DRY (Don't Repeat Yourself) - extract repetitive patterns
- Single Responsibility Principle - one purpose per function/component
- Type safety - leverage TypeScript fully
- Consistent formatting - follow project conventions
- Meaningful names - clear, descriptive identifiers

**Comments & Documentation:**
- JSDoc comments for exported functions
- Inline comments for complex logic
- README documentation for setup and usage
- Type annotations serve as documentation

### Important Resources

**Design System v2.0 (Updated 2024-12-04):**
- `@docs/frontend_design_v2.md` - Complete design system documentation with dark mode
- `@frontend/.claude/component-style-guide.md` - Component patterns and style guide v2.0
- Design tokens: `@frontend/src/styles/designTokens.ts` (lightColors, darkColors)
- Theme context: `@frontend/src/contexts/ThemeContext.tsx`
- Global styles: `@frontend/src/index.css` (with dark mode CSS variables)
- Shared styles: `@frontend/src/styles/sharedStyles.ts`

**Key Design Updates:**
- ✨ Dark mode support with theme toggle
- 🎨 New education-focused color palette (Indigo + Amber)
- 💫 Modern card designs with elevation effects
- 🌈 Gradient text and backgrounds
- 📦 Icon badges and improved visual hierarchy

**Backend Documentation:**
- API routes: `@backend/app/api/routes/`
- Schemas: `@backend/app/schemas/`
- Configuration: `@backend/app/config.py`
- Main app: `@backend/app/main.py`

---

## Document Structure

**This document is divided into two parts:**
- **Part A**: Minimal Core Tasks (required to progress to Week 5)
- **Part B**: Optional Enhancements (beneficial but can be postponed)

---

# Part A: Minimal Core Tasks

These tasks are **essential** for Week 5 development. Without these, the learning interface cannot be built.

---

## 1. Project Setup

### Initialize React Project with Vite

**References:**
- Target directory: `frontend/` (already exists at project root)
- Frontend placeholder structure exists with empty `src/` directory

- [x] Navigate to project root directory
- [x] Create frontend directory: `mkdir frontend` (if it doesn't exist) - **Note: Already exists**
- [x] Navigate to frontend: `cd frontend`
- [x] Initialize React + TypeScript project with Vite
  ```bash
  npm create vite@latest . -- --template react-ts
  ```
- [x] Install initial dependencies
  ```bash
  npm install
  ```
- [x] Verify project structure created
  - [x] Verify `package.json` exists
  - [x] Verify `tsconfig.json` exists
  - [x] Verify `vite.config.ts` exists
  - [x] Verify `src/` directory exists
- [x] Test development server
  ```bash
  npm run dev
  ```
  - [x] Open browser to `http://localhost:5173`
  - [x] Verify default Vite + React page loads
  - [x] Stop server (Ctrl+C)

---

## 2. Install Core Dependencies

### Essential Packages for API Integration

**References:**
- Package manager: npm (standard for React/Vite projects)

- [x] Install axios (API client)
  ```bash
  npm install axios
  ```
- [x] Install React Query (data fetching and caching)
  ```bash
  npm install @tanstack/react-query
  ```
- [x] Install React Router (routing)
  ```bash
  npm install react-router-dom
  ```
- [x] Verify all dependencies installed
  ```bash
  npm list --depth=0
  ```
- [x] Verify no installation errors
- [x] Commit package.json and package-lock.json changes

---

## 3. Set Up TypeScript Types for API Schemas

### Module: `src/types/`

**References:**
- Backend schemas at: `backend/app/schemas/`
- User schema: `@backend/app/schemas/user.py` (UserBase, UserCreate, UserResponse with user_id, username, email, created_at, updated_at)
- Dialog schema: `@backend/app/schemas/dialog.py` (DialogBase, DialogCreate, DialogResponse with dialog_id, user_id, dialog_type, topic, started_at, ended_at, extra_data)
- Message schema: `@backend/app/schemas/message.py` (MessageBase, MessageCreate, MessageResponse with message_id, dialog_id, sender_type, content, is_question, timestamp, extra_data)
- Content schema: `@backend/app/schemas/content.py` (ContentItemBase, ContentItemResponse, ContentListResponse with pagination)
- User profile schema: `@backend/app/schemas/user_profile.py` (UserProfileBase, UserProfileResponse with profile_id, user_id, topic_mastery, preferred_format, learning_pace, avg_accuracy, current_difficulty, etc.)
- Recommendation schema: `@backend/app/schemas/recommendation.py` (RecommendationRequest, RecommendationResponse, ContentSummary, RecommendationMetadata)

- [x] Create types directory: `mkdir src/types`
- [x] Create `src/types/user.ts` - User-related types
  - [x] Define `User` interface matching backend schema (@backend/app/schemas/user.py:UserResponse)
    - user_id: number, username: string, email: string, created_at: string, updated_at: string
  - [x] Define `UserProfile` interface matching backend schema (@backend/app/schemas/user_profile.py:UserProfileResponse)
    - profile_id, user_id, topic_mastery: Record<string, number>, preferred_format, learning_pace, avg_accuracy, current_difficulty, etc.
- [x] Create `src/types/dialog.ts` - Dialog-related types
  - [x] Define `Dialog` interface (@backend/app/schemas/dialog.py:DialogResponse)
    - dialog_id, user_id, dialog_type: 'educational' | 'test' | 'assessment' | 'reflective', topic, started_at, ended_at, extra_data
  - [x] Define `Message` interface (@backend/app/schemas/message.py:MessageResponse)
    - message_id, dialog_id, sender_type: 'user' | 'system', content, is_question, timestamp, extra_data
- [x] Create `src/types/content.ts` - Content-related types
  - [x] Define `ContentItem` interface (@backend/app/schemas/content.py:ContentItemResponse)
    - content_id, title, topic, subtopic, difficulty_level, format, content_type, content_data, reference_answer, hints, explanations, skills, prerequisites, extra_data
  - [x] Define difficulty type: `'easy' | 'normal' | 'hard' | 'challenge'` (from @backend/app/schemas/content.py:21-27)
  - [x] Define format type: `'text' | 'visual' | 'video' | 'interactive'` (from @backend/app/schemas/content.py:29-35)
  - [x] Define content_type: `'lesson' | 'exercise' | 'quiz' | 'explanation'` (from @backend/app/schemas/content.py:37-43)
- [x] Create `src/types/recommendation.ts` - Recommendation types
  - [x] Define `Recommendation` interface (@backend/app/schemas/recommendation.py:RecommendationResponse)
    - content, reasoning, confidence, recommendation_metadata, strategy_used, timestamp
  - [x] Define `RecommendationRequest` interface (@backend/app/schemas/recommendation.py:RecommendationRequest)
    - user_id, dialog_id?, override_difficulty?, override_format?
- [x] Create `src/types/api.ts` - Generic API types
  - [x] Define `ApiResponse<T>` generic type
  - [x] Define `ApiError` interface
  - [x] Define `PaginationMetadata` for content lists (@backend/app/schemas/content.py:110-119)
- [x] Verify types compile without errors
  ```bash
  npm run build
  ```

---

## 4. Create API Client Service

### Module: `src/services/api.ts`

**References:**
- Backend base URL: `http://localhost:8000` (from @backend/app/config.py:ALLOWED_ORIGINS includes localhost:5173)
- CORS configured: @backend/app/main.py:50-57 allows credentials and all methods/headers from localhost:5173
- API prefix: `/api/v1/` (all routes use this prefix, see @backend/app/main.py:60-67)

- [x] Create services directory: `mkdir src/services`
- [x] Create `src/services/api.ts` file
- [x] Configure axios instance
  - [x] Set base URL to backend: `http://localhost:8000` (or use env var VITE_API_BASE_URL from @backend/app/config.py)
  - [x] Set default headers (Content-Type: application/json)
  - [x] Set timeout (e.g., 10000ms)
- [x] Implement request interceptor
  - [x] Log requests for debugging
  - [x] Add authentication headers (placeholder for future JWT - backend has JWT config in @backend/app/config.py:16-19)
- [x] Implement response interceptor
  - [x] Handle successful responses
  - [x] Extract data from axios response
- [x] Implement error interceptor
  - [x] Catch network errors
  - [x] Catch HTTP errors (4xx, 5xx)
  - [x] Format error messages consistently
  - [x] Log errors to console
- [x] Export configured axios instance
- [x] Test API client
  - [x] Create test component that fetches from backend
  - [x] Verify request reaches backend
  - [x] Verify CORS works (backend allows frontend origin per @backend/app/config.py:31)

---

## 5. Create Dialog Service

### Module: `src/services/dialogService.ts`

**References:**
- Backend dialog routes: @backend/app/api/routes/dialogs.py
- Endpoints:
  - POST `/api/v1/dialogs` - create_dialog (line 18-42)
  - GET `/api/v1/dialogs/{dialog_id}` - get_dialog (line 45-58)
  - GET `/api/v1/dialogs/user/{user_id}` - list_user_dialogs (line 61-67)
  - POST `/api/v1/dialogs/{dialog_id}/messages` - create_dialog_message (line 70-126)
  - PATCH `/api/v1/dialogs/{dialog_id}/end` - end_dialog (line 129-146)
- Dialog types: @backend/app/schemas/dialog.py uses DialogCreate, DialogResponse

- [x] Create `src/services/dialogService.ts` file
- [x] Implement `createDialog(userId: number)` function
  - [x] POST to `/api/v1/dialogs` (@backend/app/api/routes/dialogs.py:18)
  - [x] Send DialogCreate payload: user_id, dialog_type, topic (@backend/app/schemas/dialog.py:22-24)
  - [x] Return Dialog object (DialogResponse)
- [x] Implement `getDialog(dialogId: number)` function
  - [x] GET from `/api/v1/dialogs/{id}` (@backend/app/api/routes/dialogs.py:45)
  - [x] Return Dialog object
- [x] Implement `getDialogMessages(dialogId: number)` function
  - [x] GET from `/api/v1/dialogs/{dialog_id}/messages` (use messages endpoint @backend/app/api/routes/messages.py:250)
  - [x] Return Message array
- [x] Implement `sendMessage(dialogId: number, content: string, ...)` function
  - [x] POST to `/api/v1/dialogs/{dialog_id}/messages` (@backend/app/api/routes/dialogs.py:70)
  - [x] Send MessageCreate payload: dialog_id, sender_type, content, is_question, extra_data (@backend/app/schemas/message.py:19-23)
  - [x] Return created Message
  - [x] Note: Can use `include_recommendation` query param to get next content in one call (@backend/app/api/routes/messages.py:20-23)
- [x] Export all functions
- [x] Test dialog service functions via browser console or test component

---

## 6. Create Content Service

### Module: `src/services/contentService.ts`

**References:**
- Backend content routes: @backend/app/api/routes/content.py
- Content service: @backend/app/services/content_service.py
- Endpoints:
  - GET `/api/v1/content` - list_content with filters and pagination (line 53-122)
  - GET `/api/v1/content/{content_id}` - get_content_endpoint (line 187-206)
  - GET `/api/v1/content/random` - get_random_content_endpoint (line 125-170)
  - GET `/api/v1/content/topics` - list_topics (line 173-184)
  - GET `/api/v1/content/{content_id}/next` - get_next_content_endpoint (line 209-258)

- [x] Create `src/services/contentService.ts` file
- [x] Implement `getContent(params?)` function
  - [x] GET from `/api/v1/content` (@backend/app/api/routes/content.py:53)
  - [x] Support optional filters (topic, subtopic, difficulty, format, content_type, skills)
  - [x] Support pagination params (limit, offset) - returns ContentListResponse with pagination metadata (@backend/app/schemas/content.py:121-124)
  - [x] Return content list
- [x] Implement `getContentById(contentId: number)` function
  - [x] GET from `/api/v1/content/{id}` (@backend/app/api/routes/content.py:187)
  - [x] Return single ContentItem (ContentItemResponse)
- [x] Implement `getRandomContent(filters?)` function
  - [x] GET from `/api/v1/content/random` (@backend/app/api/routes/content.py:125)
  - [x] Support filters: topic, difficulty, format, content_type
  - [x] Return random ContentItem
- [x] Implement `getTopics()` function
  - [x] GET from `/api/v1/content/topics` (@backend/app/api/routes/content.py:173)
  - [x] Return list of available topics
- [x] Implement `getNextContent(contentId: number, userId: number)` function
  - [x] GET from `/api/v1/content/{content_id}/next` (@backend/app/api/routes/content.py:209)
  - [x] Return next ContentItem in learning sequence or null if end of sequence
  - [x] Handle 204 No Content response gracefully
- [x] Export all functions
- [x] Test content service functions

---

## 7. Create User Service

### Module: `src/services/userService.ts`

**References:**
- Backend user routes: @backend/app/api/routes/users.py
- Backend user profile routes: @backend/app/api/routes/user_profiles.py
- User service: @backend/app/services/user_service.py
- Endpoints:
  - POST `/api/v1/users` - create_user (line 17-59, auto-creates profile)
  - GET `/api/v1/users/{user_id}` - get_user (line 62-75)
  - GET `/api/v1/users` - list_users (line 78-84)
  - GET `/api/v1/user-profiles/user/{user_id}` - get_user_profile (@backend/app/api/routes/user_profiles.py:38-53)

- [x] Create `src/services/userService.ts` file
- [x] Implement `createUser(userData)` function
  - [x] POST to `/api/v1/users` (@backend/app/api/routes/users.py:17)
  - [x] Send UserCreate payload: username, email, password (@backend/app/schemas/user.py:19-21)
  - [x] Return created User (UserResponse)
  - [x] Note: User profile is auto-created on user creation (@backend/app/api/routes/users.py:49-57)
- [x] Implement `getUser(userId: number)` function
  - [x] GET from `/api/v1/users/{id}` (@backend/app/api/routes/users.py:62)
  - [x] Return User object
- [x] Implement `getUserProfile(userId: number)` function
  - [x] GET from `/api/v1/user-profiles/user/{user_id}` (@backend/app/api/routes/user_profiles.py:38)
  - [x] Return UserProfile object (UserProfileResponse with topic_mastery, preferred_format, etc.)
- [x] Export all functions
- [x] Test user service functions

---

## 8. Create Recommendation Service

### Module: `src/services/recommendationService.ts`

**References:**
- Backend recommendation routes: @backend/app/api/routes/recommendations.py
- Recommendation service: @backend/app/services/recommendation_service.py
- Adaptation engine: @backend/app/core/adaptation/engine.py
- Endpoints:
  - POST `/api/v1/recommendations/next` - get_next_recommendation (line 30-241)
  - GET `/api/v1/recommendations/history` - get_recommendation_history (line 294-345)
  - GET `/api/v1/recommendations/strategy` - get_current_strategy (line 348-380)

- [x] Create `src/services/recommendationService.ts` file
- [x] Implement `getRecommendation(userId: number, dialogId?: number)` function
  - [x] POST to `/api/v1/recommendations/next` (@backend/app/api/routes/recommendations.py:30)
  - [x] Send RecommendationRequest: user_id, dialog_id?, override_difficulty?, override_format? (@backend/app/schemas/recommendation.py:5-45)
  - [x] Return Recommendation object (RecommendationResponse) with content, reasoning, confidence, metadata (@backend/app/schemas/recommendation.py:92-137)
  - [x] Note: Uses adaptation engine to analyze user profile and recommend next content
- [x] Implement `getRecommendationHistory(userId: number, limit?: number)` function
  - [x] GET from `/api/v1/recommendations/history` (@backend/app/api/routes/recommendations.py:294)
  - [x] Return list of recent recommendations
- [x] Export functions
- [x] Test recommendation service

---

## 9. Set Up Routing

### Basic Routes and Navigation

**References:**
- React Router DOM package (to be installed in Task 2)
- Frontend pages to be created: HomePage, LearningPage, ProfilePage

- [x] Update `src/App.tsx` to use React Router
  - [x] Import `BrowserRouter`, `Routes`, `Route` from react-router-dom
  - [x] Wrap app in `<BrowserRouter>`
- [x] Create placeholder page components
  - [x] Create `src/pages/HomePage.tsx` (dashboard placeholder)
  - [x] Create `src/pages/LearningPage.tsx` (learning interface placeholder)
  - [x] Create `src/pages/ProfilePage.tsx` (profile placeholder)
- [x] Define routes in App.tsx
  - [x] Route: `/` → HomePage
  - [x] Route: `/learn` → LearningPage
  - [x] Route: `/profile` → ProfilePage
- [x] Create basic navigation component
  - [x] Create `src/components/Navigation.tsx`
  - [x] Add links to all routes using `<Link>` component
  - [x] Include Navigation in App.tsx
- [x] Test routing
  - [x] Start dev server
  - [x] Navigate to each route
  - [x] Verify correct page renders
  - [x] Test browser back/forward buttons

---

## 10. Configure Vite Proxy for Backend

### Proxy Configuration

**References:**
- Backend URL: `http://localhost:8000` (from @backend/app/config.py)
- Backend API prefix: `/api/v1/` (all routes use this, see @backend/app/main.py:60-67)
- Vite config file: `vite.config.ts` (to be created by Vite init)

- [x] Update `vite.config.ts`
- [x] Add proxy configuration
  ```typescript
  export default defineConfig({
    // ... existing config
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        }
      }
    }
  })
  ```
- [x] Test proxy by making API call to `/api/v1/content`
- [x] Verify request is forwarded to backend (@backend/app/api/routes/content.py handles /api/v1/content)

---

## 11. Set Up React Query Provider

### Query Client Configuration

**References:**
- React Query package: @tanstack/react-query (to be installed in Task 2)
- Entry point: `src/main.tsx` or `src/App.tsx` (created by Vite)

- [x] Update `src/main.tsx` or `src/App.tsx`
- [x] Import `QueryClient` and `QueryClientProvider` from @tanstack/react-query
- [x] Create QueryClient instance
  ```typescript
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      }
    }
  })
  ```
- [x] Wrap app in `<QueryClientProvider client={queryClient}>`
- [x] Test React Query by creating a component that uses `useQuery` to fetch content
- [x] Verify data caching works (check React Query DevTools if installed)

---

## 12. Integration Testing

### Frontend-Backend Integration Verification

**References:**
- Backend must be running at `http://localhost:8000` (start with: `cd backend && uvicorn app.main:app --reload`)
- Backend Swagger UI: `http://localhost:8000/docs` (FastAPI auto-generated docs)
- All services created in Tasks 5-8 will be tested here
- Full workflow: @backend/app/api/routes/messages.py:16-247 shows complete message -> metrics -> recommendation flow

- [x] Test complete flow from frontend to backend
  1. [x] Create user via userService (POST /api/v1/users from @backend/app/api/routes/users.py:17)
  2. [x] Create dialog via dialogService (POST /api/v1/dialogs from @backend/app/api/routes/dialogs.py:18)
  3. [x] Fetch content via contentService (GET /api/v1/content from @backend/app/api/routes/content.py:53)
  4. [x] Get recommendation via recommendationService (POST /api/v1/recommendations/next from @backend/app/api/routes/recommendations.py:30)
  5. [x] Send message via dialogService (POST /api/v1/dialogs/{id}/messages from @backend/app/api/routes/dialogs.py:70)
- [x] Verify all API calls succeed
- [x] Verify data structure matches TypeScript types (compare with schemas in @backend/app/schemas/)
- [x] Handle and display errors appropriately
- [x] Document any API issues or inconsistencies

---

## 13. Basic Error Handling

### Error Display Components

**References:**
- Error patterns from backend: HTTPException with status codes (404, 400, 422, 500)
- See error handling in @backend/app/api/routes/*.py files

- [ ] Create `src/components/ErrorMessage.tsx`
  - [ ] Display error message prop
  - [ ] Style appropriately
  - [ ] Optionally include retry button
- [ ] Create `src/components/Loading.tsx`
  - [ ] Display loading spinner or text
  - [ ] Reusable across app
- [ ] Use these components in services/pages
- [ ] Test error scenarios (backend down, invalid requests)

---

## 14. Environment Configuration

### Environment Variables Setup

**References:**
- Backend URL: `http://localhost:8000` (from @backend/app/config.py)
- Vite env var prefix: `VITE_` (Vite convention for exposing env vars to client)

- [ ] Create `.env` file in frontend root
  ```
  VITE_API_BASE_URL=http://localhost:8000
  ```
- [ ] Create `.env.example` as template
- [ ] Update `.gitignore` to exclude `.env` (keep `.env.example`)
- [ ] Update `src/services/api.ts` to use environment variable
  ```typescript
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  ```
- [ ] Test with different API URLs

---

## 15. Validation and Sign-off

### Part A Completion Checklist

**References:**
- All backend endpoints from @backend/app/main.py:60-67
- All schemas from @backend/app/schemas/
- CORS config from @backend/app/main.py:50-57

- [ ] **Project Initialized**: React + TypeScript + Vite project running
- [ ] **Dependencies Installed**: axios, @tanstack/react-query, react-router-dom
- [ ] **TypeScript Types**: All API schemas typed (matching @backend/app/schemas/)
- [ ] **API Client**: Axios configured with interceptors
- [ ] **Services Layer**: dialogService, contentService, userService, recommendationService implemented
- [ ] **Routing**: Basic routes and navigation working
- [ ] **React Query**: Provider configured
- [ ] **Integration**: Frontend successfully calls backend APIs (@backend/app/api/routes/)
- [ ] **Error Handling**: Basic error display components created
- [ ] **Environment Config**: API URL configurable via .env

### Key Validation Questions

- [ ] Can you start the dev server and see the app?
- [ ] Can you navigate between routes?
- [ ] Can you create a user from the frontend? (uses @backend/app/api/routes/users.py:17)
- [ ] Can you fetch content from the backend? (uses @backend/app/api/routes/content.py:53)
- [ ] Can you get a recommendation from the backend? (uses @backend/app/api/routes/recommendations.py:30)
- [ ] Does the proxy to backend work correctly? (forwards /api to localhost:8000)
- [ ] Do TypeScript types compile without errors?

---

# Part B: Optional Enhancements

These tasks are **beneficial** but can be postponed if time is limited. They improve developer experience and code quality but are not blocking for Week 5.

---

## 16. State Management (Optional)

### Global State Setup

**References:**
- React Query already provides server state caching
- Local state management options: Zustand (lightweight), Redux Toolkit, React Context

- [ ] Decide on state management approach
  - [ ] Option A: Zustand (lightweight, recommended)
  - [ ] Option B: Redux Toolkit (more complex)
  - [ ] Option C: React Context (built-in, simplest)
- [ ] If using Zustand:
  - [ ] Install: `npm install zustand`
  - [ ] Create `src/store/userStore.ts`
  - [ ] Create `src/store/dialogStore.ts`
  - [ ] Test store functionality
- [ ] Note: Can defer this and use React Query cache + local state for now

---

## 17. Tailwind CSS Setup (Optional)

### Styling Framework

**References:**
- Vite project structure (supports PostCSS)
- Tailwind utility-first CSS framework

- [ ] Install Tailwind CSS
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [ ] Configure `tailwind.config.js`
  ```javascript
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
  ```
- [ ] Add Tailwind directives to `src/index.css`
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- [ ] Test with utility classes
- [ ] Note: Can use plain CSS for now and add Tailwind later

---

## 18. React Query DevTools (Optional)

### Developer Tools

**References:**
- React Query DevTools package: @tanstack/react-query-devtools
- Helps visualize and debug query cache

- [ ] Install React Query DevTools
  ```bash
  npm install -D @tanstack/react-query-devtools
  ```
- [ ] Import in App.tsx
  ```typescript
  import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
  ```
- [ ] Add to app
  ```tsx
  <ReactQueryDevtools initialIsOpen={false} />
  ```
- [ ] Test DevTools panel in browser

---

## 19. ESLint and Prettier (Optional)

### Code Quality Tools

**References:**
- TypeScript ESLint for React/TypeScript projects
- Prettier for code formatting

- [ ] Set up ESLint
  ```bash
  npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
  ```
  - [ ] Create `.eslintrc.js` configuration
  - [ ] Add lint script to package.json: `"lint": "eslint src --ext ts,tsx"`
- [ ] Set up Prettier
  ```bash
  npm install -D prettier
  ```
  - [ ] Create `.prettierrc` configuration
  - [ ] Add format script: `"format": "prettier --write src/**/*.{ts,tsx,css}"`
- [ ] Run lint and format on codebase
- [ ] Fix any issues

---

## 20. Testing Setup (Optional)

### Unit Testing Framework

**References:**
- Vitest (Vite-native test runner)
- React Testing Library for component testing

- [ ] Install Vitest and React Testing Library
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```
- [ ] Configure Vitest in `vite.config.ts`
- [ ] Create `src/test/setup.ts` for test configuration
- [ ] Write sample tests for services
- [ ] Add test scripts to package.json
  - [ ] `"test": "vitest"`
  - [ ] `"test:coverage": "vitest --coverage"`
- [ ] Note: Comprehensive testing can be done in Week 10

---

## 21. Documentation (Optional)

### Project Documentation

**References:**
- Backend API documentation at `http://localhost:8000/docs` (FastAPI Swagger UI)
- Main README at project root

- [ ] Create `frontend/README.md`
  - [ ] Document setup instructions
  - [ ] Document project structure
  - [ ] Document available npm scripts
  - [ ] Document environment variables
- [ ] Add JSDoc comments to service functions
  - [ ] Document parameters
  - [ ] Document return types
  - [ ] Include usage examples
- [ ] Note: Can improve documentation gradually

---

## Part B Validation (Optional)

If you complete any of Part B, verify:

- [ ] **State Management**: Global state works if implemented
- [ ] **Tailwind CSS**: Utility classes work if implemented
- [ ] **DevTools**: React Query DevTools accessible if installed
- [ ] **Linting**: ESLint and Prettier configured if installed
- [ ] **Testing**: Test suite runs if implemented
- [ ] **Documentation**: README complete if written

---

## Deliverable

By the end of Week 4, you should have:

### Part A (Required):
✅ **React Project**: Functional TypeScript + Vite project
✅ **Core Dependencies**: axios, react-router-dom, @tanstack/react-query installed
✅ **TypeScript Types**: Complete type definitions for API schemas (matching @backend/app/schemas/)
✅ **API Client Service**: Configured axios instance with interceptors
✅ **Service Layer**: dialogService, contentService, userService, recommendationService (calling @backend/app/api/routes/)
✅ **Routing**: Basic routes (/, /learn, /profile) with navigation
✅ **React Query**: Query provider configured
✅ **Integration**: Frontend successfully communicates with backend (@backend/app/main.py:50-57 CORS allows it)
✅ **Error Handling**: Basic error and loading components
✅ **Environment Config**: API URL configurable via .env

### Part B (Optional):
- State management (if chosen to implement)
- Tailwind CSS (if chosen to implement)
- React Query DevTools (if installed)
- ESLint/Prettier (if configured)
- Testing framework (if set up)
- Documentation (if written)

---

## Dependencies

**Must be completed before Week 4**:
- Week 3 deliverables:
  - Backend API fully functional (@backend/app/main.py with all routes)
  - All endpoints working: `/api/v1/users`, `/api/v1/dialogs`, `/api/v1/messages`, `/api/v1/content`, `/api/v1/recommendations` (@backend/app/api/routes/)
  - Backend running on `http://localhost:8000`
  - CORS configured to allow frontend requests (@backend/app/config.py:31 includes localhost:5173)

**Enables Week 5**:
- Week 5 (Learning Interface) depends on:
  - All Part A tasks completed
  - Service layer working
  - API communication established
  - TypeScript types defined
  - Routing setup complete

---

## Notes

- **Prioritize Part A** - These are critical for Week 5 progress
- Part B tasks can be done in Week 6, 7, or later
- Test frequently with backend running (`cd backend && uvicorn app.main:app --reload`)
- Use Swagger UI (`http://localhost:8000/docs`) to understand API structure
- Check browser DevTools Network tab for API debugging
- Use `console.log` liberally for debugging
- Document any API issues or inconsistencies
- If blocked on styling, use plain CSS for now
- If blocked on state management, use React Query cache and component state
- Backend must have CORS configured: allow origin `http://localhost:5173` (@backend/app/config.py:31)
- Keep components simple this week - focus on connectivity
- Week 5 will focus on building actual UI components

---

## Estimated Time Breakdown

**Part A (Required)**: 2-3 days
- Day 1: Project setup, dependencies, TypeScript types (Tasks 1-3)
- Day 2: API client and all services (Tasks 4-8)
- Day 3: Routing, React Query, integration testing (Tasks 9-15)

**Part B (Optional)**: 1-2 days (can be done later)

---

## Troubleshooting

**Issue**: CORS errors when calling backend
- **Solution**: Ensure backend has CORS middleware configured to allow `http://localhost:5173` (@backend/app/main.py:50-57 and @backend/app/config.py:31)

**Issue**: TypeScript errors with API response types
- **Solution**: Check backend Swagger UI (`http://localhost:8000/docs`) for exact response schema, update TypeScript types accordingly (reference @backend/app/schemas/)

**Issue**: Vite proxy not working
- **Solution**: Ensure `target` in `vite.config.ts` matches backend URL exactly (`http://localhost:8000`)

**Issue**: React Query not caching data
- **Solution**: Ensure unique query keys for each query, verify QueryClient configuration

**Issue**: Routes not working (404 on refresh)
- **Solution**: This is expected in development; will be configured in production deployment

---

**Good luck with Week 4!** 🚀
