# Week 6: Dashboard and Visualizations

## Overview

Week 6 focuses on building the **student dashboard** with progress tracking, metrics visualization, and user profile management. The main goal is to create an intuitive interface that displays learning analytics, topic mastery, session history, and personalized recommendations. This week completes the core user-facing frontend by adding data visualization and progress tracking to the learning experience.

---

## General Specifications

### Architecture & Technology Stack

**Component Architecture:**
- React 18+ with TypeScript and functional components
- Data visualization using Recharts library
- Custom hooks for metrics and profile data
- React Query for server state and caching
- Reusable metric components (cards, charts, indicators)

**State Management Strategy:**
- **Server State**: React Query for profile, metrics, dialogs, recommendations
- **Local UI State**: useState for chart controls, filters, edit mode
- **Computed State**: Derived metrics (streak, averages, trends) calculated from profile data
- **Real-time Updates**: Optimistic updates for profile edits

**Routing Structure:**
- Dashboard at `/` or `/dashboard` route
- Profile page at `/profile` route
- Navigation integration with active state indicators

**Data Flow:**
```
User Profile → Aggregate Metrics → Visualizations → User Actions
     ↓               ↓                    ↓              ↓
Profile API    Topic Mastery         Charts/Cards    API Updates
```

### Code Organization

**Directory Structure:**
```
frontend/src/
├── components/
│   ├── metrics/          # Dashboard visualization components
│   │   ├── MasteryIndicator.tsx
│   │   ├── ProgressChart.tsx
│   │   ├── StatCard.tsx
│   │   └── ActivityFeed.tsx
│   ├── profile/          # Profile management components
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfileStats.tsx
│   │   └── PreferencesEditor.tsx
│   └── shared/           # Reusable components
├── pages/
│   ├── Dashboard.tsx     # Main dashboard page
│   └── ProfilePage.tsx   # User profile page
├── hooks/
│   ├── useUserProfile.ts
│   └── useMetrics.ts     # Optional: metrics aggregation
├── utils/
│   ├── metrics/          # Metric calculation utilities
│   │   ├── aggregators.ts
│   │   └── formatters.ts
│   └── charts/           # Chart configuration utilities
└── types/                # Type definitions (from Week 4)
```

**Component Hierarchy:**
```
Dashboard
  ├── StatCard (multiple - time, accuracy, streak, interactions)
  ├── ActivityFeed (recent sessions)
  ├── MasteryIndicator (multiple - per topic)
  ├── ProgressChart (accuracy/time over time)
  └── RecommendationCards (next content suggestions)

ProfilePage
  ├── ProfileHeader (avatar, name, join date)
  ├── ProfileStats (aggregated learning data)
  ├── MasteryIndicator (all topics)
  └── PreferencesEditor (edit preferences)
```

**Naming Conventions:**
- Metric components: Descriptive names (e.g., `MasteryIndicator`, `StatCard`, `ProgressChart`)
- Hooks: camelCase with "use" prefix (e.g., `useUserProfile`, `useMetrics`)
- Props interfaces: Component name + "Props" (e.g., `MasteryIndicatorProps`)
- Chart data: "ChartData" suffix (e.g., `AccuracyChartData`)

### Styling Approach

**Design System v2.0 Implementation:**
- All components use `useTheme()` hook for theme-aware styling
- Follow modern card design patterns from component style guide
- Use design tokens for spacing, colors, typography
- Implement smooth transitions for chart interactions
- Mobile-responsive grid layouts

**Component-Specific Styling:**
- **StatCards**: Elevated cards with icons, large numbers, subtle gradients
- **Charts**: Theme-aware colors, responsive sizing, interactive tooltips
- **Mastery bars**: Color-coded (red/yellow/green) progress bars
- **Activity feed**: Timeline design with icons and timestamps
- **Profile sections**: Card-based layout with clear separation

**Data Visualization Colors:**
- Success (high mastery): `designTokens.colors.success`
- Warning (medium mastery): `designTokens.colors.warning`
- Error (low mastery): `designTokens.colors.error`
- Primary (general data): `designTokens.colors.primary`
- Chart gradients: Smooth transitions between theme colors

**Accessibility:**
- Semantic HTML for data tables (alternative to charts)
- ARIA labels for chart elements
- Keyboard navigation for chart controls
- Screen reader announcements for metric updates
- Color-blind friendly palette with patterns/textures

### TypeScript Standards

**Metric Data Interfaces:**
```typescript
interface DashboardStats {
  totalTime: number;
  totalInteractions: number;
  avgAccuracy: number;
  currentStreak: number;
}

interface TopicMastery {
  topic: string;
  subtopic?: string;
  mastery: number; // 0-1
  lastPracticed: string;
}

interface ActivitySession {
  dialogId: number;
  topic: string;
  startedAt: string;
  endedAt?: string;
  accuracy?: number;
  duration: number;
}
```

**Chart Data Types:**
```typescript
interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface AccuracyChartData extends ChartDataPoint {
  accuracy: number;
}

interface TimeChartData extends ChartDataPoint {
  timeSpent: number;
}
```

**Type Safety Requirements:**
- All chart data properly typed
- No `any` types in visualization code
- Strict null checks for missing data
- Type guards for data validation
- Generic types for reusable chart components

### Backend Integration

**API Workflow for Dashboard:**

1. **Load Dashboard** (on page mount):
   - Get userId from sessionStorage
   - Fetch user profile via `GET /api/v1/user-profiles/user/{user_id}`
   - Fetch recent dialogs via `GET /api/v1/dialogs` (filter by user)
   - Get recommendations via `POST /api/v1/recommendations/next`

2. **Profile Data Structure**:
   - `UserProfile.topic_mastery`: JSONB object {topic: mastery_value}
   - `UserProfile.total_time_spent`: Total minutes
   - `UserProfile.total_interactions`: Total message count
   - `UserProfile.avg_accuracy`: Average accuracy (0-1)
   - `UserProfile.preferred_format`, `current_difficulty`, `learning_pace`

3. **Metrics Calculation**:
   - Streak: Calculate from dialog dates (consecutive days)
   - Topic mastery: Direct from `UserProfile.topic_mastery`
   - Activity feed: Recent dialogs sorted by `started_at`
   - Progress over time: May need new endpoint for historical metrics

