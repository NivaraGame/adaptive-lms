# Week 5: Learning Interface

## Overview

Week 5 focuses on building the **interactive learning interface** for the Adaptive Learning Management System. The main goal is to create a functional chat-based learning experience where users can interact with educational content, receive personalized recommendations, and engage in adaptive learning dialogues. This week transforms the frontend foundation from Week 4 into a complete learning application.

---

## General Specifications

### Architecture & Technology Stack

**Component Architecture:**
- React 18+ with TypeScript and functional components
- Component composition pattern for reusability
- Custom hooks for shared logic (useDialog, useContent)
- React Query for server state and caching
- Controlled components for forms and inputs

**State Management Strategy:**
- **Server State**: React Query (@tanstack/react-query) for dialogs, messages, content, recommendations
- **Local UI State**: useState/useReducer for component-level state (input values, UI toggles)
- **Persistent State**: Dialog ID and user ID in sessionStorage for page refreshes
- **Real-time Updates**: Optimistic updates with React Query mutations

**Routing Structure:**
- Learning interface at `/learn` route
- Profile page at `/profile` route
- Home dashboard at `/` route
- Route protection (future: authentication required for /learn)

**Data Flow:**
```
User Input → Send Message → Create Metrics → Get Recommendation → Display Content
     ↓            ↓               ↓                  ↓                  ↓
  Local UI    API Call      Backend Process    API Response      React State
```

### Code Organization

**Directory Structure:**
```
frontend/src/
├── components/
│   ├── dialogs/          # Dialog and chat components
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageList.tsx
│   │   ├── InputArea.tsx
│   │   └── DialogHeader.tsx
│   ├── content/          # Content display components
│   │   ├── ContentViewer.tsx
│   │   ├── LessonViewer.tsx
│   │   ├── ExerciseCard.tsx
│   │   ├── QuizCard.tsx
│   │   ├── HintPanel.tsx
│   │   └── ExplanationPanel.tsx
│   ├── shared/           # Shared/reusable components
│   │   ├── ErrorMessage.tsx (existing)
│   │   ├── Loading.tsx (existing)
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   └── metrics/          # Metrics display components (Week 6)
├── pages/
│   ├── LearningPage.tsx  # Main learning interface
│   ├── ProfilePage.tsx   # User profile
│   └── HomePage.tsx      # Dashboard
├── hooks/                # Custom React hooks
│   ├── useDialog.ts
│   ├── useContent.ts
│   ├── useRecommendation.ts
│   └── useMessages.ts
├── utils/
│   ├── formatJSON.tsx (existing)
│   ├── contentFormatter.ts
│   └── sessionStorage.ts
└── types/ (existing)
```

**Component Hierarchy:**
```
LearningPage
  ├── DialogHeader (topic, difficulty, session info)
  ├── ChatInterface
  │   ├── MessageList
  │   │   └── MessageBubble (multiple)
  │   └── InputArea
  └── ContentViewer
      ├── LessonViewer (for lesson content)
      ├── ExerciseCard (for exercises)
      ├── QuizCard (for quizzes)
      ├── HintPanel (collapsible hints)
      └── ExplanationPanel (after answer submission)
```

**Naming Conventions:**
- Components: PascalCase with descriptive names (e.g., `ChatInterface`, `MessageBubble`)
- Hooks: camelCase with "use" prefix (e.g., `useDialog`, `useContent`)
- Props interfaces: Component name + "Props" (e.g., `MessageBubbleProps`)
- Event handlers: "handle" prefix (e.g., `handleSendMessage`, `handleSubmitAnswer`)

### Styling Approach

**Design System v2.0 Implementation:**
- All components use `useTheme()` hook for theme-aware styling
- Follow modern card design patterns from `@frontend/.claude/component-style-guide.md`
- Use design tokens from `@frontend/src/styles/designTokens.ts`
- Implement smooth transitions and hover effects
- Mobile-responsive layouts with flexbox/grid

**Component-Specific Styling:**
- **Chat bubbles**: Different styles for user vs system messages
  - User messages: Right-aligned, primary color background
  - System messages: Left-aligned, secondary background
  - Timestamps below each message
- **Content cards**: Elevated card design with 16px border radius
- **Input area**: Sticky bottom positioning, full-width textarea
- **Hint panels**: Collapsible accordion with subtle border
- **Loading states**: Skeleton screens for better UX

**Accessibility:**
- Semantic HTML (article, section, button, textarea)
- ARIA labels for interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Focus management for input fields
- Screen reader friendly message announcements

### TypeScript Standards

**Component Props Interfaces:**
```typescript
interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

interface ContentViewerProps {
  content: ContentItem;
  onSubmitAnswer: (answer: string) => Promise<void>;
  onRequestHint: (hintIndex: number) => void;
  showExplanation: boolean;
}
```

**Custom Hook Return Types:**
```typescript
interface UseDialogReturn {
  dialog: Dialog | null;
  messages: Message[];
  loading: boolean;
  error: ApiError | null;
  sendMessage: (content: string) => Promise<void>;
  createDialog: (userId: number) => Promise<void>;
}
```

**Type Safety Requirements:**
- All API responses properly typed
- No `any` types in component code
- Strict null checks enabled
- Event handlers fully typed
- Generic types for reusable hooks

### Backend Integration

**API Workflow for Learning Session:**

1. **Initialize Session** (on page load):
   - Create user via `POST /api/v1/users` (@backend/app/api/routes/users.py:17)
   - User profile auto-created (@backend/app/api/routes/users.py:49-57)
   - Create dialog via `POST /api/v1/dialogs` (@backend/app/api/routes/dialogs.py:18)
   - Store dialog_id in sessionStorage

2. **Get Initial Content**:
   - Get recommendation via `POST /api/v1/recommendations/next` (@backend/app/api/routes/recommendations.py:30)
   - Fetch content via `GET /api/v1/content/{id}` (@backend/app/api/routes/content.py:187)
   - Display content in ContentViewer

3. **User Interaction Flow**:
   - User submits answer/response
   - Send message via `POST /api/v1/dialogs/{id}/messages` (@backend/app/api/routes/dialogs.py:70)
   - Backend computes metrics (@backend/app/core/metrics/)
   - Backend updates user profile (@backend/app/services/user_service.py)
   - Optional: Include recommendation in response with `include_recommendation=true` query param

4. **Get Next Content**:
   - Get recommendation for next content (@backend/app/api/routes/recommendations.py:30)
   - Display new content
   - Repeat cycle

**Key Endpoints Used:**
- `POST /api/v1/users` - Create user
- `POST /api/v1/dialogs` - Create learning session
- `GET /api/v1/dialogs/{id}/messages` - Fetch message history (@backend/app/api/routes/messages.py:250)
- `POST /api/v1/dialogs/{id}/messages` - Send user message
- `POST /api/v1/recommendations/next` - Get content recommendation
- `GET /api/v1/content/{id}` - Fetch content item
- `PATCH /api/v1/dialogs/{id}/end` - End session (@backend/app/api/routes/dialogs.py:129)

**Data Schemas:**
- Dialog: @backend/app/schemas/dialog.py (DialogResponse)
- Message: @backend/app/schemas/message.py (MessageResponse with sender_type, content, timestamp)
- Content: @backend/app/schemas/content.py (ContentItemResponse with content_data, hints, explanations)
- Recommendation: @backend/app/schemas/recommendation.py (RecommendationResponse with reasoning, confidence)

### Error Handling

**Error Scenarios:**
1. **Network Errors**: Display ErrorMessage component with retry option
2. **API Errors** (4xx, 5xx): Show user-friendly error message
3. **Empty States**: No dialog found, no content available
4. **Session Expired**: Create new dialog on 404 error
5. **Invalid User Input**: Client-side validation before submission

**Error Display Strategy:**
- Use `<ErrorMessage>` component from Week 4
- Toast notifications for transient errors
- Inline error messages for form validation
- Graceful degradation (show cached data if available)

**Loading States:**
- Initial page load: Full-page loading spinner
- Message sending: Disabled input + loading indicator
- Content fetching: Skeleton content card
- Background updates: Subtle loading indicator

### Development Workflow

**Component Development Approach:**
1. Start with static mockups (hardcoded data)
2. Add TypeScript interfaces for props
3. Implement basic rendering
4. Add interactive logic with handlers
5. Integrate with backend services
6. Add error handling and loading states
7. Apply styling and animations
8. Test with different data scenarios

**Testing Strategy:**
- Manual testing with backend running
- Test different content types (lesson, exercise, quiz)
- Test different dialog scenarios (new user, returning user)
- Test error scenarios (network failure, invalid data)
- Test on different screen sizes (mobile, tablet, desktop)

