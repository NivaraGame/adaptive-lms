# Learning Interface Utilities

Pure, framework-agnostic utility functions for the Week 5 learning interface. All functions are side-effect free, fully typed, and follow the project's General Specifications.

## Overview

This module provides three categories of utilities:

1. **Formatters** (`formatters.ts`) - Display formatting and labeling
2. **Mappers** (`mappers.ts`) - Data transformation from backend to UI models
3. **State Helpers** (`stateHelpers.ts`) - Decision logic and flow control

## Design Principles

- ✅ **Pure Functions**: No side effects, deterministic outputs
- ✅ **Framework-Agnostic**: No React, no DOM, no browser APIs
- ✅ **Fully Typed**: Complete TypeScript coverage
- ✅ **Reusable**: Can be used across hooks, components, and other utilities
- ✅ **Testable**: Easy to unit test due to purity

## Usage

### Import from Central Index

```typescript
import {
  // Formatters
  formatDifficultyLabel,
  formatDuration,
  formatStreak,

  // Mappers
  mapContentToSummary,
  mapDialogToSummary,

  // State Helpers
  shouldEnableNext,
  hasMoreHints,
  isSessionActive,
} from '@/utils/learning';
```

## Formatters

### Display Labels

```typescript
import { formatDifficultyLabel, formatContentTypeLabel } from '@/utils/learning';

const label = formatDifficultyLabel('easy'); // "Easy"
const type = formatContentTypeLabel('quiz'); // "Quiz"
```

### Icons and Colors

```typescript
import { getContentTypeIcon, getDifficultyColor } from '@/utils/learning';

const icon = getContentTypeIcon('lesson'); // "📚"
const color = getDifficultyColor('hard'); // "warning"
```

### Time and Duration

```typescript
import { formatDuration, formatTimestamp } from '@/utils/contentFormatter';

const duration = formatDuration(125); // "2h 5min"
const time = formatTimestamp('2024-03-15T14:30:00Z'); // "Mar 15, 14:30"
```

### Progress and Stats

```typescript
import { formatProgress, formatAccuracy, formatStreak } from '@/utils/learning';

const progress = formatProgress(7, 10); // "70%"
const accuracy = formatAccuracy(17, 20); // "85.0%"
const streak = formatStreak(5); // "🔥 5 streak"
```

## Mappers

### Content Mapping

```typescript
import { mapContentToSummary } from '@/utils/learning';

const summary = mapContentToSummary(contentItem);
// Returns: { id, title, topic, difficulty, hasHints, ... }
```

### Dialog Mapping

```typescript
import { mapDialogToSummary } from '@/utils/learning';

const summary = mapDialogToSummary(dialog);
// Returns: { id, type, isActive, duration, ... }
```

### Message Mapping

```typescript
import { mapMessageToDisplay } from '@/utils/learning';

const display = mapMessageToDisplay(message, formatTimestamp);
// Returns: { id, content, isUser, formattedTime, ... }
```

### Statistics and Grouping

```typescript
import {
  extractLearningStats,
  groupMessagesBySender,
  extractQuestionAnswerPairs
} from '@/utils/learning';

const stats = extractLearningStats(contentArray);
// Returns: { totalContent, byType, byDifficulty, ... }

const grouped = groupMessagesBySender(messages);
// Returns: [{sender: 'user', messages: [...]}, ...]

const qaHistory = extractQuestionAnswerPairs(messages);
// Returns: [{question: '...', answer: '...', timestamp: ...}, ...]
```

## State Helpers

### Session State

```typescript
import { isSessionActive, isSessionLong } from '@/utils/learning';

if (isSessionActive(dialog)) {
  // Session is active
}

if (isSessionLong(sessionStart, 30)) {
  // Session has been running for 30+ minutes
}
```

### Content State

```typescript
import {
  hasHints,
  hasMoreHints,
  requiresAnswer,
  isContentValid
} from '@/utils/learning';

if (hasHints(content)) {
  // Show hint button
}

if (hasMoreHints(content, revealedCount)) {
  // Show "Reveal Next Hint" button
}

if (requiresAnswer(content)) {
  // Show answer input instead of "Continue"
}

if (!isContentValid(content)) {
  // Show error - content is missing required fields
}
```

### Flow Control

```typescript
import {
  shouldEnableNext,
  isAnswerValid,
  shouldPromptBreak
} from '@/utils/learning';

const canProceed = shouldEnableNext(content, hasSubmittedAnswer);
// Determines if "Next" button should be enabled

const isValid = isAnswerValid(userAnswer, content.content_type);
// Validates answer before submission

if (shouldPromptBreak(sessionStart, completedCount)) {
  // Show break reminder
}
```