4. **Profile Updates**:
   - Edit preferences via `PATCH /api/v1/user-profiles/{profile_id}`
   - Update preferred_format, learning_pace, etc.
   - Optimistic update in UI, rollback on error

**Key Endpoints Used:**
- `GET /api/v1/user-profiles/user/{user_id}` - Get user profile
- `PATCH /api/v1/user-profiles/{profile_id}` - Update profile (may need to create)
- `GET /api/v1/dialogs` - Get dialog history
- `POST /api/v1/recommendations/next` - Get recommendations
- Optional: `GET /api/v1/metrics/user/{user_id}/history` - Historical metrics

**Data Schemas:**
- UserProfile: @backend/app/schemas/user_profile.py
- Dialog: @backend/app/schemas/dialog.py
- Recommendation: @backend/app/schemas/recommendation.py

### Error Handling

**Error Scenarios:**
1. **No Profile Data**: New user with no learning history
2. **Empty Metrics**: No topic_mastery data yet
3. **API Errors**: Profile fetch failure
4. **Invalid Data**: Malformed topic_mastery JSON
5. **Update Failures**: Profile edit save failure

**Error Display Strategy:**
- Empty states: "Start learning to see your progress"
- API errors: ErrorMessage component with retry
- Partial data: Show available data, hide missing sections
- Graceful degradation: Charts show placeholder when no data

**Loading States:**
- Initial page load: Skeleton screens for cards and charts
- Profile update: Loading indicator on save button
- Chart data loading: Pulsing skeleton chart
- Background refetch: Subtle loading indicator

### Development Workflow

**Component Development Approach:**
1. Start with static mock data for each metric
2. Add TypeScript interfaces for data shapes
3. Implement basic rendering with theme styling
4. Integrate with React Query hooks
5. Add loading and error states
6. Implement interactivity (chart controls, filters)
7. Apply responsive design
8. Test with real backend data

**Testing Strategy:**
- Manual testing with seeded profile data
- Test empty states (new user)
- Test with various mastery levels
- Test chart responsiveness
- Test dark mode for all visualizations
- Test profile edit flow

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
- Single Responsibility: Each chart/card component focuses on one metric
- Composition: Build complex dashboard from simple components
- Reusability: StatCard component reused for all stat displays
- DRY: Extract chart configuration to utilities
- Performance: Memoize expensive calculations with useMemo

**React Patterns:**
- Memoize chart components to prevent unnecessary re-renders
- Debounce chart filter changes
- Use React Query for all API calls
- Implement optimistic updates for profile edits
- Clean up chart event listeners

**Data Visualization Best Practices:**
- Show data in context (comparisons, trends)
- Use consistent color coding across all charts
- Provide tooltips for detailed information
- Make charts interactive (hover, click)
- Support keyboard navigation for chart controls
- Provide text alternatives for accessibility

### Important Resources

**Design References:**
- Design system: `@docs/frontend_design_v2.md`
- Component patterns: `@frontend/.claude/component-style-guide.md`
- Design tokens: `@frontend/src/styles/designTokens.ts`
- Theme context: `@frontend/src/contexts/ThemeContext.tsx`

**Backend References:**
- User profile routes: `@backend/app/api/routes/user_profiles.py`
- Dialog routes: `@backend/app/api/routes/dialogs.py`
- Recommendation routes: `@backend/app/api/routes/recommendations.py`
- User profile schema: `@backend/app/schemas/user_profile.py`

**Week 5 Deliverables (Prerequisites):**
- Learning interface: `@frontend/src/pages/LearningPage.tsx`
- Custom hooks: `@frontend/src/hooks/` (useDialog, useContent, useRecommendation)
- Service layer: `@frontend/src/services/` (working API integration)
- Type definitions: `@frontend/src/types/` (User, UserProfile, Dialog)
- Session management: SessionStorage utilities

**External Libraries:**
- Recharts: `npm install recharts` (for charts)
- date-fns: (already installed, for date formatting)

---

## Part A: Basic Minimum

### 1. Student Dashboard Page

**Module:** `src/pages/Dashboard.tsx`

**Dependencies:**
- Frontend hooks (Week 5): @frontend/src/hooks/useContent.ts, @frontend/src/hooks/useRecommendation.ts
- Frontend services (Week 4): @frontend/src/services/userService.ts
- Frontend types (Week 4): @frontend/src/types/user.ts, @frontend/src/types/content.ts
- Backend API: @backend/app/api/routes/user_profiles.py, @backend/app/api/routes/recommendations.py

- [x] Create Dashboard page component
  - **File:** `frontend/src/pages/Dashboard.tsx` (new)
  - [x] Import useTheme for styling
    - **Source:** `frontend/src/contexts/ThemeContext.tsx`
  - [x] Import design tokens
    - **Source:** `frontend/src/styles/designTokens.ts`
  - [x] Create page layout (header, grid sections)
  - [x] Add user greeting with avatar/icon
  - [x] Display username and basic info
    - **Type:** `User` from `frontend/src/types/user.ts`

- [x] Implement dashboard initialization
  - **Hook:** Use custom hooks or React Query in `frontend/src/pages/Dashboard.tsx`
  - [x] Fetch user profile on mount
    - **API:** `GET /api/v1/user-profiles/user/{user_id}` via `frontend/src/services/userService.ts` → `getUserProfile()`
    - **Backend:** `backend/app/api/routes/user_profiles.py`
    - **Type:** `UserProfile` from `frontend/src/types/user.ts`
  - [x] Fetch recent learning activity
    - **API:** May need new endpoint or extract from dialogs: `GET /api/v1/dialogs` via `frontend/src/services/dialogService.ts`
    - **Backend:** `backend/app/api/routes/dialogs.py`
  - [x] Fetch topic mastery data
    - **Data:** Available in `UserProfile.topic_mastery` (Record<string, number>)
  - [x] Handle loading states
    - **Component:** Use `frontend/src/components/Loading.tsx` or skeleton screens
  - [x] Handle error states
    - **Component:** `frontend/src/components/ErrorMessage.tsx`

- [x] Create overview section
  - **Location:** `frontend/src/pages/Dashboard.tsx` (section within page)
  - [x] Total learning time (hours)
    - **Data:** `UserProfile.total_time_spent` from `frontend/src/types/user.ts`
  - [x] Total interactions count
    - **Data:** `UserProfile.total_interactions` from `frontend/src/types/user.ts`
  - [x] Current streak (consecutive days)
    - **Note:** May need to calculate from dialog history or add to backend
  - [x] Average accuracy percentage
    - **Data:** `UserProfile.avg_accuracy` from `frontend/src/types/user.ts`
  - [x] Display as stat cards with icons

