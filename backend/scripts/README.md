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
- Creates 180 content items with full lesson/exercise/quiz data:
  - IT Course: Web Programming (30), JavaScript (30), React (30)
  - Military Course: Radio Ops (30), Signal Security (30), Tactical Planning (30)
  - **All content is TEXT-BASED** (even for visual/video/interactive formats - for demo purposes)
- Creates 5 dialogs with 30 messages each
- Generates 360 metrics (180 tasks × 3 attempts × 2 metrics)

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

### 2. Add Full Content

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
            "test_cases": ["Test 1", "Test 2", "Test 3"]
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
            "explanation": "Why A is correct"
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
  - Correct answers included in description field for easy demo verification
  - Example: `"description": "Practice CSS. Answer: .box { margin: 20px; }"`

## File Structure

```
backend/scripts/
├── seed_db.py              # Main seeding script (API-based)
├── content_generator.py    # Content templates for lessons/exercises/quizzes
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
