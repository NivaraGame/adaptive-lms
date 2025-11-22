# Database Seeding Script

This directory contains the development seed data script for populating the Adaptive LMS PostgreSQL database.

## Quick Start

```bash
# Navigate to the db directory
cd db

# Run the seed script
python seed.py
```

## Usage

### Basic Seeding

```bash
python seed.py
```

This will:
- Connect to the PostgreSQL database using the `DATABASE_URL` from your backend configuration
- Create tables if they don't exist
- Insert development seed data (idempotent - safe to run multiple times)

### Reset and Seed

```bash
python seed.py --reset
```

This will:
- Drop all existing tables
- Recreate the schema
- Insert fresh seed data

**Warning:** This will delete all existing data!

### Custom Database URL

```bash
python seed.py --db-url "postgresql://user:password@localhost:5432/adaptive_lms"
```

## What Gets Seeded

### Users (5 users)
- `alice_learner` - Medium-paced learner with moderate mastery
- `bob_student` - Slow-paced beginner student
- `charlie_dev` - Fast-paced advanced developer
- `diana_expert` - Expert user with high mastery across all topics
- `test_user` - Clean test account with no history

All passwords are: `<username>123` (e.g., `alice123`)

### User Profiles
Each user has a complete profile with:
- Topic mastery scores (JSONB)
- Preferred learning format
- Learning pace
- Error patterns
- Performance metrics

### Content Items (6 items)
- Python basics lesson
- Data structures exercise
- Algorithm lesson (binary search)
- Python quiz (comprehensions)
- Database lesson (SQL JOINs)
- Web development lesson (APIs)

### Dialogs and Messages
- Educational dialog for Alice
- Test/assessment dialog for Bob
- Reflective dialog for Charlie

### Metrics
- Accuracy metrics
- Response time tracking
- Session duration
- Problem-solving scores

### Experiments
- A/B testing variants for adaptive difficulty
- Content format experiments
- Learning path customization

## Requirements

The script requires:
- Python 3.8+
- SQLAlchemy
- The backend app models and configuration

It uses the existing backend dependencies, so ensure your backend environment is set up:

```bash
cd ../backend
pip install -r requirements.txt
```

## Docker Integration

If using Docker Compose, ensure the PostgreSQL service is running:

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run seed script from host
python db/seed.py
```

Or run from within a backend container:

```bash
docker-compose exec backend python /app/../db/seed.py
```

## Idempotency

The script is designed to be idempotent:
- Checks for existing records before creating
- Uses username/email uniqueness for users
- Uses title uniqueness for content
- Checks for existing dialogs by user and topic

Running the script multiple times won't create duplicate data.

## Database Connection

The script uses the same database configuration as the backend application:
- Reads from `app.config.settings.DATABASE_URL`
- Falls back to environment variables
- Can be overridden with `--db-url` flag

Default connection: `postgresql://user:password@localhost:5432/adaptive_lms`

## Troubleshooting

### Connection refused
Ensure PostgreSQL is running:
```bash
docker-compose up -d postgres
# or
sudo systemctl start postgresql
```

### Import errors
Make sure you're running from the correct directory and the backend is in your Python path:
```bash
cd /path/to/adaptive-lms/db
python seed.py
```

### Permission denied
The script adds the backend directory to the Python path automatically. If you still have issues:
```bash
export PYTHONPATH=/path/to/adaptive-lms/backend:$PYTHONPATH
python seed.py
```

## Development

To modify seed data:
1. Edit the data dictionaries in `seed.py`
2. Add new seeding methods to the `DatabaseSeeder` class
3. Call new methods from `run_all()`
4. Test with `--reset` flag to ensure clean state

## Security Note

This script uses simple SHA-256 hashing for development passwords. In production, the application should use proper password hashing (bcrypt, argon2, etc.).