- [x] Create recent activity feed
  - **Location:** `frontend/src/pages/Dashboard.tsx` (section within page)
  - [x] List last 5-10 learning sessions
    - **API:** `GET /api/v1/dialogs` via `frontend/src/services/dialogService.ts`
    - **Backend:** `backend/app/api/routes/dialogs.py`
    - **Type:** `Dialog[]` from `frontend/src/types/dialog.ts`
  - [x] Show date, topic, duration
  - [x] Show accuracy for each session
  - [x] Link to continue session (if available)
    - **Route:** Link to `/learn` page (`frontend/src/pages/LearningPage.tsx`)

- [x] Create recommended lessons section
  - **Location:** `frontend/src/pages/Dashboard.tsx` (section within page)
  - [x] Fetch next 3 recommendations
    - **Hook:** `useRecommendation` from `frontend/src/hooks/useRecommendation.ts`
    - **API:** `GET /api/v1/recommendations/next` via `frontend/src/services/recommendationService.ts`
    - **Backend:** `backend/app/api/routes/recommendations.py`
    - **Type:** `Recommendation` from `frontend/src/types/recommendation.ts`
  - [x] Display as cards with title, topic, difficulty
  - [x] Add "Start Learning" button
    - **Action:** Navigate to `/learn` with content_id
  - [x] Show recommendation reasoning (optional tooltip)
    - **Data:** `Recommendation.reasoning` field

- [x] Apply responsive layout
  - **File:** `frontend/src/pages/Dashboard.tsx`
  - **Styling:** Use `designTokens` from `frontend/src/styles/designTokens.ts`
  - [x] Desktop: Multi-column grid
  - [x] Tablet: Two columns
  - [x] Mobile: Single column stack
  - [x] Consistent spacing and padding

### 2. Topic Mastery Display

**Module:** `src/components/metrics/MasteryIndicator.tsx`

**Dependencies:**
- Frontend types (Week 4): @frontend/src/types/user.ts (UserProfile with topic_mastery)
- Frontend styling (Week 4): @frontend/src/contexts/ThemeContext.tsx, @frontend/src/styles/designTokens.ts
- Backend schema: @backend/app/schemas/user_profile.py (topic_mastery JSONB structure)

- [x] Create MasteryIndicator component
  - **File:** `frontend/src/components/metrics/MasteryIndicator.tsx` (new)
  - **Directory:** Create `frontend/src/components/metrics/` if not exists
  - [x] Define props: topic (string), mastery (number 0-1), onViewDetails?
    - **Props interface:** Define `MasteryIndicatorProps` in same file
  - [x] Display topic name with icon
  - [x] Create visual mastery bar
    - [x] Horizontal progress bar
    - [x] Width based on mastery percentage
    - [x] Color coding: red (<0.4), yellow (0.4-0.7), green (>0.7)
      - **Colors:** Use `designTokens.colors` from `frontend/src/styles/designTokens.ts`
  - [x] Display mastery percentage text

- [x] Add mastery level labels
  - **File:** `frontend/src/components/metrics/MasteryIndicator.tsx`
  - [x] Struggling: <0.4 (red)
  - [x] Learning: 0.4-0.7 (yellow)
  - [x] Mastered: >0.7 (green)
  - [x] Display label next to bar

- [x] Add hover effects
  - **File:** `frontend/src/components/metrics/MasteryIndicator.tsx`
  - [x] Tooltip on hover showing exact value
  - [x] Show subtopics if available
  - [x] Smooth transition on hover
    - **Hook:** May use `useAnimation` from `frontend/src/hooks/useAnimation.ts`

- [x] Style with modern design
  - **File:** `frontend/src/components/metrics/MasteryIndicator.tsx`
  - **Styling:** Use theme from `frontend/src/contexts/ThemeContext.tsx`
  - [x] Elevated card per topic
  - [x] 16px border radius
  - [x] Shadow effect
  - [x] Spacing between topics

- [x] Handle edge cases
  - **File:** `frontend/src/components/metrics/MasteryIndicator.tsx`
  - [x] No mastery data (new user) → Show "No data yet"
  - [x] Empty topic_mastery → Display placeholder
  - [x] Invalid mastery value → Clamp to 0-1

### 3. Progress Chart Component

**Module:** `src/components/metrics/ProgressChart.tsx`

**Dependencies:**
- Chart library: recharts (to install)
- Frontend types (Week 4): @frontend/src/types/user.ts
- Frontend styling (Week 4): useTheme, designTokens

- [x] Install chart library
  - **Command:** `cd frontend && npm install recharts`
  - **File:** Update `frontend/package.json`
  - [x] Run: `npm install recharts`
  - [x] Verify installation

- [x] Create ProgressChart component
  - **File:** `frontend/src/components/metrics/ProgressChart.tsx` (new)
  - **Directory:** Create `frontend/src/components/metrics/` if not exists
  - [x] Define props: data (array of {date, accuracy, time_spent}), chartType
    - **Props interface:** Define `ProgressChartProps` in same file
    - **Data source:** May need new API endpoint for metrics history
  - [x] Import Recharts components (LineChart, BarChart, etc.)
    - **Import:** `import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'`
  - [x] Set up responsive container

- [x] Implement accuracy over time chart
  - **File:** `frontend/src/components/metrics/ProgressChart.tsx`
  - [x] LineChart showing accuracy (0-100%) over dates
  - [x] X-axis: dates (last 7/14/30 days)
  - [x] Y-axis: accuracy percentage
  - [x] Color: success color for line
    - **Color:** Use `designTokens.colors.success` from `frontend/src/styles/designTokens.ts`
  - [x] Smooth curve
  - [x] Dots on data points

- [x] Implement time spent chart
  - **File:** `frontend/src/components/metrics/ProgressChart.tsx`
  - [x] BarChart showing minutes per day
  - [x] X-axis: dates
  - [x] Y-axis: time in minutes
  - [x] Color: primary color for bars
    - **Color:** Use `designTokens.colors.primary` from `frontend/src/styles/designTokens.ts`
  - [x] Tooltip on hover

