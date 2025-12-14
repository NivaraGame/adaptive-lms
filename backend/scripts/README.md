# Seeding Script Guide

## Quick Start

```bash
# Run from project root or backend directory
./venv/bin/python scripts/seed_db.py
```

## What It Does

- **Drops all data** and resets IDs to 1
- Creates user: `username='user'`, `password='password'`, `user_id=1`
- Auto-creates user profile via API business logic
- Creates 180 **schema-complete** content items with full lesson/exercise/quiz data:
  - IT Course: Web Programming (30), JavaScript (30), React (30)
  - Military Course: Radio Ops (30), Signal Security (30), Tactical Planning (30)
  - **All content is TEXT-BASED** (even for visual/video/interactive formats - for demo purposes)
- Creates 5 dialogs with 30 messages each
- Generates 360 metrics (180 tasks × 3 attempts × 2 metrics)

## Schema-Complete Content Generation

### Generated Fields (v2.0)

All content items now include:

**Core Fields:**
- `title` - Task title
- `topic` - Main topic (from discipline dictionary)
- `subtopic` - Auto-generated snake_case identifier (e.g., "http_protocol_basics")
- `difficulty_level` - easy, normal, hard, challenge
- `format` - text, visual, video, interactive (all text-based for demo)
- `content_type` - lesson, exercise, quiz

**Content Fields:**
- `content_data` - Main content (varies by type, see examples below)
- `reference_answer` - Correct answer (exercises/quizzes only)
- `hints` - List of 2+ hints
- `explanations` - List of 2+ explanations

**Metadata Fields:**
- `skills` - Auto-generated skill tags (e.g., ["web_programming_fundamentals", "http_protocol_basics", "http_protocol_basics_theory"])
- `prerequisites` - Auto-inferred based on difficulty (e.g., easy=[], normal=["topic_basics"], hard=["topic_basics", "topic_intermediate"])
- `extra_data` - Generator metadata (version, schema_complete flag, generated_at)

### Content Structure by Type

#### Lesson Structure

```json
{
  "title": "HTTP Protocol Basics",
  "topic": "Web_Programming_Fundamentals",
  "subtopic": "http_protocol_basics",
  "difficulty_level": "easy",
  "format": "text",
  "content_type": "lesson",
  "content_data": {
    "introduction": "HTTP (Hypertext Transfer Protocol) is the foundation...",
    "sections": [
      {"heading": "HTTP Methods", "content": "GET retrieves data, POST submits..."},
      {"heading": "Status Codes", "content": "200 OK, 201 Created, 400 Bad Request..."},
      {"heading": "Headers", "content": "Content-Type, Authorization..."}
    ],
    "key_points": ["HTTP is stateless", "Methods define operations", "Status codes indicate results"]
  },
  "reference_answer": null,
  "hints": ["Take notes on key concepts", "Review examples carefully"],
  "explanations": [
    "This lesson introduces fundamental concepts in web programming fundamentals.",
    "Understanding HTTP protocol basics is essential for progressing to advanced topics."
  ],
  "skills": ["web_programming_fundamentals", "http_protocol_basics", "http_protocol_basics_theory"],
  "prerequisites": [],
  "extra_data": {
    "generator_version": "2.0",
    "schema_complete": true,
    "generated_at": "2024-01-15"
  }
}
```

#### Exercise Structure

```json
{
  "title": "CSS Box Model",
  "topic": "Web_Programming_Fundamentals",
  "subtopic": "css_box_model",
  "difficulty_level": "easy",
  "format": "interactive",
  "content_type": "exercise",
  "content_data": {
    "description": "Practice margin, padding, border, content in CSS. Answer: .box { margin: 20px; padding: 15px; border: 2px solid black; width: 300px; }",
    "question": "Create a div with: 20px margin, 15px padding, 2px solid border, 300px width",
    "starter_code": "<div class=\"box\">Content</div>\n\n<style>\n.box {\n  /* Your CSS here */\n}\n</style>",
    "test_cases": ["Check computed width", "Verify spacing", "Inspect border"]
  },
  "reference_answer": {
    "code": ".box {\n  margin: 20px;\n  padding: 15px;\n  border: 2px solid black;\n  width: 300px;\n}",
    "output": "Expected solution output"
  },
  "hints": [
    "Remember: total width = width + padding + border + margin",
    "Use browser DevTools to inspect"
  ],
  "explanations": [
    "The box model consists of content, padding, border, and margin in that order from inside out.",
    "Total element space = content width + left/right padding + left/right border + left/right margin."
  ],
  "skills": ["web_programming_fundamentals", "css_box_model", "css_box_model_practice"],
  "prerequisites": [],
  "extra_data": {
    "generator_version": "2.0",
    "schema_complete": true,
    "generated_at": "2024-01-15"
  }
}
```

#### Quiz Structure

