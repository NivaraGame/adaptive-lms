# Adaptive LMS Backend

FastAPI-based backend for the Adaptive Learning Management System.

## Setup

### 1. Install Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Set Up Database

```bash
# Start PostgreSQL (via Docker)
docker run --name adaptive-lms-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=adaptive_lms \
  -p 5432:5432 \
  -d postgres:15

# TODO: set up Alembic
# Run migrations 
# alembic upgrade head
```

### 4. Run the Application

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/routes/          # API endpoints
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   ├── core/                # Core components (adaptation, metrics)
│   ├── db/                  # Database configuration
│   ├── utils/               # Utilities
│   ├── config.py            # Settings
│   └── main.py              # Application entry point
├── tests/                   # Tests
├── requirements.txt
└── README.md
```

## Development

### Run Tests

```bash
pytest
```

### Code Formatting

```bash
black app/
flake8 app/
```

## Next Steps

1. Implement Alembic migrations
2. Complete adaptation engine implementation
3. Add LLM integration service
4. Implement metrics computation pipeline
5. Add authentication and authorization
6. Write comprehensive tests