- [x] Add chart controls
  - **File:** `frontend/src/components/metrics/ProgressChart.tsx`
  - [x] Toggle between chart types (accuracy/time)
  - [x] Time range selector (7d, 30d, 90d)
  - [x] Update chart data on selection

- [x] Style charts with theme
  - **File:** `frontend/src/components/metrics/ProgressChart.tsx`
  - **Theme:** Use `useTheme` hook from `frontend/src/contexts/ThemeContext.tsx`
  - [x] Use theme colors for lines/bars
  - [x] Match font styles
  - [x] Responsive sizing
  - [x] Grid lines for readability

- [x] Handle empty data
  - **File:** `frontend/src/components/metrics/ProgressChart.tsx`
  - [x] Display "No data available" message
  - [x] Show placeholder chart with dummy data
  - [x] Encourage user to start learning

### 4. User Profile Page

**Module:** `src/pages/ProfilePage.tsx`

**Dependencies:**
- Frontend services (Week 4): @frontend/src/services/userService.ts
- Frontend types (Week 4): @frontend/src/types/user.ts
- Frontend styling (Week 4): useTheme, designTokens

- [x] Create ProfilePage component
  - **File:** `frontend/src/pages/ProfilePage.tsx` (may already exist, update/enhance)
  - [x] Import necessary hooks and services
    - **Services:** `frontend/src/services/userService.ts`
    - **Hooks:** React Query or custom hooks
  - [x] Fetch user and profile data on mount
    - **API:** `GET /api/v1/user-profiles/user/{user_id}` via `getUserProfile()`
    - **Type:** `UserProfile` from `frontend/src/types/user.ts`
  - [x] Create page layout (header, sections)

- [x] Display user information section
  - **File:** `frontend/src/pages/ProfilePage.tsx`
  - [x] Username display (read-only)
    - **Data:** `User.username` from `frontend/src/types/user.ts`
  - [x] Email display (read-only)
    - **Data:** `User.email` from `frontend/src/types/user.ts`
  - [x] Account created date
    - **Data:** `User.created_at` from `frontend/src/types/user.ts`
  - [x] User avatar/icon (placeholder or initials)

- [x] Display learning statistics
  - **File:** `frontend/src/pages/ProfilePage.tsx`
  - [x] Total sessions completed
    - **Data:** Count from dialogs or calculate from `UserProfile`
  - [x] Total time spent learning
    - **Data:** `UserProfile.total_time_spent` from `frontend/src/types/user.ts`
  - [x] Total topics explored
    - **Data:** Count keys in `UserProfile.topic_mastery`
  - [x] Average session duration
    - **Calculation:** `total_time_spent / session_count`
  - [x] Favorite topic (most time spent)
    - **Data:** Analyze `UserProfile.topic_mastery` or add backend endpoint

- [x] Display user preferences section
  - **File:** `frontend/src/pages/ProfilePage.tsx`
  - [x] Preferred format (text/visual/video/interactive)
    - **Data:** `UserProfile.preferred_format` from `frontend/src/types/user.ts`
  - [x] Current difficulty level
    - **Data:** `UserProfile.current_difficulty` from `frontend/src/types/user.ts`
  - [x] Learning pace (fast/normal/slow)
    - **Data:** `UserProfile.learning_pace` from `frontend/src/types/user.ts`
  - [x] Topics of interest

- [x] Create edit profile functionality (basic)
  - **File:** `frontend/src/pages/ProfilePage.tsx`
  - [x] Toggle edit mode button
  - [x] Editable fields: preferred_format, email (optional)
  - [x] Save button (calls update API)
    - **API:** `PATCH /api/v1/user-profiles/{profile_id}` via `frontend/src/services/userService.ts`
    - **Backend:** `backend/app/api/routes/user_profiles.py` (may need to add PATCH endpoint)
  - [x] Cancel button (revert changes)
  - [x] Handle success/error states
    - **Component:** Use `frontend/src/components/ErrorMessage.tsx`

- [x] Add topic mastery overview
  - **File:** `frontend/src/pages/ProfilePage.tsx`
  - [x] Reuse MasteryIndicator components
    - **Component:** `frontend/src/components/metrics/MasteryIndicator.tsx`
  - [x] List all topics with mastery levels
    - **Data:** `UserProfile.topic_mastery` (Record<string, number>)
  - [x] Sort by mastery (lowest first for remediation)

- [x] Style with consistent design
  - **File:** `frontend/src/pages/ProfilePage.tsx`
  - **Styling:** Use theme from `frontend/src/contexts/ThemeContext.tsx`
  - **Tokens:** Use `frontend/src/styles/designTokens.ts`
  - [x] Elevated cards for sections
  - [x] Modern layout
  - [x] Responsive grid
  - [x] Smooth transitions

### 5. Navigation Integration

**Module:** `src/components/Navigation.tsx` (update existing)

**Dependencies:**
- Frontend components (Week 4): @frontend/src/components/Navigation.tsx
- React Router: useLocation, Link

- [x] Add Dashboard link to navigation
  - **File:** `frontend/src/components/Navigation.tsx` (existing, update)
  - [x] Update links array: Home → Dashboard
  - [x] Route path: `/` or `/dashboard`
    - **Router config:** Update in `frontend/src/App.tsx`
    - **Import:** Import Dashboard component from `frontend/src/pages/Dashboard.tsx`
  - [x] Icon: 📊 or dashboard icon
  - [x] Active state highlighting
    - **Hook:** Use `useLocation()` from react-router-dom

- [x] Verify all routes are accessible
  - **File:** `frontend/src/App.tsx`
  - [x] Dashboard: `/` or `/dashboard`
    - **Component:** `frontend/src/pages/Dashboard.tsx`
  - [x] Learn: `/learn`
    - **Component:** `frontend/src/pages/LearningPage.tsx`
  - [x] Profile: `/profile`
    - **Component:** `frontend/src/pages/ProfilePage.tsx`
  - [x] Active indicators work correctly

- [x] Test navigation flow
  - **Manual testing:** Use browser
  - [x] Navigate to Dashboard → shows overview
  - [x] Navigate to Learn → shows learning interface
  - [x] Navigate to Profile → shows user profile
  - [x] Back button works correctly

---

## Part B: Documentation and Tests

### 1. Component Documentation