```json
{
  "title": "HTTP Protocol Basics",
  "topic": "Web_Programming_Fundamentals",
  "subtopic": "http_protocol_basics",
  "difficulty_level": "normal",
  "format": "text",
  "content_type": "quiz",
  "content_data": {
    "description": "Understanding GET, POST, PUT, DELETE methods and status codes. Correct: 200 OK",
    "question": "Which HTTP status code indicates a successful request?",
    "options": ["200 OK", "404 Not Found", "500 Internal Server Error", "301 Moved Permanently"]
  },
  "reference_answer": {
    "correct_answer": "200 OK",
    "explanation": "200 OK indicates the request succeeded. 404 means not found, 500 is server error, 301 is redirect."
  },
  "hints": [
    "2xx codes indicate success",
    "4xx codes indicate client errors"
  ],
  "explanations": [
    "HTTP status codes are grouped: 2xx (success), 3xx (redirect), 4xx (client error), 5xx (server error).",
    "200 OK is the most common success code, meaning the request was processed successfully."
  ],
  "skills": ["web_programming_fundamentals", "http_protocol_basics", "http_protocol_basics_assessment"],
  "prerequisites": ["web_programming_fundamentals_basics"],
  "extra_data": {
    "generator_version": "2.0",
    "schema_complete": true,
    "generated_at": "2024-01-15"
  }
}
```

## Important Notes

- **Always runs API endpoints** - ensures business logic (profile creation, validation) executes
- **IDs always reset to 1** - `RESTART IDENTITY` in TRUNCATE
- **Frontend expects user_id=1** - hardcoded in `LearningPage.tsx`
- **Backend must be running** - script calls `http://localhost:8000/api/v1/*`
- **All content is text-based for demo** - format field varies (text/visual/video/interactive) but:
  - Questions/tasks are always text (not images)
  - **Correct answers included in description field** for easy demo verification
  - Example: `"description": "Practice CSS. Answer: .box { margin: 20px; }"`
- **Subtopics are auto-generated** - derived from title using snake_case slugification
- **Skills are auto-generated** - 3 skills per item: [topic, title, type-specific]
- **Prerequisites are auto-inferred** - based on difficulty level (easy=[], normal=[basics], hard=[basics, intermediate], challenge=[basics, intermediate, advanced])

## Adding New Content

### 1. Add to Discipline Dictionary

Edit `seed_db.py`:

```python
IT_DISCIPLINES = {
    "New_Topic_Name": [
        ("Task Title", "difficulty", "type", "Short description"),
        # difficulty: easy, normal, hard, challenge
        # type: lesson, exercise, quiz
    ]
}
```

### 2. Add Full Content (Optional)

Edit `content_generator.py`:

**For Lessons:**
```python
def get_lesson_content(title, topic, description):
    lessons = {
        "Your Task Title": {
            "introduction": "Intro text",
            "sections": [
                {"heading": "Section 1", "content": "Content here"},
                {"heading": "Section 2", "content": "More content"}
            ],
            "key_points": ["Point 1", "Point 2", "Point 3"]
        }
    }
```

**For Exercises:**
```python
def get_exercise_content(title, topic, description):
    exercises = {
        "Your Task Title": {
            "question": "What to do?",
            "starter_code": "// Starting code",
            "solution": "// Complete solution",
            "test_cases": ["Test 1", "Test 2", "Test 3"],
            "hints": ["Hint 1", "Hint 2"],
            "explanations": ["Explanation 1", "Explanation 2"]
        }
    }
```

**For Quizzes:**
```python
def get_quiz_content(title, topic, description):
    quizzes = {
        "Your Task Title": {
            "question": "Quiz question?",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "A",
            "explanation": "Why A is correct",
            "hints": ["Hint 1", "Hint 2"],
            "explanations": ["Explanation 1", "Explanation 2"]
        }
    }
```

**Note:** If you don't add specific content to `content_generator.py`, the system will use intelligent defaults based on the title, topic, and description from the discipline dictionary.

## File Structure

```
backend/scripts/
├── seed_db.py              # Main seeding script (API-based)
├── content_generator.py    # Content templates + auto-generation helpers
├── seed_db_backup.py       # Backup (direct DB, faster but skips API logic)
└── README.md              # This file
```

## Troubleshooting

**Error: Connection refused**
- Start backend: `docker-compose up` or `uvicorn app.main:app`

**User ID not 1**
- Script wasn't run or failed - check for errors
- Run script again to reset IDs

**Empty content_data**
- Check `content_generator.py` has entry for that task title
- Falls back to default template if not found

**Missing fields (subtopic, skills, prerequisites)**
- Ensure you're running the updated seeder (v2.0+)
- Check extra_data.generator_version = "2.0"

## Extending Metrics

To change metric generation, edit `create_metrics()`:

```python
def create_metrics(self):
    difficulty_ranges = {
        "easy": (0.70, 0.95),    # Min-max accuracy
        "normal": (0.55, 0.85),
        "hard": (0.40, 0.75),
        "challenge": (0.25, 0.65)
    }
    # Modify ranges or add new metric types
```

## Updating User Profile Defaults

User profile defaults are in backend API:
- `backend/app/services/user_service.py` → `create_user_profile()`
- Seeding script inherits these via API call

## Performance

- Full run: ~2-3 minutes (180 content items + metrics)
- Speed up: Reduce items in `all_content[:60]` (metrics loop)

## Schema Version History

- **v1.0** (original): Basic content with minimal fields, simple skill tags
- **v2.0** (current): Schema-complete content with auto-generated subtopics, rich skills/prerequisites, comprehensive hints/explanations