**Development Server Setup:**
```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Code Quality Standards

**Component Best Practices:**
- Single Responsibility: Each component has one clear purpose
- Composition over Inheritance: Build complex UIs from simple components
- Props over State: Lift state up when needed
- DRY: Extract repeated logic into custom hooks
- Explicit is better than implicit: Clear prop names and function names

**React Patterns:**
- Use functional components with hooks
- Avoid prop drilling (consider composition or context if needed)
- Memoize expensive computations with useMemo
- Debounce user input for auto-save features
- Clean up effects (return cleanup function)

**Error Boundaries:**
- Add error boundary for LearningPage (Week 6 enhancement)
- Catch render errors gracefully
- Display fallback UI on component errors

### Important Resources

**Design References:**
- Design system: `@docs/frontend_design_v2.md`
- Component patterns: `@frontend/.claude/component-style-guide.md`
- Design tokens: `@frontend/src/styles/designTokens.ts`
- Theme context: `@frontend/src/contexts/ThemeContext.tsx`

**Backend References:**
- Dialog routes: `@backend/app/api/routes/dialogs.py`
- Message routes: `@backend/app/api/routes/messages.py`
- Content routes: `@backend/app/api/routes/content.py`
- Recommendation routes: `@backend/app/api/routes/recommendations.py`
- Dialog schemas: `@backend/app/schemas/dialog.py`
- Message schemas: `@backend/app/schemas/message.py`
- Content schemas: `@backend/app/schemas/content.py`

**Week 4 Deliverables (Prerequisites):**
- Service layer: `@frontend/src/services/` (dialogService, contentService, recommendationService)
- Type definitions: `@frontend/src/types/` (dialog.ts, content.ts, recommendation.ts)
- Error components: `@frontend/src/components/ErrorMessage.tsx`, `@frontend/src/components/Loading.tsx`

---

## Document Structure

**This document is divided into two parts:**
- **Part A**: Core Learning Interface (required to have functional learning experience)
- **Part B**: Enhanced Features (beneficial but can be postponed)

---

# Part A: Core Learning Interface

These tasks are **essential** for a functional learning interface. Without these, users cannot interact with the adaptive learning system.

---

## 1. Create Custom Hooks for Data Management

### Module: `src/hooks/`

**References:**
- React Query documentation for custom hooks pattern
- Services created in Week 4: @frontend/src/services/
- Type definitions: @frontend/src/types/

**Purpose:** Encapsulate data fetching and state management logic in reusable hooks

**Dependencies:**
- **Frontend Services** (Week 4):
  - @frontend/src/services/dialogService.ts (createDialog, endDialog, getDialog, sendMessage, getDialogMessages)
  - @frontend/src/services/contentService.ts (getContentById)
  - @frontend/src/services/recommendationService.ts (getRecommendation)
  - @frontend/src/services/userService.ts (createUser)
  - @frontend/src/services/api.ts (base API client configuration)
- **Frontend Types** (Week 4):
  - @frontend/src/types/dialog.ts (Dialog, Message)
  - @frontend/src/types/content.ts (ContentItem)
  - @frontend/src/types/recommendation.ts (Recommendation)
  - @frontend/src/types/user.ts (User)
  - @frontend/src/types/api.ts (ApiError)
- **React Query**:
  - @tanstack/react-query (useQuery, useMutation, useQueryClient)

- [x] Create hooks directory: `mkdir src/hooks`

### Hook: `src/hooks/useDialog.ts`

**Depends on:**
- @frontend/src/services/dialogService.ts (createDialog, endDialog, getDialog)
- @frontend/src/types/dialog.ts (Dialog)
- @frontend/src/types/api.ts (ApiError)
- @tanstack/react-query
- Browser sessionStorage API

- [x] Create `src/hooks/useDialog.ts` file
- [x] Import dialogService functions
- [x] Import React Query hooks (useQuery, useMutation)
- [x] Implement `useDialog()` hook
  - [x] State: currentDialog (Dialog | null)
  - [x] State: loading, error states
  - [x] Function: `createDialog(userId: number)` using useMutation
    - Calls dialogService.createDialog
    - Stores dialog_id in sessionStorage
    - Invalidates dialog queries
  - [x] Function: `endDialog(dialogId: number)` using useMutation
    - Calls dialogService.endDialog
    - Clears sessionStorage
  - [x] Function: `getDialog(dialogId: number)` using useQuery
    - Fetches dialog details
    - Caches with key `['dialog', dialogId]`
  - [x] Return object: `{ dialog, createDialog, endDialog, loading, error }`
- [x] Add JSDoc comments documenting usage
- [x] Test hook with test component

### Hook: `src/hooks/useMessages.ts`

**Depends on:**
- @frontend/src/services/dialogService.ts (getDialogMessages, sendMessage)
- @frontend/src/types/dialog.ts (Message)
- @frontend/src/types/api.ts (ApiError)
- @tanstack/react-query

- [x] Create `src/hooks/useMessages.ts` file
- [x] Import dialogService (for message operations)
- [x] Import React Query hooks
- [x] Implement `useMessages(dialogId: number)` hook
  - [x] Query messages with useQuery
    - Key: `['messages', dialogId]`
    - Fetch function: dialogService.getDialogMessages(dialogId)
    - Enabled only when dialogId exists
    - Refetch interval: 30 seconds (for updates)
  - [x] Mutation: `sendMessage(content: string, isQuestion: boolean)`
    - Calls dialogService.sendMessage
    - Optimistic update (add message to cache immediately)
    - Invalidates messages query on success
    - Returns created message
  - [x] Return: `{ messages, sendMessage, loading, error, refetch }`
- [x] Handle empty state (no messages)
- [x] Test with dialog created from useDialog hook

### Hook: `src/hooks/useContent.ts`

**Depends on:**
- @frontend/src/services/contentService.ts (getContentById)
- @frontend/src/types/content.ts (ContentItem)
- @frontend/src/types/api.ts (ApiError)
- @tanstack/react-query

- [x] Create `src/hooks/useContent.ts` file
- [x] Import contentService
- [x] Implement `useContent()` hook
  - [x] Query: `getContentById(contentId: number)` using useQuery
    - Key: `['content', contentId]`
    - Fetch: contentService.getContentById
    - Cache time: 10 minutes (content is static)
  - [x] Function: `loadContent(contentId: number)`
    - Updates current content ID
    - Triggers new query
  - [x] State: currentContent (ContentItem | null)
  - [x] Return: `{ content, loadContent, loading, error }`
- [x] Test fetching different content types (lesson, exercise, quiz)

### Hook: `src/hooks/useRecommendation.ts`

**Depends on:**
- @frontend/src/services/recommendationService.ts (getRecommendation)
- @frontend/src/types/recommendation.ts (Recommendation)
- @frontend/src/types/api.ts (ApiError)
- @tanstack/react-query

- [x] Create `src/hooks/useRecommendation.ts` file
- [x] Import recommendationService
- [x] Implement `useRecommendation()` hook
  - [x] Mutation: `getRecommendation(userId: number, dialogId?: number)`
    - Calls recommendationService.getRecommendation
    - Returns Recommendation object with content, reasoning, confidence
    - Does NOT automatically fetch content (returns content summary)
  - [x] State: latestRecommendation (Recommendation | null)
  - [x] Function: `clearRecommendation()` to reset state
  - [x] Return: `{ recommendation, getRecommendation, loading, error, clearRecommendation }`
- [x] Test recommendation flow with user profile

---

## 2. Create Dialog Components

### Module: `src/components/dialogs/`

**References:**
- Design system: @docs/frontend_design_v2.md
- Message schema: @backend/app/schemas/message.py
- Component patterns: @frontend/.claude/component-style-guide.md

**Dependencies:**
- **Frontend Hooks** (Task 1, Week 5):
  - @frontend/src/hooks/useDialog.ts
  - @frontend/src/hooks/useMessages.ts
- **Frontend Types** (Week 4):
  - @frontend/src/types/dialog.ts (Dialog, Message)
- **Frontend Styling** (Week 4):
  - @frontend/src/contexts/ThemeContext.tsx (useTheme hook)
  - @frontend/src/styles/designTokens.ts (colors, spacing, fontSize)
- **Backend Schemas** (reference only):
  - @backend/app/schemas/dialog.py (DialogResponse structure)
  - @backend/app/schemas/message.py (MessageResponse with sender_type, content, timestamp)

- [x] Create dialogs directory: `mkdir src/components/dialogs`

### Component: `src/components/dialogs/DialogHeader.tsx`

**Purpose:** Display session information and controls

**Depends on:**
- @frontend/src/types/dialog.ts (Dialog)
- @frontend/src/contexts/ThemeContext.tsx (useTheme)
- @frontend/src/styles/designTokens.ts

- [x] Create `src/components/dialogs/DialogHeader.tsx` file
- [x] Import useTheme for theme-aware styling
- [x] Define `DialogHeaderProps` interface
  - dialog: Dialog | null
  - onEndSession: () => void
  - loading: boolean
- [x] Implement DialogHeader component
  - [x] Display dialog topic (from dialog.topic)
  - [x] Display dialog type badge (educational, test, assessment, reflective)
  - [x] Display session start time (dialog.started_at)
  - [x] Display "End Session" button
    - Styled with warning/danger color
    - Calls onEndSession handler
    - Disabled when loading
  - [x] Apply modern card styling with elevation
  - [x] Use icon badges for visual appeal (🎓 for topic, ⏱️ for time)
- [x] Add responsive layout (stack on mobile)
- [x] Test with different dialog types

### Component: `src/components/dialogs/MessageBubble.tsx`

**Purpose:** Display individual message with appropriate styling

**Depends on:**
- @frontend/src/types/dialog.ts (Message)
- @frontend/src/contexts/ThemeContext.tsx (useTheme)
- @frontend/src/styles/designTokens.ts
- date-fns or Intl.DateTimeFormat (for timestamp formatting)

- [x] Create `src/components/dialogs/MessageBubble.tsx` file
- [x] Define `MessageBubbleProps` interface
  - message: Message
  - isUser: boolean
- [x] Implement MessageBubble component
  - [x] Conditional styling based on sender_type
    - User messages: Right-aligned, primary color background, white text
    - System messages: Left-aligned, secondary background, primary text
  - [x] Display message content (message.content)
  - [x] Display timestamp below message (formatted as "HH:MM" or relative time)
  - [x] Add question badge if message.is_question is true
  - [x] Apply bubble styling:
    - Rounded corners (16px on most, 4px on "tail" corner)
    - Padding: spacing.lg
    - Max width: 70% of container
    - Box shadow for depth
  - [x] Smooth entrance animation (fade in + slide up)
- [x] Format timestamp with date-fns or native Intl.DateTimeFormat
- [x] Test with user and system messages

### Component: `src/components/dialogs/MessageList.tsx`

**Purpose:** Display list of messages with auto-scroll

**Depends on:**
- @frontend/src/components/dialogs/MessageBubble.tsx (child component)
- @frontend/src/types/dialog.ts (Message)
- @frontend/src/contexts/ThemeContext.tsx (useTheme)
- @frontend/src/styles/designTokens.ts
- React hooks (useRef, useEffect)

- [x] Create `src/components/dialogs/MessageList.tsx` file
- [x] Define `MessageListProps` interface
  - messages: Message[]
  - loading: boolean
- [x] Implement MessageList component
  - [x] Map over messages array
  - [x] Render MessageBubble for each message
  - [x] Determine isUser from message.sender_type === 'user'
  - [x] Add unique key for each message (message.message_id)
  - [x] Implement auto-scroll to bottom
    - Use useRef for scroll container
    - Use useEffect to scroll on new messages
    - Scroll behavior: 'smooth'
  - [x] Display loading spinner when loading
  - [x] Display empty state when no messages
    - "No messages yet. Start the conversation!"
    - Styled with muted text color
  - [x] Style container:
    - Overflow-y: auto
    - Max height: calc(100vh - header - input - padding)
    - Padding: spacing['2xl']
    - Gap between messages: spacing.md
- [x] Test auto-scroll behavior
- [x] Test with many messages (scrolling performance)

### Component: `src/components/dialogs/InputArea.tsx`

**Purpose:** Input for user messages and answers

**Depends on:**
- @frontend/src/contexts/ThemeContext.tsx (useTheme)
- @frontend/src/styles/designTokens.ts
- React hooks (useState)

- [x] Create `src/components/dialogs/InputArea.tsx` file
- [x] Define `InputAreaProps` interface
  - onSendMessage: (content: string) => Promise<void>
  - loading: boolean
  - placeholder?: string
- [x] Implement InputArea component
  - [x] State: inputValue (string) with useState
  - [x] Render textarea element
    - Controlled component (value={inputValue})
    - onChange updates state
    - Placeholder text
    - Auto-resize based on content (max 5 lines)
    - Disabled when loading
  - [x] Render "Send" button
    - Calls handleSend on click
    - Disabled when loading or inputValue is empty
    - Primary color styling
    - Icon: ➤ or "Send"
  - [x] Implement handleSend function
    - Call onSendMessage(inputValue)
    - Clear input on success
    - Handle errors (display inline error)
  - [x] Implement keyboard shortcuts
    - Enter: Send message (Shift+Enter for new line)
    - Escape: Clear input
  - [x] Style container:
    - Sticky to bottom of viewport
    - Background: bgSecondary
    - Border-top: 1px solid border color
    - Padding: spacing.lg
    - Flexbox layout (textarea + button)
    - Gap: spacing.md
  - [x] Add loading indicator when sending
- [x] Test input validation
- [x] Test keyboard shortcuts
- [x] Test auto-resize behavior

### Component: `src/components/dialogs/ChatInterface.tsx`

**Purpose:** Compose MessageList and InputArea into complete chat UI

**Depends on:**
- @frontend/src/hooks/useMessages.ts (Week 5, Task 1)
- @frontend/src/components/dialogs/MessageList.tsx (Week 5, Task 2)
- @frontend/src/components/dialogs/InputArea.tsx (Week 5, Task 2)
- @frontend/src/components/ErrorMessage.tsx (Week 4)
- @frontend/src/contexts/ThemeContext.tsx (useTheme)

- [x] Create `src/components/dialogs/ChatInterface.tsx` file
- [x] Define `ChatInterfaceProps` interface
  - dialogId: number
  - onMessageSent?: () => void
- [x] Implement ChatInterface component
  - [x] Use useMessages hook
    - Pass dialogId
    - Get messages, sendMessage, loading, error
  - [x] Implement handleSendMessage
    - Call sendMessage from hook
    - Call onMessageSent callback if provided
    - Handle errors with ErrorMessage component
  - [x] Render MessageList
    - Pass messages array
    - Pass loading state
  - [x] Render InputArea
    - Pass handleSendMessage as onSendMessage
    - Pass loading state
    - Placeholder: "Type your response..."
  - [x] Display error with ErrorMessage component if error exists
  - [x] Apply container styling:
    - Display: flex, flex-direction: column
    - Height: 100%
    - Background: bgPrimary
- [x] Test complete chat flow
- [x] Test error handling

---

## 3. Create Content Display Components

### Module: `src/components/content/`

**References:**
- Content schema: @backend/app/schemas/content.py
- Content types: lesson, exercise, quiz, explanation
- Content formats: text, visual, video, interactive
- Design system: @docs/frontend_design_v2.md

**Dependencies:**
- **Frontend Hooks** (Task 1, Week 5):
  - @frontend/src/hooks/useContent.ts
- **Frontend Types** (Week 4):
  - @frontend/src/types/content.ts (ContentItem)
- **Frontend Styling** (Week 4):
  - @frontend/src/contexts/ThemeContext.tsx (useTheme)
  - @frontend/src/styles/designTokens.ts
- **Frontend Utils** (Task 5, Week 5):
  - @frontend/src/utils/contentFormatter.ts (parseContentData)
- **Backend Schemas** (reference only):
  - @backend/app/schemas/content.py (ContentItemResponse with content_data, hints, explanations)

- [x] Create content directory: `mkdir src/components/content`

### Component: `src/components/content/LessonViewer.tsx`

**Purpose:** Display educational lesson content

**Depends on:**
- @frontend/src/types/content.ts (ContentItem)
- @frontend/src/utils/contentFormatter.ts (parseContentData)
- @frontend/src/contexts/ThemeContext.tsx (useTheme)
- @frontend/src/styles/designTokens.ts

- [x] Create `src/components/content/LessonViewer.tsx` file
- [x] Define `LessonViewerProps` interface
  - content: ContentItem (where content_type === 'lesson')
- [x] Implement LessonViewer component
  - [x] Display title (content.title)
  - [x] Display topic and subtopic badges
  - [x] Display difficulty level badge (easy, normal, hard, challenge)
  - [x] Render content_data based on format
    - **Text format**: Render as formatted text (markdown-style)
      - Parse content_data.text
      - Support headings, lists, emphasis
      - Apply typography styles
    - **Visual format**: Display images/diagrams
      - Render content_data.image_url if present
      - Alt text from content_data.description
    - **Video format**: Embed video player
      - Use video element with content_data.video_url
      - Controls enabled
    - **Interactive format**: Render interactive elements
      - Parse content_data.interactive_elements
      - Could be code playgrounds, simulations, etc.
  - [x] Display learning objectives if present (content_data.objectives)
  - [x] Display prerequisite skills if present (content.prerequisites)
  - [x] Style with modern card design
    - Elevated card with shadow
    - 16px border radius
    - Padding: spacing['3xl']
    - Background: bgSecondary
  - [x] Add "Continue" button at bottom
    - Emits event to parent to load next content
- [x] Create utility function to parse content_data JSON
- [x] Test with different content formats
- [x] Handle missing or malformed content_data gracefully

### Component: `src/components/content/ExerciseCard.tsx`

**Purpose:** Display practice exercise with answer input

**Depends on:**
- @frontend/src/types/content.ts (ContentItem)
- @frontend/src/utils/contentFormatter.ts (parseContentData)
- @frontend/src/contexts/ThemeContext.tsx (useTheme)
- @frontend/src/styles/designTokens.ts
- React hooks (useState)

- [x] Create `src/components/content/ExerciseCard.tsx` file
- [x] Define `ExerciseCardProps` interface
  - content: ContentItem (where content_type === 'exercise')
  - onSubmitAnswer: (answer: string) => Promise<void>
  - showFeedback: boolean
  - isCorrect?: boolean
- [x] Implement ExerciseCard component
  - [x] Display exercise title and description
  - [x] Display difficulty and format badges
  - [x] Render exercise prompt (content_data.question or content_data.prompt)
  - [x] Render answer input based on exercise type
    - **Short answer**: Textarea for text input
    - **Code exercise**: Code editor (simple textarea with monospace font)
    - **Math exercise**: Input with support for math notation
  - [x] Display "Submit Answer" button
    - Calls onSubmitAnswer with answer text
    - Disabled when answer is empty
    - Loading state during submission
  - [x] Display feedback when showFeedback is true
    - Correct: Green success message with ✅
    - Incorrect: Red error message with ❌
    - Show reference_answer if available (content.reference_answer)
  - [x] State: answer (string) with useState
  - [x] State: submitted (boolean) to track submission
  - [x] Style with elevated card design
  - [x] Apply different border color based on feedback (green/red)
- [x] Test submission flow
- [x] Test feedback display

### Component: `src/components/content/QuizCard.tsx`

**Purpose:** Display quiz question with multiple choice or true/false

**Depends on:**
- @frontend/src/types/content.ts (ContentItem)
- @frontend/src/utils/contentFormatter.ts (parseContentData)
- @frontend/src/contexts/ThemeContext.tsx (useTheme)
- @frontend/src/styles/designTokens.ts
- React hooks (useState)

- [x] Create `src/components/content/QuizCard.tsx` file
- [x] Define `QuizCardProps` interface
  - content: ContentItem (where content_type === 'quiz')
  - onSubmitAnswer: (answer: string) => Promise<void>
  - showFeedback: boolean
  - isCorrect?: boolean
- [x] Implement QuizCard component
  - [x] Display quiz question (content_data.question)
  - [x] Render answer options based on quiz type
    - **Multiple choice**: Radio buttons for options
      - Parse content_data.options array
      - Map over options to create radio group
      - Track selected option with state
    - **True/False**: Two radio buttons
    - **Multiple select**: Checkboxes for multiple answers
  - [x] Display "Submit Answer" button
    - Disabled when no selection made
    - Calls onSubmitAnswer with selected option(s)
  - [x] Display feedback when showFeedback is true
    - Highlight correct answer in green
    - Highlight incorrect selection in red
    - Show explanation (content_data.explanation)
  - [x] State: selectedAnswer (string | string[])
  - [x] Style options with hover effects
  - [x] Apply modern card styling
  - [x] Disable options after submission
- [x] Test with multiple choice questions
- [x] Test with true/false questions
- [x] Test feedback highlighting

### Component: `src/components/content/HintPanel.tsx`

**Purpose:** Display progressive hints in collapsible accordion

**Depends on:**
- @frontend/src/contexts/ThemeContext.tsx (useTheme)
- @frontend/src/styles/designTokens.ts
- React hooks (useState)

- [x] Create `src/components/content/HintPanel.tsx` file
- [x] Define `HintPanelProps` interface
  - hints: string[] (from content.hints)
  - onRequestHint: (hintIndex: number) => void
  - revealedHintCount: number
- [x] Implement HintPanel component
  - [x] State: expanded (boolean) to control accordion
  - [x] Render accordion header
    - "💡 Need a hint?" with expand/collapse icon
    - Click toggles expanded state
  - [x] Render hints list when expanded
    - Display hints[0] through hints[revealedHintCount - 1]
    - Each hint in its own styled container
    - Numbered hints (Hint 1, Hint 2, etc.)
  - [x] Render "Reveal Next Hint" button if more hints available
    - Only show if revealedHintCount < hints.length
    - Calls onRequestHint(revealedHintCount) on click
    - Styled as secondary button
  - [x] Display message when all hints revealed
    - "All hints revealed!"
  - [x] Apply collapsible animation
    - Smooth height transition
    - Fade in content
  - [x] Style with subtle background
    - Border: warning color
    - Background: warningLight
    - Icon: 💡
- [x] Test hint progression
- [x] Test accordion interaction

### Component: `src/components/content/ExplanationPanel.tsx`

**Purpose:** Display detailed explanation after answer submission

**Depends on:**
- @frontend/src/contexts/ThemeContext.tsx (useTheme)
- @frontend/src/styles/designTokens.ts

- [x] Create `src/components/content/ExplanationPanel.tsx` file
- [x] Define `ExplanationPanelProps` interface
  - explanations: string[] (from content.explanations)
  - isCorrect: boolean
  - userAnswer?: string
  - correctAnswer?: string
- [x] Implement ExplanationPanel component
  - [x] Display header based on correctness
    - Correct: "✅ Great job!" in success color
    - Incorrect: "❌ Not quite right" in error color
  - [x] Display user's answer if provided
    - "Your answer: {userAnswer}"
  - [x] Display correct answer if incorrect
    - "Correct answer: {correctAnswer}"
  - [x] Render explanation sections
    - Map over explanations array
    - Each explanation in separate section
    - Support formatted text
  - [x] Display related skills learned (from content.skills)
    - Show as tags/badges
    - Styled with info color
  - [x] Style with modern card
    - Border color based on correctness (success/error)
    - Background: successLight or errorLight
    - Padding: spacing['2xl']
    - Border-left: 4px solid success/error
  - [x] Add "Continue to Next" button at bottom
- [x] Test with correct answer scenario
- [x] Test with incorrect answer scenario

### Component: `src/components/content/ContentViewer.tsx`

**Purpose:** Main container that renders appropriate content type component

**Depends on:**
- @frontend/src/components/content/LessonViewer.tsx (Week 5, Task 3)
- @frontend/src/components/content/ExerciseCard.tsx (Week 5, Task 3)
- @frontend/src/components/content/QuizCard.tsx (Week 5, Task 3)
- @frontend/src/components/content/HintPanel.tsx (Week 5, Task 3)
- @frontend/src/components/content/ExplanationPanel.tsx (Week 5, Task 3)
- @frontend/src/components/Loading.tsx (Week 4)
- @frontend/src/types/content.ts (ContentItem)
- @frontend/src/contexts/ThemeContext.tsx (useTheme)
- React hooks (useState)

- [x] Create `src/components/content/ContentViewer.tsx` file
- [x] Define `ContentViewerProps` interface
  - content: ContentItem | null
  - onSubmitAnswer: (answer: string) => Promise<void>
  - onRequestNextContent: () => void
  - loading: boolean
- [x] Implement ContentViewer component
  - [x] State: showFeedback (boolean) - tracks if answer submitted
  - [x] State: isCorrect (boolean | null) - tracks answer correctness
  - [x] State: revealedHintCount (number) - tracks hints revealed
  - [x] Implement handleSubmitAnswer function
    - Call onSubmitAnswer(answer)
    - Set showFeedback to true
    - Determine correctness (compare with reference_answer or from API response)
    - Set isCorrect state
  - [x] Implement handleRequestHint function
    - Increment revealedHintCount
    - Log hint usage (for future metrics)
  - [x] Implement handleNextContent function
    - Reset states (showFeedback, isCorrect, revealedHintCount)
    - Call onRequestNextContent
  - [x] Render appropriate component based on content.content_type
    - 'lesson' → LessonViewer
    - 'exercise' → ExerciseCard
    - 'quiz' → QuizCard
    - 'explanation' → ExplanationPanel only
  - [x] Render HintPanel if content.hints exists and length > 0
    - Only for exercise and quiz types
    - Pass hints array and handlers
  - [x] Render ExplanationPanel if showFeedback is true
    - Pass explanations, isCorrect, user answer
  - [x] Display Loading component when loading
  - [x] Display empty state when content is null
    - "No content available. Get a recommendation to start!"
  - [x] Apply container styling with spacing
- [x] Test switching between content types
- [x] Test complete interaction flow (hint → answer → explanation → next)

---

## 4. Integrate Learning Flow in LearningPage

### Module: `src/pages/LearningPage.tsx`

**References:**
- Hooks created in Task 1
- Components created in Tasks 2 and 3
- Backend workflow: @backend/app/api/routes/

**Purpose:** Orchestrate complete learning experience

**Dependencies:**
- **Frontend Hooks** (Task 1, Week 5):
  - @frontend/src/hooks/useDialog.ts
  - @frontend/src/hooks/useMessages.ts
  - @frontend/src/hooks/useContent.ts
  - @frontend/src/hooks/useRecommendation.ts
- **Frontend Components** (Tasks 2-3, Week 5):
  - @frontend/src/components/dialogs/DialogHeader.tsx
  - @frontend/src/components/dialogs/ChatInterface.tsx
  - @frontend/src/components/content/ContentViewer.tsx
- **Frontend Components** (Week 4):
  - @frontend/src/components/ErrorMessage.tsx
  - @frontend/src/components/Loading.tsx
- **Frontend Services** (Week 4):
  - @frontend/src/services/userService.ts (createUser)
- **Frontend Utils** (Task 5, Week 5):
  - @frontend/src/utils/sessionStorage.ts
- **Frontend Styling** (Week 4):
  - @frontend/src/contexts/ThemeContext.tsx (useTheme)
  - @frontend/src/styles/designTokens.ts
- **Backend API Endpoints** (used via services):
  - @backend/app/api/routes/users.py (POST /api/v1/users)
  - @backend/app/api/routes/dialogs.py (POST /api/v1/dialogs, PATCH /api/v1/dialogs/{id}/end)
  - @backend/app/api/routes/messages.py (GET /api/v1/dialogs/{id}/messages, POST /api/v1/dialogs/{id}/messages)
  - @backend/app/api/routes/content.py (GET /api/v1/content/{id})
  - @backend/app/api/routes/recommendations.py (POST /api/v1/recommendations/next)
- React Router (for navigation)
- Browser sessionStorage API

- [x] Update `src/pages/LearningPage.tsx` file
- [x] Import all custom hooks (useDialog, useMessages, useContent, useRecommendation)
- [x] Import all components (DialogHeader, ChatInterface, ContentViewer)
- [x] Import theme and design tokens

### State Management

- [x] Define page-level state
  - [x] userId: number | null (from sessionStorage or created on mount)
  - [x] currentContentId: number | null
  - [x] sessionActive: boolean
- [x] Initialize hooks
  - [x] const { dialog, createDialog, endDialog, loading: dialogLoading } = useDialog()
  - [x] const { content, loadContent, loading: contentLoading } = useContent()
  - [x] const { recommendation, getRecommendation, loading: recLoading } = useRecommendation()

### Initialization Flow

- [x] Implement useEffect for page mount
  - [x] Check sessionStorage for existing userId and dialogId
  - [x] If no userId: Create new user via userService.createUser
    - Generate random username: "user_" + timestamp
    - Generate random email: "user{timestamp}@example.com"
    - Store userId in sessionStorage
  - [x] If no dialogId: Create new dialog via createDialog(userId)
    - Store dialogId in sessionStorage
  - [x] If dialogId exists: Load dialog via getDialog(dialogId)
  - [x] Get initial recommendation via getRecommendation(userId, dialogId)
  - [x] Load initial content via loadContent(recommendation.content.content_id)
- [x] Implement cleanup on unmount
  - [x] Optional: Auto-save dialog state
  - [x] Keep sessionStorage for page refresh

### Event Handlers

- [x] Implement handleSubmitAnswer
  - [x] Accept answer: string parameter
  - [x] Create message via ChatInterface sendMessage
    - Content: user's answer
    - sender_type: 'user'
    - is_question: false
  - [x] Call backend API to create message
    - POST /api/v1/dialogs/{dialogId}/messages
    - Backend automatically computes metrics
    - Backend automatically updates user profile
  - [x] Create system response message
    - Provide feedback based on correctness
    - Send as system message
  - [x] Return Promise<void>
- [x] Implement handleRequestNextContent
  - [x] Get new recommendation via getRecommendation(userId, dialogId)
  - [x] Extract content_id from recommendation
  - [x] Load new content via loadContent(contentId)
  - [x] Create system message announcing new content
    - "Here's your next challenge: {content.title}"
  - [x] Scroll chat to bottom
- [x] Implement handleEndSession
  - [x] Confirm with user (optional confirmation dialog)
  - [x] End dialog via endDialog(dialogId)
  - [x] Clear sessionStorage
  - [x] Navigate to home page or show session summary
  - [x] Display thank you message

### Layout and Rendering

- [x] Create two-column layout
  - [x] Left column: ChatInterface (40% width)
    - Pass dialogId
    - Pass onMessageSent callback (optional: triggers update)
  - [x] Right column: ContentViewer (60% width)
    - Pass current content
    - Pass handleSubmitAnswer as onSubmitAnswer
    - Pass handleRequestNextContent as onRequestNextContent
    - Pass contentLoading state
  - [x] Responsive: Stack columns on mobile (content on top, chat below)
- [x] Render DialogHeader at top
  - [x] Pass dialog object
  - [x] Pass handleEndSession as onEndSession
  - [x] Pass dialogLoading state
- [x] Apply page container styling
  - [x] Padding: spacing['3xl']
  - [x] Background: bgPrimary
  - [x] Min-height: 100vh
  - [x] Max-width: 1400px
  - [x] Margin: 0 auto
- [x] Display loading states
  - [x] Full-page loading on initial mount
  - [x] Skeleton content card while loading content
  - [x] Chat loading indicator when sending messages
- [x] Display error states
  - [x] ErrorMessage component for initialization errors
  - [x] Retry button to recreate session

### Testing and Validation

- [ ] Test complete learning flow end-to-end
  1. [ ] Page loads → User created → Dialog created
  2. [ ] Initial recommendation fetched → Content displayed
  3. [ ] User views content → Reads lesson or question
  4. [ ] User requests hint → Hint revealed (for exercises)
  5. [ ] User submits answer → Message sent → Feedback displayed
  6. [ ] User requests next content → New recommendation → New content loaded
  7. [ ] User ends session → Dialog ended → Redirected
- [ ] Test error scenarios
  - [ ] Network failure during initialization
  - [ ] Invalid content ID in recommendation
  - [ ] Dialog not found (session expired)
- [ ] Test page refresh behavior
  - [ ] Session persists via sessionStorage
  - [ ] Existing dialog reloaded
  - [ ] Messages restored
- [ ] Test on different screen sizes
  - [ ] Desktop: Two columns side-by-side
  - [ ] Tablet: Adjusted column widths
  - [ ] Mobile: Stacked layout

---

## 5. Create Utility Functions

### Module: `src/utils/`

**References:**
- Existing utils: @frontend/src/utils/formatJSON.tsx

**Dependencies:**
- **Frontend Types** (Week 4):
  - @frontend/src/types/content.ts (ContentItem, content_data structures)
- **Backend Schemas** (reference only):
  - @backend/app/schemas/content.py (content_data field structure)
- date-fns or Intl.DateTimeFormat (for timestamp formatting)

### Utility: `src/utils/contentFormatter.ts`

**Purpose:** Parse and format content_data from backend

**Depends on:**
- @frontend/src/types/content.ts (for type definitions)

- [x] Create `src/utils/contentFormatter.ts` file
- [x] Implement `parseContentData(contentData: any, format: string)` function
  - [x] Accept content_data JSON and format type
  - [x] Return formatted object with parsed fields
  - [x] Handle different formats:
    - **text**: Extract text, headings, lists
    - **visual**: Extract image_url, caption, description
    - **video**: Extract video_url, duration, subtitles
    - **interactive**: Extract interactive elements array
  - [x] Validate required fields exist
  - [x] Return null if parsing fails
  - [x] Add TypeScript types for each format
- [x] Implement `formatTimestamp(timestamp: string)` function
  - [x] Accept ISO 8601 timestamp string
  - [x] Return formatted string:
    - "Just now" if < 1 minute ago
    - "X minutes ago" if < 1 hour ago
    - "HH:MM" if today
    - "MMM DD, HH:MM" if this year
    - "MMM DD, YYYY" if older
  - [x] Use date-fns or Intl.DateTimeFormat
- [x] Implement `sanitizeUserInput(input: string)` function
  - [x] Remove potentially harmful HTML/scripts
  - [x] Trim whitespace
  - [x] Limit length (e.g., max 5000 characters)
  - [x] Return sanitized string
- [x] Export all functions
- [ ] Add unit tests for each function

### Utility: `src/utils/sessionStorage.ts`

**Purpose:** Manage session storage for user and dialog state

**Depends on:**
- Browser sessionStorage API

- [x] Create `src/utils/sessionStorage.ts` file
- [x] Define constants for storage keys
  - [x] STORAGE_KEYS object with USER_ID, DIALOG_ID, SESSION_START
- [x] Implement `saveUserId(userId: number)` function
  - [x] Store userId in sessionStorage
- [x] Implement `getUserId()` function
  - [x] Retrieve userId from sessionStorage
  - [x] Return number | null
  - [x] Parse string to number
- [x] Implement `saveDialogId(dialogId: number)` function
  - [x] Store dialogId in sessionStorage
- [x] Implement `getDialogId()` function
  - [x] Retrieve dialogId from sessionStorage
  - [x] Return number | null
- [x] Implement `saveSessionStart(timestamp: string)` function
  - [x] Store session start time
- [x] Implement `getSessionStart()` function
  - [x] Return session start timestamp
- [x] Implement `clearSession()` function
  - [x] Remove all session keys from storage
  - [x] Clear userId, dialogId, sessionStart
- [x] Implement `getSessionDuration()` function
  - [x] Calculate duration since session start
  - [x] Return duration in minutes
- [x] Add error handling for storage quota exceeded
- [x] Export all functions

### Utility: `src/utils/learning/formatters.ts`

**Purpose:** Pure formatting helpers for learning interface display

**Depends on:**
- @frontend/src/types/content.ts (DifficultyLevel, ContentType, ContentFormat)
- @frontend/src/types/dialog.ts (DialogType)

- [x] Create `src/utils/learning/formatters.ts` file
- [x] Implement formatting functions:
  - [x] `formatDifficultyLabel(difficulty)` - Human-readable difficulty labels
  - [x] `getDifficultyColor(difficulty)` - Color indicators for difficulty
  - [x] `formatContentTypeLabel(contentType)` - Human-readable content type
  - [x] `formatContentFormatLabel(format)` - Human-readable format
  - [x] `formatDialogTypeLabel(dialogType)` - Human-readable dialog type
  - [x] `getContentTypeIcon(contentType)` - Emoji icons for content types
  - [x] `getDialogTypeIcon(dialogType)` - Emoji icons for dialog types
  - [x] `formatDuration(minutes)` - Human-readable duration (e.g., "2h 5min")
  - [x] `formatProgress(current, total)` - Progress percentage string
  - [x] `formatNumber(num)` - Large numbers with K/M suffixes
  - [x] `formatStreak(streak)` - Streak display with fire emoji
  - [x] `formatAccuracy(correct, total)` - Accuracy percentage
- [x] Export all functions
- [x] Add JSDoc comments with examples

### Utility: `src/utils/learning/mappers.ts`

**Purpose:** Data mapping helpers to convert backend models to UI-friendly shapes

**Depends on:**
- @frontend/src/types/content.ts (ContentItem)
- @frontend/src/types/dialog.ts (Dialog, Message)

- [x] Create `src/utils/learning/mappers.ts` file
- [x] Define UI-friendly interfaces:
  - [x] `ContentSummary` - Simplified content for lists/cards
  - [x] `DialogSummary` - Simplified dialog for headers
  - [x] `MessageDisplay` - UI-ready message data
- [x] Implement mapping functions:
  - [x] `mapContentToSummary(content)` - ContentItem to ContentSummary
  - [x] `mapDialogToSummary(dialog)` - Dialog to DialogSummary
  - [x] `mapMessageToDisplay(message, formatTime)` - Message to MessageDisplay
  - [x] `extractLearningStats(contents)` - Aggregate statistics from content array
  - [x] `groupMessagesBySender(messages)` - Group consecutive messages by sender
  - [x] `extractQuestionAnswerPairs(messages)` - Extract Q&A history
- [x] Export all functions and types
- [x] Add JSDoc comments with examples

### Utility: `src/utils/learning/stateHelpers.ts`

**Purpose:** State and flow decision helpers for learning interface logic

**Depends on:**
- @frontend/src/types/content.ts (ContentItem)
- @frontend/src/types/dialog.ts (Dialog, Message)

- [x] Create `src/utils/learning/stateHelpers.ts` file
- [x] Implement state checking functions:
  - [x] `isSessionActive(dialog)` - Check if dialog session is active
  - [x] `hasHints(content)` - Check if content has hints
  - [x] `hasMoreHints(content, revealedCount)` - Check if more hints available
  - [x] `hasExplanations(content)` - Check if content has explanations
  - [x] `requiresAnswer(content)` - Check if content requires user answer
  - [x] `shouldEnableNext(content, hasSubmitted)` - Determine if "Next" should be enabled
  - [x] `isAnswerValid(answer, contentType)` - Validate answer input
  - [x] `isSessionLong(sessionStart, threshold)` - Check session duration
  - [x] `calculateProgress(completed, total)` - Calculate progress percentage
  - [x] `shouldPromptBreak(sessionStart, completed)` - Determine if break needed
  - [x] `isInteractive(content)` - Check if content requires interaction
  - [x] `hasRecentActivity(messages, threshold)` - Check for recent messages
  - [x] `updateStreak(isCorrect, previousStreak)` - Calculate new streak
  - [x] `shouldShowReferenceAnswer(content, hasSubmitted, isCorrect)` - Determine if reference answer should show
  - [x] `isContentValid(content)` - Validate content has required fields
  - [x] `getCompletionState(content, hasViewed, hasSubmitted)` - Determine completion state
- [x] Export all functions
- [x] Add JSDoc comments with examples

### Utility: `src/utils/learning/index.ts`

**Purpose:** Central export point for all learning utilities

- [x] Create `src/utils/learning/index.ts` file
- [x] Re-export all formatters
- [x] Re-export all mappers with types
- [x] Re-export all state helpers
- [x] Add module documentation

---

## 6. Update Navigation

### Module: `src/components/Navigation.tsx`

**References:**
- Existing Navigation component: @frontend/src/components/Navigation.tsx
- Route structure from Week 4

**Dependencies:**
- **Frontend Components** (Week 4):
  - @frontend/src/components/Navigation.tsx (existing component to update)
- **Frontend Styling** (Week 4):
  - @frontend/src/contexts/ThemeContext.tsx (useTheme)
  - @frontend/src/styles/designTokens.ts
- **Frontend Utils** (Task 5, Week 5):
  - @frontend/src/utils/sessionStorage.ts (optional, for session indicator)
- react-router-dom (useLocation hook)

- [x] Update `src/components/Navigation.tsx` file
- [x] Add active route highlighting
  - [x] Use useLocation hook from react-router-dom
  - [x] Compare current path with route paths
  - [x] Apply different styling to active link
    - Background: primaryLight
    - Text color: primary
    - Border-bottom: 2px solid primary
- [x] Update navigation links
  - [x] Ensure /learn link exists
  - [x] Update link text: "Home", "Learn", "Profile"
  - [x] Add icons to links (optional):
    - 🏠 Home
    - 🎓 Learn
    - 👤 Profile
- [x] Add session indicator (optional enhancement)
  - [x] Display "Session Active" badge when on /learn page
  - [x] Show session duration
  - [x] Use sessionStorage to check session state
- [x] Test navigation between pages
- [x] Verify active state updates correctly

---

## 7. Error Handling Enhancements

### Module: `src/components/ErrorMessage.tsx` (existing)

**References:**
- Existing ErrorMessage component: @frontend/src/components/ErrorMessage.tsx
- Error handling patterns from Week 4

**Dependencies:**
- **Frontend Components** (Week 4):
  - @frontend/src/components/ErrorMessage.tsx (existing component to enhance)
- **Frontend Types** (Week 4):
  - @frontend/src/types/api.ts (ApiError)
- **Frontend Styling** (Week 4):
  - @frontend/src/contexts/ThemeContext.tsx (useTheme)
  - @frontend/src/styles/designTokens.ts

- [x] Review existing ErrorMessage component
- [x] Add new error types if needed
  - [x] SessionExpiredError: Special handling for 404 on dialog
  - [x] NetworkError: Display retry button with exponential backoff
  - [x] ValidationError: Inline field-level errors
- [x] Implement error recovery actions
  - [x] Retry button calls provided retry callback
  - [x] "Start New Session" button for session expired
  - [x] "Go to Home" button for critical errors
- [x] Add error logging
  - [x] Log to console with full error details
  - [x] Optional: Send to error tracking service (future)
- [x] Test error scenarios
  - [x] Network failure
  - [x] API 500 error
  - [x] Session expired (404)
  - [x] Invalid data format

---

## 8. Loading State Improvements

### Module: `src/components/Loading.tsx` (existing)

**References:**
- Existing Loading component: @frontend/src/components/Loading.tsx

**Dependencies:**
- **Frontend Components** (Week 4):
  - @frontend/src/components/Loading.tsx (existing component to enhance)
- **Frontend Styling** (Week 4):
  - @frontend/src/contexts/ThemeContext.tsx (useTheme)
  - @frontend/src/styles/designTokens.ts

- [x] Review existing Loading component
- [x] Add skeleton screen variant for content
  - [x] Create `ContentSkeleton` component
  - [x] Gray pulsing rectangles mimicking content layout
  - [x] Title skeleton (wide rectangle)
  - [x] Body skeleton (multiple lines)
  - [x] Button skeleton at bottom
- [x] Add skeleton for message bubbles
  - [x] `MessageSkeleton` component
  - [x] Pulsing circles and rectangles
  - [x] Alternating left/right alignment
- [x] Update Loading component to accept variant prop
  - [x] 'spinner' (default)
  - [x] 'content' (content skeleton)
  - [x] 'messages' (message skeleton)
- [x] Test loading states in LearningPage
  - [x] Initial page load: Full spinner
  - [x] Content loading: Content skeleton
  - [x] Messages loading: Message skeleton

---

## 9. Styling and Polish

### Module: All components

**References:**
- Design system: @docs/frontend_design_v2.md
- Component patterns: @frontend/.claude/component-style-guide.md
- Design tokens: @frontend/src/styles/designTokens.ts

**Dependencies:**
- **Frontend Styling** (Week 4):
  - @frontend/src/contexts/ThemeContext.tsx (useTheme hook)
  - @frontend/src/styles/designTokens.ts (spacing, colors, fontSize, fontWeight, borderRadius, transition)
- **Frontend Documentation**:
  - @docs/frontend_design_v2.md (design principles)
  - @frontend/.claude/component-style-guide.md (component patterns)

- [x] Apply consistent spacing throughout
  - [x] Use design tokens (spacing.sm, spacing.md, etc.)
  - [x] Consistent margins between sections
  - [x] Consistent padding within cards
- [x] Implement smooth transitions
  - [x] Card hover effects (translateY, boxShadow)
  - [x] Button hover effects (scale, backgroundColor)
  - [x] Accordion expand/collapse (height, opacity)
  - [x] Message appearance (fadeIn, slideUp)
- [x] Add responsive breakpoints
  - [x] Desktop: 1400px max-width, two columns
  - [x] Tablet: 768px - 1399px, narrower columns
  - [x] Mobile: < 768px, stacked layout
  - [x] Use CSS media queries or responsive props
- [x] Ensure dark mode compatibility
  - [x] All components use `useTheme()` hook
  - [x] Test all components in dark mode
  - [x] Verify contrast ratios
- [x] Add loading animations
  - [x] Spinner rotation
  - [x] Skeleton pulsing
  - [x] Button loading state (spinner inside button)
- [x] Polish user interactions
  - [x] Focus states for inputs (outline, border color)
  - [x] Disabled states (opacity, cursor)
  - [x] Hover states (backgroundColor, transform)
  - [x] Active states (scale down on click)
- [x] Add micro-interactions
  - [x] Success checkmark animation on correct answer
  - [x] Error shake animation on incorrect answer
  - [x] Hint reveal animation (slide down)
  - [x] Button click feedback (scale)

---

## 10. Integration Testing

### End-to-End Flow Testing

**References:**
- Backend must be running: `cd backend && uvicorn app.main:app --reload`
- All services from Week 4 functional

**Dependencies:**
- **All Week 5 Components and Hooks** (Tasks 1-9)
- **Backend Server Running**:
  - @backend/app/main.py (FastAPI application)
  - All backend routes operational (@backend/app/api/routes/)
  - Database with content items seeded
- **Frontend Dev Server**:
  - Vite development server running (`npm run dev`)
- Browser DevTools (for network inspection, console logs)

- [ ] Test complete learning session flow
  1. [ ] Navigate to /learn page
  2. [ ] Verify user auto-creation
     - Check network tab for POST /api/v1/users
     - Verify userId stored in sessionStorage
  3. [ ] Verify dialog creation
     - Check network tab for POST /api/v1/dialogs
     - Verify dialogId stored in sessionStorage
  4. [ ] Verify initial recommendation
     - Check network tab for POST /api/v1/recommendations/next
     - Verify content loaded
  5. [ ] Verify content display
     - Content title shown
     - Content body rendered
     - Appropriate component used (LessonViewer, ExerciseCard, QuizCard)
  6. [ ] Test lesson interaction (if lesson type)
     - Read lesson content
     - Click "Continue" button
     - Verify next content requested
  7. [ ] Test exercise interaction (if exercise type)
     - View exercise prompt
     - Request hint (if hints available)
     - Verify hint revealed
     - Enter answer in textarea
     - Submit answer
     - Verify message sent (check network tab)
     - Verify feedback displayed
     - Verify explanation shown
     - Click "Next" button
  8. [ ] Test quiz interaction (if quiz type)
     - View quiz question
     - Select answer option
     - Submit answer
     - Verify correct/incorrect feedback
     - Verify explanation shown
  9. [ ] Test chat interface
     - Verify system message appears
     - Verify user message appears
     - Verify messages auto-scroll
     - Send custom message via input area
  10. [ ] Test session end
      - Click "End Session" button
      - Verify dialog ended (PATCH /api/v1/dialogs/{id}/end)
      - Verify sessionStorage cleared
      - Verify redirect or completion message

- [ ] Test error scenarios
  - [ ] Backend server down
    - Stop backend server
    - Refresh /learn page
    - Verify error message displayed
    - Verify retry button present
  - [ ] Invalid dialog ID
    - Manually set invalid dialogId in sessionStorage
    - Refresh page
    - Verify new dialog created or error shown
  - [ ] Network timeout
    - Simulate slow network (Chrome DevTools)
    - Verify loading states appear
    - Verify timeout error handled
  - [ ] Malformed content data
    - Test with content that has missing fields
    - Verify graceful degradation

- [ ] Test page refresh behavior
  - [ ] Complete learning flow steps 1-6
  - [ ] Refresh page (F5)
  - [ ] Verify session restored
    - userId loaded from sessionStorage
    - dialogId loaded from sessionStorage
    - Dialog reloaded
    - Messages reloaded
    - Last content still displayed
  - [ ] Continue learning session
  - [ ] Verify continuity maintained

- [ ] Test multiple content types
  - [ ] Lesson content
    - Verify LessonViewer renders
    - Verify text formatting
    - Verify "Continue" button works
  - [ ] Exercise content
    - Verify ExerciseCard renders
    - Verify answer input works
    - Verify hint system works
    - Verify explanation shows
  - [ ] Quiz content
    - Verify QuizCard renders
    - Verify option selection works
    - Verify feedback highlighting
    - Verify explanation shows

- [ ] Test different content formats
  - [ ] Text format: Verify text rendering
  - [ ] Visual format: Verify image display (if images available)
  - [ ] Video format: Verify video embed (if videos available)
  - [ ] Interactive format: Verify special rendering

- [ ] Test responsive design
  - [ ] Desktop (1400px+)
    - Verify two-column layout
    - Verify proper spacing
  - [ ] Tablet (768px - 1399px)
    - Verify adjusted columns
    - Verify readable text
  - [ ] Mobile (< 768px)
    - Verify stacked layout
    - Verify content on top, chat below
    - Verify scrolling works
    - Verify input area accessible

- [ ] Test dark mode
  - [ ] Switch to dark mode (toggle in navigation)
  - [ ] Verify all components update colors
  - [ ] Verify readability maintained
  - [ ] Verify message bubbles contrast
  - [ ] Verify content cards visible
  - [ ] Switch back to light mode
  - [ ] Verify smooth transition

- [ ] Performance testing
  - [ ] Load page and measure time to interactive
    - Target: < 2 seconds
  - [ ] Send 50 messages and verify scroll performance
  - [ ] Load 10 different content items
    - Verify React Query caching works
    - Verify no memory leaks
  - [ ] Monitor network requests
    - Verify no duplicate requests
    - Verify proper caching headers

---

## 11. Documentation

### Code Documentation

**Dependencies:**
- **All Week 5 Code** (Tasks 1-9)
- JSDoc syntax standards

- [ ] Add JSDoc comments to custom hooks
  - [ ] Document parameters
  - [ ] Document return types
  - [ ] Include usage examples
  - [ ] Example:
    ```typescript
    /**
     * Custom hook for managing dialog state and operations
     * @returns {UseDialogReturn} Dialog state and functions
     * @example
     * const { dialog, createDialog, loading } = useDialog();
     * await createDialog(userId);
     */
    ```
- [ ] Add component documentation
  - [ ] Document props interfaces
  - [ ] Document key behaviors
  - [ ] Include usage notes
- [ ] Add inline comments for complex logic
  - [ ] Message auto-scroll implementation
  - [ ] Content type routing logic
  - [ ] Answer validation logic

### User-Facing Documentation

- [ ] Update frontend README.md
  - [ ] Add Learning Interface section
  - [ ] Document user flow
  - [ ] Add screenshots (optional)
  - [ ] Document keyboard shortcuts
- [ ] Create developer notes
  - [ ] Document component hierarchy
  - [ ] Document state management approach
  - [ ] Document API integration points
  - [ ] Document styling patterns used

---

## 12. Validation and Sign-off

### Part A Completion Checklist

- [ ] **Custom Hooks Created**: useDialog, useMessages, useContent, useRecommendation
  - All hooks properly typed
  - All hooks use React Query
  - All hooks handle loading/error states
  - All hooks tested with real API calls

- [ ] **Dialog Components Working**: DialogHeader, MessageBubble, MessageList, InputArea, ChatInterface
  - All components render correctly
  - Message display works for user and system messages
  - Auto-scroll to bottom works
  - Input area accepts and sends messages
  - Loading states display properly

- [ ] **Content Components Working**: LessonViewer, ExerciseCard, QuizCard, HintPanel, ExplanationPanel, ContentViewer
  - All content types render correctly (lesson, exercise, quiz)
  - Answer submission works
  - Hint system works (progressive reveal)
  - Feedback display works (correct/incorrect)
  - Explanation display works after answers
  - Content switching works

- [ ] **LearningPage Functional**: Complete orchestration of learning flow
  - Page initializes correctly (user + dialog creation)
  - Initial content loads from recommendation
  - User can interact with content
  - Answer submission triggers metrics and profile update
  - Next content recommendation works
  - Session end works
  - Page refresh preserves session

- [ ] **Utilities Implemented**: contentFormatter, sessionStorage helpers
  - Content data parsing works
  - Timestamp formatting works
  - Session storage functions work
  - Input sanitization works

- [ ] **Error Handling**: All error scenarios handled gracefully
  - Network errors display retry option
  - Session expired creates new session
  - Invalid data shows error message
  - Loading states prevent duplicate submissions

- [ ] **Styling Complete**: Design system v2.0 applied throughout
  - All components use useTheme hook
  - Modern card designs implemented
  - Smooth transitions and animations
  - Responsive layout works on all screen sizes
  - Dark mode fully functional

- [ ] **Integration Tests Pass**: End-to-end flow verified
  - Complete learning session works
  - All content types tested
  - Error scenarios handled
  - Page refresh works
  - Performance acceptable

### Key Validation Questions

- [ ] Can you navigate to /learn and start a learning session?
- [ ] Does the page create a user and dialog automatically?
- [ ] Does the initial content load and display correctly?
- [ ] Can you submit an answer and see feedback?
- [ ] Can you request hints and see them revealed?
- [ ] Can you proceed to the next content after completing one?
- [ ] Does the chat interface show all messages correctly?
- [ ] Can you end a session and start a new one?
- [ ] Does the page work after refreshing (session persistence)?
- [ ] Does the interface work on mobile devices?
- [ ] Does dark mode work for all components?

### Validation Summary

If you can answer "yes" to all validation questions and check all items in the completion checklist, **Week 5 Part A is complete** and you're ready to proceed to Part B enhancements or Week 6 (Dashboard and Visualizations).

---

# Part B: Enhanced Features

These tasks are **beneficial** but can be postponed. They improve user experience and add polish but are not blocking for basic functionality.

---

## 13. Advanced Content Features (Optional)

### Rich Content Support

**Dependencies:**
- **Frontend Components** (Task 3, Week 5):
  - @frontend/src/components/content/LessonViewer.tsx (component to enhance)
- **External Libraries** (to install):
  - react-markdown (for markdown rendering)
  - react-syntax-highlighter (for code highlighting)
  - katex and react-katex (for LaTeX math)
- **Frontend Types** (Week 4):
  - @frontend/src/types/content.ts (ContentItem)

- [ ] Implement markdown rendering for lesson content
  - [ ] Install react-markdown: `npm install react-markdown`
  - [ ] Use ReactMarkdown component in LessonViewer
  - [ ] Support headings, lists, links, emphasis
  - [ ] Add syntax highlighting for code blocks
    - Install: `npm install react-syntax-highlighter`
    - Use for ```code``` blocks
- [ ] Implement LaTeX math rendering
  - [ ] Install KaTeX: `npm install katex react-katex`
  - [ ] Detect math expressions in content (inline: $...$ or block: $$...$$)
  - [ ] Render with KaTeX component
- [ ] Add image zoom/lightbox for visual content
  - [ ] Click image to view full-screen
  - [ ] Overlay with close button
  - [ ] Support image carousel for multiple images

### Interactive Content Elements

**Dependencies:**
- **Frontend Components** (Task 3, Week 5):
  - @frontend/src/components/content/ExerciseCard.tsx (component to enhance)
- **External Libraries** (to install):
  - @monaco-editor/react (for code editor)
  - react-beautiful-dnd (for drag-and-drop)

- [ ] Implement code playground for coding exercises
  - [ ] Use Monaco Editor (VS Code editor): `npm install @monaco-editor/react`
  - [ ] Provide code editor for user input
  - [ ] Support multiple languages (JavaScript, Python, etc.)
  - [ ] Optional: Client-side code execution (sandboxed)
- [ ] Add drag-and-drop for ordering exercises
  - [ ] Install react-beautiful-dnd: `npm install react-beautiful-dnd`
  - [ ] Implement drag-drop for answer ordering
  - [ ] Visual feedback during drag
- [ ] Add drawing canvas for visual exercises
  - [ ] Implement HTML canvas element
  - [ ] Drawing tools (pen, eraser, shapes)
  - [ ] Submit drawing as answer

---

## 14. User Experience Enhancements (Optional)

### Progress Indicators

**Dependencies:**
- **Frontend Pages** (Task 4, Week 5):
  - @frontend/src/pages/LearningPage.tsx (page to enhance)
- **Frontend Components** (Tasks 2-3, Week 5):
  - @frontend/src/components/dialogs/DialogHeader.tsx (for time/streak display)
- **Frontend Styling** (Week 4):
  - @frontend/src/contexts/ThemeContext.tsx (useTheme)
  - @frontend/src/styles/designTokens.ts
- React hooks (useState, useEffect for timers)

- [ ] Add progress bar for multi-step content
  - [ ] Show "Question 3 of 10" indicator
  - [ ] Visual progress bar (filled percentage)
  - [ ] Located above content area
- [ ] Add time spent indicator
  - [ ] Track time on current content
  - [ ] Display "Time spent: 5:32" in header
  - [ ] Use setInterval to update every second
- [ ] Add streak counter
  - [ ] Track consecutive correct answers
  - [ ] Display "🔥 5 streak!" badge
  - [ ] Reset on incorrect answer

### Keyboard Shortcuts

**Dependencies:**
- **Frontend Pages** (Task 4, Week 5):
  - @frontend/src/pages/LearningPage.tsx (page to enhance)
- React hooks (useEffect, useCallback for event listeners)

- [ ] Implement keyboard shortcuts for common actions
  - [ ] Ctrl/Cmd + Enter: Submit answer
  - [ ] Ctrl/Cmd + H: Request hint
  - [ ] Ctrl/Cmd + N: Next content
  - [ ] Escape: Close modals/panels
  - [ ] Arrow keys: Navigate between options in quiz
- [ ] Add shortcut help panel
  - [ ] Press "?" to show shortcuts overlay
  - [ ] List all available shortcuts
  - [ ] Styled modal with keyboard icons

### Animations and Feedback

**Dependencies:**
- **Frontend Components** (Tasks 2-3, Week 5):
  - @frontend/src/components/content/ContentViewer.tsx (for answer feedback)
  - @frontend/src/components/dialogs/ChatInterface.tsx (for typing indicator)
- **External Libraries** (to install):
  - react-confetti (for celebration animation)
- **Frontend Styling** (Week 4):
  - @frontend/src/styles/designTokens.ts (for CSS animations)

- [ ] Add success animation on correct answer
  - [ ] Confetti animation: `npm install react-confetti`
  - [ ] Brief celebration on correct answers
  - [ ] Sound effect (optional)
- [ ] Add shake animation on incorrect answer
  - [ ] CSS animation: shake horizontally
  - [ ] Red flash effect
- [ ] Add typing indicator for system messages
  - [ ] "..." animation while system is "thinking"
  - [ ] Appears before system message shows
  - [ ] Gives more natural conversation feel

---

## 15. Offline Support (Optional)

### Service Worker and Caching

**Dependencies:**
- **External Libraries** (to install):
  - workbox-webpack-plugin (for service worker)
- **Frontend App Config**:
  - Vite configuration (vite.config.ts)
- Browser Service Worker API
- Browser IndexedDB API (for offline queue)

- [ ] Implement service worker for offline functionality
  - [ ] Use Workbox: `npm install workbox-webpack-plugin`
  - [ ] Cache static assets (JS, CSS, fonts)
  - [ ] Cache API responses for read operations
  - [ ] Serve cached content when offline
- [ ] Add offline indicator
  - [ ] Detect navigator.onLine status
  - [ ] Show banner when offline: "You're offline. Some features may not work."
  - [ ] Update banner when back online
- [ ] Queue actions when offline
  - [ ] Store messages in IndexedDB when offline
  - [ ] Sync to server when back online
  - [ ] Show "pending" indicator on queued messages

---

## 16. Accessibility Enhancements (Optional)

### ARIA and Keyboard Navigation

**Dependencies:**
- **All Frontend Components** (Tasks 1-9, Week 5)
- WAI-ARIA specifications
- Accessibility testing tools (screen readers)

- [ ] Add ARIA labels to all interactive elements
  - [ ] aria-label for icon buttons
  - [ ] aria-describedby for form inputs
  - [ ] role="region" for content sections
- [ ] Implement skip navigation links
  - [ ] "Skip to content" link at top
  - [ ] Keyboard shortcut to jump to main content
- [ ] Add keyboard focus indicators
  - [ ] Visible outline on all focusable elements
  - [ ] Custom focus styles matching theme
  - [ ] Focus trap in modals

### Screen Reader Support

- [ ] Add live regions for dynamic content
  - [ ] aria-live="polite" for new messages
  - [ ] Announce feedback ("Correct!" or "Try again")
  - [ ] Announce content changes
- [ ] Add descriptive alt text for all images
  - [ ] Meaningful descriptions, not just "image"
  - [ ] Describe content of diagrams
- [ ] Test with screen readers
  - [ ] NVDA (Windows)
  - [ ] JAWS (Windows)
  - [ ] VoiceOver (Mac/iOS)

---

## 17. Analytics and Tracking (Optional)

### User Interaction Tracking

**Dependencies:**
- **Frontend Pages** (Task 4, Week 5):
  - @frontend/src/pages/LearningPage.tsx (page to add tracking)
- **Backend API** (future enhancement):
  - New analytics endpoint (to be created)
- React hooks (useEffect for tracking events)

- [ ] Track user interactions for analytics
  - [ ] Time spent on each content item
  - [ ] Hint requests per content
  - [ ] Answer attempts before success
  - [ ] Content completion rate
- [ ] Send analytics events to backend
  - [ ] Create analytics endpoint in backend (future)
  - [ ] Batch events and send periodically
  - [ ] Store analytics data in database
- [ ] Display analytics in profile page (Week 6)
  - [ ] Total time spent learning
  - [ ] Topics mastered
  - [ ] Accuracy rate
  - [ ] Favorite content format

---

## 18. Social and Gamification Features (Optional)

### Achievements and Badges

**Dependencies:**
- **Frontend Pages** (Task 4, Week 5):
  - @frontend/src/pages/LearningPage.tsx (for achievement triggers)
  - @frontend/src/pages/ProfilePage.tsx (for badge display - Week 6)
- **Backend API** (future enhancement):
  - Achievement definitions and storage
  - User achievement tracking
- **Frontend Styling** (Week 4):
  - @frontend/src/contexts/ThemeContext.tsx (useTheme)
  - @frontend/src/styles/designTokens.ts

- [ ] Implement achievement system
  - [ ] Define achievements (first correct answer, 10 in a row, etc.)
  - [ ] Check achievements after each interaction
  - [ ] Display achievement unlocked toast
  - [ ] Store achievements in user profile
- [ ] Create badge display component
  - [ ] Show earned badges in profile
  - [ ] Grid layout with badge icons
  - [ ] Tooltip with badge description
- [ ] Add leaderboard (future: requires multiple users)
  - [ ] Top users by accuracy
  - [ ] Top users by streak
  - [ ] Top users by time spent

---

## 19. Testing Framework Setup (Optional)

### Unit and Integration Tests

**Dependencies:**
- **Testing Libraries** (Week 4):
  - Vitest (already installed)
  - @testing-library/react (for component testing)
  - @testing-library/jest-dom (for assertions)
- **All Frontend Code** (Tasks 1-9, Week 5)
- **Mock Data**: Test fixtures for Dialog, Message, ContentItem, etc.

- [ ] Set up Vitest for component testing
  - [ ] Already installed in Week 4
  - [ ] Configure for React components
- [ ] Write tests for custom hooks
  - [ ] Test useDialog hook
    - Test createDialog function
    - Test loading states
    - Test error handling
  - [ ] Test useMessages hook
    - Test sendMessage function
    - Test optimistic updates
  - [ ] Test useContent hook
    - Test loadContent function
- [ ] Write tests for components
  - [ ] Test MessageBubble rendering
  - [ ] Test InputArea interactions
  - [ ] Test ContentViewer content type routing
  - [ ] Test HintPanel accordion
- [ ] Write integration tests for LearningPage
  - [ ] Test initialization flow
  - [ ] Test answer submission flow
  - [ ] Test next content flow

### End-to-End Tests

**Dependencies:**
- **E2E Testing Libraries** (to install):
  - Playwright or Cypress
- **Backend Server**: Running instance with test database
- **Frontend App**: Built and running in test mode
- **All Week 5 Features** (Tasks 1-9)

- [ ] Set up Playwright or Cypress
  - [ ] Install: `npm install -D @playwright/test` or `npm install -D cypress`
  - [ ] Configure for TypeScript
- [ ] Write E2E tests for learning flow
  - [ ] Test: User can complete learning session
  - [ ] Test: User can submit answers
  - [ ] Test: User can request hints
  - [ ] Test: Session persists on refresh
- [ ] Run E2E tests in CI pipeline (future)

---

## 20. Performance Optimization (Optional)

### Code Splitting and Lazy Loading

**Dependencies:**
- **Frontend App Config**:
  - Vite configuration (vite.config.ts)
  - React lazy loading (React.lazy, Suspense)
- **Frontend Components** (Week 4):
  - @frontend/src/components/Loading.tsx (for Suspense fallback)
- **Build Tools**:
  - rollup-plugin-visualizer (for bundle analysis)

- [ ] Implement route-based code splitting
  - [ ] Use React.lazy() for route components
  - [ ] Example:
    ```typescript
    const LearningPage = React.lazy(() => import('./pages/LearningPage'));
    ```
  - [ ] Wrap in Suspense with Loading fallback
- [ ] Lazy load heavy components
  - [ ] Monaco Editor (code playground)
  - [ ] Rich text editor
  - [ ] Chart libraries (for Week 6)
- [ ] Analyze bundle size
  - [ ] Use Vite bundle analyzer: `npm install -D rollup-plugin-visualizer`
  - [ ] Identify large dependencies
  - [ ] Consider alternatives for large libraries

### React Query Optimization

**Dependencies:**
- **Frontend Hooks** (Task 1, Week 5):
  - All custom hooks using React Query
- @tanstack/react-query (QueryClient configuration)

- [ ] Fine-tune React Query cache settings
  - [ ] Set appropriate staleTime for each query
    - Content: 10 minutes (static)
    - Messages: 30 seconds (dynamic)
    - Dialog: 5 minutes
  - [ ] Set gcTime (garbage collection)
    - Keep important data longer
  - [ ] Implement cache invalidation strategy
- [ ] Implement optimistic updates for better UX
  - [ ] Message sending: Show immediately, confirm later
  - [ ] Answer submission: Show feedback immediately
- [ ] Prefetch next content
  - [ ] After answer submission, prefetch next recommendation
  - [ ] Faster transition to next content

### Image Optimization

**Dependencies:**
- **Frontend Components** (Task 3, Week 5):
  - @frontend/src/components/content/LessonViewer.tsx (for image rendering)
- **Build Tools**:
  - Image optimization plugins for Vite
- Browser APIs (Intersection Observer for lazy loading)

- [ ] Optimize images if using visual content
  - [ ] Use responsive images (srcset)
  - [ ] Lazy load images below fold
  - [ ] Compress images (WebP format)
  - [ ] Use CDN for image delivery (future)

---

## Part B Validation (Optional)

If you complete any of Part B, verify:

- [ ] **Rich Content**: Markdown, LaTeX, images render correctly
- [ ] **Interactive Elements**: Code editor, drag-drop, drawing canvas work
- [ ] **UX Enhancements**: Progress bar, shortcuts, animations smooth
- [ ] **Offline Support**: Service worker caches, offline indicator works
- [ ] **Accessibility**: Screen reader compatible, keyboard navigable
- [ ] **Analytics**: Events tracked and sent to backend
- [ ] **Gamification**: Achievements unlock, badges display
- [ ] **Testing**: Test suite runs and passes
- [ ] **Performance**: Bundle size reasonable, load time < 2s

---

## Deliverable

By the end of Week 5, you should have:

### Part A (Required):
✅ **Custom Hooks**: useDialog, useMessages, useContent, useRecommendation for data management
✅ **Dialog Components**: ChatInterface with MessageList, MessageBubble, InputArea for conversation UI
✅ **Content Components**: ContentViewer with LessonViewer, ExerciseCard, QuizCard, HintPanel, ExplanationPanel
✅ **Learning Page**: Fully functional /learn route orchestrating complete learning experience
✅ **User Flow**: User creation → Dialog creation → Content recommendation → Interaction → Feedback → Next content
✅ **Session Management**: Session persistence via sessionStorage, page refresh support
✅ **Error Handling**: Graceful error display and recovery for all scenarios
✅ **Responsive Design**: Mobile, tablet, desktop layouts with stacked/column approach
✅ **Dark Mode**: All components theme-aware and tested in both themes
✅ **Integration**: Backend API calls working for dialogs, messages, content, recommendations

### Part B (Optional):
- Rich content rendering (Markdown, LaTeX, images)
- Interactive elements (code editor, drag-drop)
- UX enhancements (progress bar, keyboard shortcuts, animations)
- Offline support (service worker, caching)
- Accessibility improvements (ARIA, screen reader)
- Analytics tracking
- Gamification features (achievements, badges)
- Testing framework (unit tests, E2E tests)
- Performance optimizations (code splitting, caching)

---

## Dependencies

**Must be completed before Week 5**:
- Week 4 deliverables:
  - ✅ React frontend setup with TypeScript and Vite
  - ✅ Service layer (dialogService, contentService, userService, recommendationService)
  - ✅ Type definitions (Dialog, Message, ContentItem, Recommendation)
  - ✅ API client with interceptors
  - ✅ React Query provider configured
  - ✅ Routing setup with /learn route
  - ✅ Error and Loading components
  - ✅ Theme system with dark mode

**Enables Week 6**:
- Week 6 (Dashboard and Visualizations) depends on:
  - Learning interface functional
  - User can complete learning sessions
  - Metrics being generated in backend
  - User profile being updated
  - Learning history available via API

---

## Notes

- **Focus on Core Flow First** - Complete Part A before considering Part B
- Start with static/hardcoded data to build UI, then integrate with real API
- Test each component independently before integration
- Use React Query DevTools to debug caching issues
- Keep backend running during development (`uvicorn app.main:app --reload`)
- Use browser DevTools Network tab to verify API calls
- Test on multiple browsers (Chrome, Firefox, Safari)
- Consider accessibility from the start (semantic HTML, ARIA labels)
- Document complex logic with inline comments
- Commit frequently with descriptive messages

**Learning Interface Philosophy:**
- Make it feel like a conversation, not a form
- Provide immediate feedback (optimistic updates)
- Guide users with hints, don't frustrate
- Celebrate successes (positive reinforcement)
- Make errors feel like learning opportunities
- Keep the interface clean and focused
- Reduce cognitive load (one content at a time)

---

## Estimated Time Breakdown

**Part A (Required)**: 3-4 days
- Day 1: Custom hooks + utility functions (Tasks 1, 5)
- Day 2: Dialog components (Task 2)
- Day 3: Content components (Task 3)
- Day 4: LearningPage integration + testing (Tasks 4, 6-10)

**Part B (Optional)**: 2-3 days (can be done later)
- Rich content and interactivity: 1 day
- UX enhancements and animations: 1 day
- Testing and optimization: 1 day

---

## Troubleshooting

**Issue**: Messages not displaying in chat
- **Solution**: Check dialogId is correctly passed to ChatInterface, verify getDialogMessages API call succeeds, check messages array in React Query cache

**Issue**: Content not loading after recommendation
- **Solution**: Verify recommendation returns content object with content_id, check getContentById API call, verify content exists in backend database

**Issue**: Auto-scroll not working
- **Solution**: Ensure scrollRef.current exists before calling scrollIntoView, check that scrollBehavior is set to 'smooth', verify container has overflow-y: auto

**Issue**: Hints not revealing progressively
- **Solution**: Check revealedHintCount state updates correctly, verify hints array from backend has multiple items, check HintPanel receives correct props

**Issue**: Session not persisting on refresh
- **Solution**: Verify sessionStorage.setItem is called after user/dialog creation, check sessionStorage.getItem retrieves correctly, ensure session cleared only on explicit logout

**Issue**: Dark mode not applying to new components
- **Solution**: Ensure all components import and use useTheme() hook, verify colors object is destructured from useTheme(), check that hard-coded colors are replaced with theme colors

**Issue**: Answer submission not triggering metrics
- **Solution**: Verify POST to /api/v1/dialogs/{id}/messages succeeds, check backend logs for metrics computation, verify user_profile is updated in database (@backend/app/core/metrics/)

**Issue**: Recommendation returns same content repeatedly
- **Solution**: Check backend adaptation engine is running, verify user profile is being updated with metrics, check recommendation strategy in backend (@backend/app/core/adaptation/engine.py)

**Issue**: Mobile layout broken
- **Solution**: Verify CSS media queries are correct, check flexbox/grid properties for responsive behavior, test on actual mobile device or Chrome DevTools device emulation

**Issue**: Performance slow with many messages
- **Solution**: Implement message virtualization (react-window), limit displayed messages (show last 50, load more on scroll), optimize React Query cache size

---

**Good luck with Week 5!** 🎓

This week brings the application to life with interactive learning. Focus on the core experience first, then add polish and enhancements as time permits.