- [ ] Add JSDoc comments to Dashboard components
  - [ ] Document Dashboard.tsx
    - **File:** `frontend/src/pages/Dashboard.tsx`
    - [ ] Page purpose and layout
    - [ ] Data dependencies
    - [ ] State management approach
  - [ ] Document MasteryIndicator.tsx
    - **File:** `frontend/src/components/metrics/MasteryIndicator.tsx`
    - [ ] Props interface with descriptions
    - [ ] Usage examples
    - [ ] Color coding logic
  - [ ] Document ProgressChart.tsx
    - **File:** `frontend/src/components/metrics/ProgressChart.tsx`
    - [ ] Chart types and data format
    - [ ] Customization options
    - [ ] Recharts integration notes

- [ ] Update frontend README
  - **File:** `frontend/README.md` (create if not exists)
  - [ ] Add Dashboard section
  - [ ] Document visualization approach (Recharts)
  - [ ] Document user profile features
  - [ ] Add screenshots (optional)
  - [ ] Update architecture diagram (optional)

### 2. Unit Tests

- [ ] Set up testing for chart components
  - **File:** `frontend/vitest.config.ts` (already exists)
  - **Setup:** `frontend/src/test/setup.ts` (already exists)
  - [ ] Install testing library if not already: `@testing-library/react`
    - **Note:** Already installed in `frontend/package.json`
  - [ ] Configure for Recharts (may need mocks)
    - **Config:** Update `frontend/vitest.config.ts` if needed

- [ ] Write tests for MasteryIndicator
  - **File:** `frontend/src/components/metrics/__tests__/MasteryIndicator.test.tsx` (new)
  - **Directory:** Create `frontend/src/components/metrics/__tests__/` if not exists
  - **Utils:** Use `frontend/src/test/testUtils.tsx`
  - [ ] Test rendering with different mastery values
  - [ ] Test color coding (red, yellow, green)
  - [ ] Test edge cases (null, undefined, out of range)
  - [ ] Test hover interactions

- [ ] Write tests for ProgressChart
  - **File:** `frontend/src/components/metrics/__tests__/ProgressChart.test.tsx` (new)
  - **Directory:** Create `frontend/src/components/metrics/__tests__/` if not exists
  - **Utils:** Use `frontend/src/test/testUtils.tsx`
  - [ ] Test rendering with sample data
  - [ ] Test empty data state
  - [ ] Test chart type switching
  - [ ] Test time range filtering

- [ ] Write tests for Dashboard page
  - **File:** `frontend/src/pages/__tests__/Dashboard.test.tsx` (new)
  - **Directory:** Create `frontend/src/pages/__tests__/` if not exists
  - **Utils:** Use `frontend/src/test/testUtils.tsx`
  - [ ] Test page initialization
  - [ ] Test loading states
  - [ ] Test error states
  - [ ] Test data fetching and display

- [ ] Write tests for ProfilePage
  - **File:** `frontend/src/pages/__tests__/ProfilePage.test.tsx` (new)
  - **Directory:** Create `frontend/src/pages/__tests__/` if not exists
  - **Utils:** Use `frontend/src/test/testUtils.tsx`
  - [ ] Test user info display
  - [ ] Test edit mode toggle
  - [ ] Test save/cancel functionality
  - [ ] Test statistics calculation

- [ ] Run all tests
  - **Command:** `cd frontend && npm run test`
  - **Script:** Defined in `frontend/package.json`
  - [ ] `npm run test`
  - [ ] Fix any failing tests
  - [ ] Aim for >80% coverage on new components
    - **Coverage command:** `npm run test:coverage`

### 3. Integration Tests

- [ ] Test Dashboard data flow
  - **File:** `frontend/src/test/integration.test.ts` (existing, add tests) or create new `tests/integration/dashboard.test.ts`
  - **Alternative location:** `tests/frontend/integration/dashboard.test.ts` (new)
  - [ ] Create test user with profile
    - **Backend:** Use test database or fixtures
  - [ ] Seed test metrics data
    - **Backend:** `backend/tests/` test fixtures or factories
  - [ ] Load Dashboard page
  - [ ] Verify all sections display correctly
  - [ ] Verify data matches backend

- [ ] Test Profile editing flow
  - **File:** `tests/frontend/integration/profile.test.ts` (new) or `frontend/src/test/integration.test.ts`
  - [ ] Load ProfilePage
  - [ ] Toggle edit mode
  - [ ] Change preferred_format
  - [ ] Save changes
  - [ ] Verify API call sent
    - **Mock or Real:** Mock API or use test backend
  - [ ] Verify profile updated in backend

- [ ] Test chart updates
  - **File:** `tests/frontend/integration/charts.test.ts` (new) or `frontend/src/test/integration.test.ts`
  - [ ] Load ProgressChart with data
  - [ ] Change time range
  - [ ] Verify chart re-renders
  - [ ] Verify data filtered correctly

### 4. Backend API Documentation

- [ ] Document profile endpoints (if new ones created)
  - **File:** `backend/app/api/routes/user_profiles.py` (docstrings and OpenAPI annotations)
  - **Swagger UI:** Available at `http://localhost:8000/docs`
  - [ ] GET /api/v1/user-profiles/user/{user_id} (existing)
    - **Backend:** `backend/app/api/routes/user_profiles.py`
  - [ ] PATCH /api/v1/user-profiles/{profile_id} (if edit feature added)
    - **Backend:** Add to `backend/app/api/routes/user_profiles.py`
    - **Schema:** Use `backend/app/schemas/user_profile.py`
  - [ ] Document request/response schemas
    - **Schemas:** `backend/app/schemas/user_profile.py`
  - [ ] Add usage examples in Swagger

- [ ] Document metrics endpoints (if exposing new ones)
  - **File:** `backend/app/api/routes/metrics.py` (may need to create new endpoints)
  - [ ] GET /api/v1/metrics/user/{user_id}/history
    - **Backend:** Add to `backend/app/api/routes/metrics.py` if not exists
    - **Schema:** Define in `backend/app/schemas/metric.py`
  - [ ] GET /api/v1/metrics/user/{user_id}/statistics
    - **Backend:** Add to `backend/app/api/routes/metrics.py` if not exists
  - [ ] Document response formats
    - **Schemas:** `backend/app/schemas/metric.py`

---

## Part C: Extended Features and Future Work