### Progress Tracking

```typescript
import {
  calculateProgress,
  updateStreak,
  getCompletionState
} from '@/utils/learning';

const progress = calculateProgress(7, 10); // 70
const newStreak = updateStreak(true, 4); // 5

const state = getCompletionState(content, true, true);
// Returns: 'not-started' | 'in-progress' | 'completed'
```

### Reference Answer Display

```typescript
import { shouldShowReferenceAnswer } from '@/utils/learning';

if (shouldShowReferenceAnswer(content, hasSubmitted, isCorrect)) {
  // Display reference answer to user
}
```

## File Organization

```
src/utils/learning/
├── index.ts              # Central export point
├── formatters.ts         # Display formatting utilities
├── mappers.ts            # Data transformation utilities
├── stateHelpers.ts       # State and flow logic utilities
└── README.md             # This file
```

## Related Utilities

- **Content Formatter** (`src/utils/contentFormatter.ts`) - Parses content_data JSON
- **Session Storage** (`src/utils/sessionStorage.ts`) - Manages browser session storage
- **Format JSON** (`src/utils/formatJSON.tsx`) - Syntax-highlighted JSON display (React-dependent)

## Testing

All utilities are pure functions and easy to unit test:

```typescript
import { formatDifficultyLabel, shouldEnableNext } from '@/utils/learning';

describe('formatDifficultyLabel', () => {
  it('formats easy difficulty', () => {
    expect(formatDifficultyLabel('easy')).toBe('Easy');
  });
});

describe('shouldEnableNext', () => {
  it('enables for lessons without submission', () => {
    const lesson = { content_type: 'lesson' } as ContentItem;
    expect(shouldEnableNext(lesson, false)).toBe(true);
  });

  it('requires submission for exercises', () => {
    const exercise = { content_type: 'exercise' } as ContentItem;
    expect(shouldEnableNext(exercise, false)).toBe(false);
    expect(shouldEnableNext(exercise, true)).toBe(true);
  });
});
```

## Common Patterns

### Conditional UI Rendering

```typescript
import { hasHints, requiresAnswer, shouldEnableNext } from '@/utils/learning';

function ContentViewer({ content, hasSubmitted }) {
  return (
    <div>
      {hasHints(content) && <HintPanel hints={content.hints} />}

      {requiresAnswer(content) ? (
        <AnswerInput />
      ) : (
        <Button>Continue</Button>
      )}

      <Button disabled={!shouldEnableNext(content, hasSubmitted)}>
        Next
      </Button>
    </div>
  );
}
```

### Data Display

```typescript
import {
  mapContentToSummary,
  formatDifficultyLabel,
  getContentTypeIcon
} from '@/utils/learning';

function ContentCard({ content }) {
  const summary = mapContentToSummary(content);

  return (
    <div>
      <h3>{getContentTypeIcon(summary.type)} {summary.title}</h3>
      <span>{formatDifficultyLabel(summary.difficulty)}</span>
      {summary.hasHints && <Badge>Has Hints</Badge>}
    </div>
  );
}
```

### Progress Display

```typescript
import {
  calculateProgress,
  formatProgress,
  formatStreak
} from '@/utils/learning';

function ProgressDisplay({ completed, total, streak }) {
  const percentage = calculateProgress(completed, total);

  return (
    <div>
      <ProgressBar value={percentage} />
      <span>{formatProgress(completed, total)}</span>
      {streak > 0 && <span>{formatStreak(streak)}</span>}
    </div>
  );
}
```

## Best Practices

1. **Always use these utilities instead of inline logic** - Keeps components clean and logic reusable
2. **Import from central index** - Use `@/utils/learning` not individual files
3. **Combine multiple utilities** - Chain formatters and mappers for complex displays
4. **Don't modify utility functions to add side effects** - Create new utilities if needed
5. **Add JSDoc comments to new utilities** - Follow existing documentation patterns

## Contributing

When adding new utilities:

1. Choose the correct category (formatters, mappers, or state helpers)
2. Follow pure function principles (no side effects)
3. Add complete TypeScript types
4. Include JSDoc comments with examples
5. Export from the category file and central index
6. Update this README with usage examples
7. Consider writing unit tests

## Support

For questions or issues with these utilities, refer to:
- Week 5 documentation: `@docs/weeks/week_5.md`
- General Specifications: Project root documentation
- Type definitions: `@frontend/src/types/`
