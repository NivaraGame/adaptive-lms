# Message Payload Contract

## Content Answer Message Format

When submitting user answers to content (exercises/quizzes), use the following `extra_data` structure:

```typescript
{
  message_type: "content_answer",
  content_meta: {
    content_id: number,
    content_type: "exercise" | "quiz" | "lesson",
    topic: string,
    difficulty_level: "easy" | "normal" | "hard" | "expert",
    format: "text" | "visual" | "interactive" | "video"
  },
  answer_meta: {
    is_correct: boolean,
    response_time_seconds: number,
    hints_used: number
  }
}
```

### Backend Processing

The backend (`compute_synchronous_metrics`) extracts:
- `is_correct` → `accuracy` (1.0 or 0.0)
- `response_time_seconds` → `response_time`
- `topic` → for `topic_mastery` update
- `content_id` → for tracking

### Example

```json
{
  "dialog_id": 42,
  "sender_type": "user",
  "content": "x = 5",
  "is_question": false,
  "extra_data": {
    "message_type": "content_answer",
    "content_meta": {
      "content_id": 123,
      "content_type": "exercise",
      "topic": "algebra",
      "difficulty_level": "normal",
      "format": "text"
    },
    "answer_meta": {
      "is_correct": true,
      "response_time_seconds": 25.4,
      "hints_used": 1
    }
  }
}
```

## Regular Chat Message Format

Regular chat messages should NOT include `message_type` in `extra_data`:

```json
{
  "dialog_id": 42,
  "sender_type": "user",
  "content": "Can you explain this?",
  "is_question": true,
  "extra_data": {}
}
```

---

**IMPORTANT**: This contract must be maintained across frontend and backend. Any changes require updating both sides.