### 1. Advanced Visualizations

- [ ] Add more chart types
  - **File:** `frontend/src/components/metrics/AdvancedCharts.tsx` (new) or extend `ProgressChart.tsx`
  - **Library:** recharts (already planned for installation)
  - [ ] Pie chart for topic distribution
    - **Import:** `import { PieChart, Pie, Cell } from 'recharts'`
  - [ ] Radar chart for skill assessment
    - **Import:** `import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'`
  - [ ] Heatmap for learning activity (calendar view)
    - **Alternative library:** May need additional library like `react-calendar-heatmap`
  - [ ] Comparison charts (current vs previous period)

- [ ] Add interactive filters
  - **File:** `frontend/src/components/metrics/ChartFilters.tsx` (new)
  - **Location:** Used in Dashboard or ProgressChart
  - [ ] Filter by topic
    - **Data:** Use `UserProfile.topic_mastery` keys
  - [ ] Filter by difficulty
    - **Options:** easy, normal, hard, challenge
  - [ ] Filter by content type
    - **Options:** lesson, exercise, quiz
  - [ ] Date range pickers
    - **Component:** May use HTML5 date inputs or library like `react-datepicker`

- [ ] Add drill-down capability
  - **Implementation:** Click handlers in chart components
  - [ ] Click topic mastery → View detailed breakdown
    - **Navigation:** Modal or dedicated page
    - **Component:** `frontend/src/components/metrics/TopicDetailView.tsx` (new)
  - [ ] Click chart data point → View session details
    - **Navigation:** Link to specific dialog/session
  - [ ] Click activity item → Jump to content
    - **Route:** Navigate to `/learn` with specific content_id

### 2. Gamification Elements

- [ ] Achievement badges
  - **File:** `frontend/src/components/gamification/AchievementBadge.tsx` (new)
  - **Directory:** Create `frontend/src/components/gamification/` if not exists
  - **Data model:** May need new backend model `backend/app/models/achievement.py`
  - [ ] Define achievement criteria (first session, 10-day streak, etc.)
    - **Backend:** `backend/app/core/achievements/criteria.py` (new)
  - [ ] Create badge components
  - [ ] Display earned badges on Dashboard
    - **Location:** `frontend/src/pages/Dashboard.tsx` (add badges section)
  - [ ] Add unlock animations
    - **Hook:** Use `useAnimation` from `frontend/src/hooks/useAnimation.ts`

- [ ] Leaderboards (future: multi-user)
  - **File:** `frontend/src/components/gamification/Leaderboard.tsx` (new)
  - **Backend API:** `backend/app/api/routes/leaderboards.py` (new)
  - [ ] Top learners by accuracy
  - [ ] Top learners by time spent
  - [ ] Top learners by streak
  - [ ] Friend comparisons

- [ ] Progress milestones
  - **File:** `frontend/src/components/gamification/MilestoneTracker.tsx` (new)
  - **Backend:** May add to `UserProfile` or create separate model
  - [ ] Visual progress bars for goals
  - [ ] Celebrate milestones (confetti, toast)
    - **Animation:** CSS animations or library like `react-confetti`
  - [ ] Set personal learning goals
    - **Storage:** `UserProfile.extra_data` or dedicated goals table

### 3. Advanced Profile Features

- [ ] Learning goals
  - **File:** `frontend/src/components/profile/LearningGoals.tsx` (new)
  - **Directory:** Create `frontend/src/components/profile/` if not exists
  - **Backend:** Store in `UserProfile.extra_data` or create `backend/app/models/goal.py`
  - [ ] Set daily/weekly time goals
  - [ ] Set topic mastery goals
  - [ ] Track progress toward goals
  - [ ] Display goal progress on Dashboard
    - **Location:** `frontend/src/pages/Dashboard.tsx` (add goals widget)

- [ ] Learning calendar
  - **File:** `frontend/src/components/profile/LearningCalendar.tsx` (new)
  - **Library:** Consider `react-calendar` or custom implementation
  - **Data:** Aggregate from dialogs/metrics history
  - [ ] Calendar view of learning activity
  - [ ] Color-coded by activity level
  - [ ] Click date to view details
  - [ ] Streaks highlighted

- [ ] Personalization settings
  - **File:** `frontend/src/pages/SettingsPage.tsx` (new) or extend ProfilePage
  - **Backend:** Update `UserProfile` fields via `backend/app/api/routes/user_profiles.py`
  - [ ] Theme preference (light/dark) - already implemented
    - **Context:** `frontend/src/contexts/ThemeContext.tsx`
  - [ ] Notification preferences
    - **Storage:** `UserProfile.extra_data`
  - [ ] Difficulty preference (auto-adapt vs manual)
    - **Field:** `UserProfile.current_difficulty`
  - [ ] Learning pace preference
    - **Field:** `UserProfile.learning_pace`

### 4. Data Export

- [ ] Export user data
  - **File:** `frontend/src/components/profile/DataExport.tsx` (new)
  - **Backend:** `backend/app/api/routes/export.py` (new) or add to user_profiles
  - [ ] Export learning history as CSV
    - **Format:** CSV generation client-side or server-side
    - **Data:** Fetch from dialogs and metrics
  - [ ] Export topic mastery as JSON
    - **Data:** `UserProfile.topic_mastery`
  - [ ] Export progress charts as images
    - **Library:** Consider `html2canvas` or chart export features
  - [ ] Download reports (PDF)
    - **Library:** Consider `jspdf` or backend PDF generation

- [ ] Share progress
  - **File:** `frontend/src/components/profile/ShareProgress.tsx` (new)
  - [ ] Generate shareable progress card
    - **Component:** Create styled card with stats
  - [ ] Export certificate of completion
    - **Format:** PDF or image with user achievements
  - [ ] Share to social media (optional)
    - **Integration:** Web Share API or social media SDKs

### 5. Analytics Dashboard (Admin/Teacher View)

- [ ] Class/cohort analytics (future: multi-user system)
  - **File:** `frontend/src/pages/AdminDashboard.tsx` (new)
  - **Backend:** `backend/app/api/routes/admin.py` (new) or `analytics.py`
  - **Auth:** Will need role-based access control
  - [ ] Average class performance
    - **Aggregation:** Backend SQL queries on metrics
  - [ ] Topic difficulty analysis
    - **Data:** Aggregate accuracy by topic across users
  - [ ] Engagement metrics
    - **Data:** Session counts, time spent, retention
  - [ ] Identify struggling students
    - **Criteria:** Low accuracy, declining engagement

- [ ] Content effectiveness analytics
  - **File:** `frontend/src/components/admin/ContentAnalytics.tsx` (new)
  - **Backend:** Add analytics endpoints to `backend/app/api/routes/content.py`
  - [ ] Content completion rates
    - **Data:** Track completions per content_id
  - [ ] Average accuracy per content
    - **Data:** Aggregate from metrics by content_id
  - [ ] Time spent per content
    - **Data:** Aggregate from dialogs/metrics
  - [ ] Identify difficult content
    - **Criteria:** Low accuracy, high time spent, high dropout

### 6. Performance Optimizations

- [ ] Optimize chart rendering
  - **Files:** All chart components in `frontend/src/components/metrics/`
  - [ ] Lazy load charts (React.lazy)
    - **Implementation:** `const ProgressChart = React.lazy(() => import('./components/metrics/ProgressChart'))`
  - [ ] Debounce chart updates
    - **Hook:** Custom hook or lodash debounce
  - [ ] Virtualize large datasets
    - **Library:** Consider `react-window` or `react-virtualized`
  - [ ] Cache chart data
    - **Strategy:** React Query with staleTime, or useMemo

- [ ] Optimize data fetching
  - **Files:** `frontend/src/services/` and hook files
  - [ ] Implement pagination for activity feed
    - **Backend:** Add pagination params to dialogs endpoint
    - **Frontend:** Implement in Dashboard activity section
  - [ ] Cache profile and metrics data
    - **Library:** React Query (already using `@tanstack/react-query`)
    - **Config:** Set cacheTime and staleTime appropriately
  - [ ] Prefetch dashboard data on navigation
    - **Hook:** Use `queryClient.prefetchQuery()` in navigation
  - [ ] Implement stale-while-revalidate strategy
    - **React Query:** Configure with `staleTime` and `refetchOnMount`

- [ ] Add loading skeletons
  - **Files:** Create skeleton components in `frontend/src/components/`
  - [ ] Chart skeleton screens
    - **File:** `frontend/src/components/ChartSkeleton.tsx` (new)
  - [ ] Dashboard section skeletons
    - **File:** `frontend/src/components/DashboardSkeleton.tsx` (new)
  - [ ] Profile skeleton
    - **File:** `frontend/src/components/ProfileSkeleton.tsx` (new)
  - [ ] Better UX during data fetching
    - **Reference:** Use patterns from `frontend/src/components/ContentSkeleton.tsx`

### 7. Accessibility Enhancements

- [ ] Make charts accessible
  - **Files:** All chart components in `frontend/src/components/metrics/`
  - **Reference:** WCAG 2.1 guidelines
  - [ ] Add ARIA labels to chart elements
    - **Attributes:** aria-label, aria-describedby, role
  - [ ] Provide text alternatives for visual data
    - **Implementation:** Hidden text or table below chart
  - [ ] Keyboard navigation for chart interactions
    - **Events:** onKeyDown handlers for filters and controls
  - [ ] Screen reader announcements
    - **ARIA:** aria-live regions for dynamic updates

- [ ] Profile page accessibility
  - **File:** `frontend/src/pages/ProfilePage.tsx`
  - [ ] Form field labels
    - **HTML:** Proper <label> elements with htmlFor
  - [ ] Focus management in edit mode
    - **React:** useRef and focus() on mode toggle
  - [ ] Error announcements
    - **ARIA:** aria-live="polite" for error messages
  - [ ] Keyboard shortcuts
    - **Implementation:** Global key handlers or component-level

### 8. Mobile Optimizations

- [ ] Optimize dashboard for mobile
  - **File:** `frontend/src/pages/Dashboard.tsx` (add responsive styles)
  - **Styling:** Media queries in styled components or CSS
  - [ ] Touch-friendly charts
    - **Recharts:** Configure tooltip and interaction settings
  - [ ] Swipe gestures for chart navigation
    - **Library:** Consider `react-swipeable` or native touch events
  - [ ] Simplified mobile layout
    - **CSS:** Single column, reduced padding
  - [ ] Bottom sheet for details
    - **Component:** `frontend/src/components/mobile/BottomSheet.tsx` (new)

- [ ] Optimize charts for small screens
  - **Files:** `frontend/src/components/metrics/ProgressChart.tsx` and others
  - [ ] Reduce data points for clarity
    - **Logic:** Conditional rendering based on screen width
  - [ ] Larger touch targets
    - **CSS:** min-height: 44px for interactive elements
  - [ ] Simplified tooltips
    - **Recharts:** Custom tooltip component
  - [ ] Horizontal scrolling if needed
    - **CSS:** overflow-x: auto, white-space: nowrap

### 9. Real-time Updates

- [ ] Live dashboard updates
  - **WebSocket:** May need to set up WebSocket server in backend
  - **Backend:** `backend/app/websockets.py` (new) or use existing framework
  - **Frontend:** WebSocket client in `frontend/src/services/websocket.ts` (new)
  - [ ] WebSocket connection for real-time data
    - **Libraries:** Native WebSocket API or socket.io-client
  - [ ] Auto-refresh metrics every N seconds
    - **React:** setInterval or React Query refetchInterval
  - [ ] Notifications for achievements
    - **Component:** Toast notifications
  - [ ] Real-time progress updates
    - **Data:** Push updates from backend on metric changes

### 10. Comparative Analytics

- [ ] Compare with peers (future: multi-user)
  - **File:** `frontend/src/components/analytics/PeerComparison.tsx` (new)
  - **Backend:** `backend/app/api/routes/analytics.py` (new)
  - [ ] Anonymized comparisons
    - **Privacy:** Aggregate data without user identifiers
  - [ ] Percentile rankings
    - **Calculation:** Backend percentile calculation
  - [ ] Class averages
    - **Data:** Aggregate metrics across cohort
  - [ ] Motivation through friendly competition

- [ ] Compare with self (historical)
  - **File:** `frontend/src/components/analytics/SelfComparison.tsx` (new)
  - **Data:** Query historical metrics from backend
  - [ ] This week vs last week
    - **Query:** Time-range filtering on metrics
  - [ ] This month vs last month
  - [ ] Trend analysis
    - **Calculation:** Calculate slopes, averages
  - [ ] Highlight improvements
    - **UI:** Visual indicators for positive changes

### 11. Insights and Recommendations

- [ ] Generate learning insights
  - **File:** `frontend/src/components/insights/LearningInsights.tsx` (new)
  - **Backend:** `backend/app/core/insights/analyzer.py` (new)
  - **AI/ML:** May use simple heuristics or ML models
  - [ ] Best time of day for learning
    - **Analysis:** Group metrics by time of day
  - [ ] Most productive topics
    - **Analysis:** Compare accuracy/speed by topic
  - [ ] Identify learning patterns
    - **Analysis:** Session duration, frequency patterns
  - [ ] Suggest optimal study schedule
    - **Algorithm:** Based on historical performance

- [ ] Personalized recommendations
  - **File:** Enhanced recommendation logic
  - **Backend:** Extend `backend/app/services/recommendation_service.py`
  - [ ] "You might like..." based on preferences
    - **Data:** Use `UserProfile.preferred_format` and topic_mastery
  - [ ] "Others who studied X also studied Y"
    - **Collaborative filtering:** Multi-user feature
  - [ ] Next logical topics based on prerequisites
    - **Content metadata:** Topic dependencies
  - [ ] Remediation suggestions
    - **Logic:** Identify topics with low mastery

---

## Deliverable

By the end of Week 6, you should have:

### Basic Minimum (Required):
✅ **Dashboard Page**: Functional /dashboard route with overview, activity feed, recommended lessons
✅ **Topic Mastery Visualization**: MasteryIndicator component showing color-coded mastery bars
✅ **Progress Charts**: ProgressChart component with accuracy and time spent charts using Recharts
✅ **User Profile Page**: ProfilePage with user info, statistics, preferences, and basic edit functionality
✅ **Navigation Updated**: Dashboard link added to navigation with active state
✅ **Responsive Design**: All dashboard components work on mobile, tablet, desktop
✅ **Dark Mode**: All visualization components theme-aware
✅ **Integration**: Backend API calls working for profile and metrics data

### Documentation and Tests (Required):
- Component documentation (JSDoc comments)
- Frontend README updated
- Unit tests for Dashboard components
- Integration tests for data flow
- Backend API documentation (if new endpoints)

### Extended Features (Optional):
- Advanced visualizations (pie charts, radar, heatmap)
- Gamification (badges, leaderboards, milestones)
- Learning goals and calendar
- Data export functionality
- Analytics dashboard (admin view)
- Performance optimizations
- Accessibility enhancements
- Real-time updates
- Comparative analytics
- AI-generated insights

---

## Dependencies

**Must be completed before Week 6**:
- Week 5 deliverables:
  - ✅ Learning interface functional
  - ✅ User can complete learning sessions
  - ✅ Custom hooks for data management
  - ✅ Content and dialog components
  - ✅ Session management working
- Week 4 deliverables:
  - ✅ Service layer functional
  - ✅ Type definitions complete
  - ✅ Theme system with dark mode
- Backend:
  - ✅ Metrics being generated
  - ✅ User profiles being updated
  - ✅ Profile API endpoints working

**Enables Week 7**:
- Week 7 (Contextual Bandit Implementation) depends on:
  - Dashboard displaying metrics and performance
  - User interaction history available
  - Recommendation system functional
  - Frontend complete for testing ML improvements

---

## Notes

- **Focus on Data Visualization** - Make complex data easy to understand
- Start with basic charts, enhance later
- Use Recharts for simplicity and React integration
- Keep dashboard loading fast (optimize queries, cache data)
- Test with real user data (seed database with realistic metrics)
- Consider mobile experience from the start
- Make charts interactive (tooltips, click events)
- Use consistent color coding (red/yellow/green for mastery)
- Provide context for numbers (comparisons, trends)
- Celebrate user progress (positive reinforcement)

**Dashboard Design Principles:**
- Scannable: Important info at a glance
- Actionable: Clear next steps (recommended lessons)
- Motivating: Show progress and achievements
- Clean: Avoid clutter, focus on key metrics
- Responsive: Work on all devices
- Fast: Optimize loading times
- Accessible: Support screen readers, keyboard navigation

---

## Estimated Time Breakdown

**Basic Minimum (Required)**: 2-3 days
- Day 1: Dashboard page structure, MasteryIndicator, basic charts (Tasks 1.1-1.3)
- Day 2: ProgressChart with Recharts, ProfilePage (Tasks 1.4-1.5)
- Day 3: Polish, responsive design, navigation integration (Task 1.6)

**Documentation and Tests**: 1 day
- Write documentation (Section 2.1)
- Write unit and integration tests (Sections 2.2-2.3)

**Extended Features (Optional)**: 2-4 days (can be done later or in parallel with Week 7+)
- Advanced visualizations: 1 day
- Gamification elements: 1 day
- Performance and accessibility: 1 day
- Future enhancements: 1+ days

---

## Troubleshooting

**Issue**: Recharts not rendering
- **Solution**: Ensure ResponsiveContainer wraps chart, verify data format matches Recharts API, check for console errors

**Issue**: Topic mastery data not displaying
- **Solution**: Verify user_profile.topic_mastery is JSONB object, check API response structure, verify data parsing logic

**Issue**: Dashboard slow to load
- **Solution**: Optimize backend queries (add indexes), implement pagination for activity feed, cache profile data with React Query

**Issue**: Charts not responsive on mobile
- **Solution**: Use ResponsiveContainer from Recharts, set aspect ratio, test on actual devices or DevTools emulation

**Issue**: Dark mode colors not applying to charts
- **Solution**: Pass theme colors to Recharts components, ensure stroke/fill props use theme variables, test both themes

**Issue**: Profile edit not saving
- **Solution**: Verify PATCH endpoint exists, check request payload format, verify backend validation, check for CORS issues

**Issue**: Empty states not showing correctly
- **Solution**: Check conditional rendering logic, verify data fetching error handling, test with new user (no data)

**Issue**: Activity feed shows wrong dates
- **Solution**: Verify timezone handling, check date formatting logic, ensure backend returns ISO 8601 timestamps

---

**Good luck with Week 6!** 📊

This week brings data to life with visualizations and completes the core user experience. Focus on making metrics understandable and motivating for learners.
