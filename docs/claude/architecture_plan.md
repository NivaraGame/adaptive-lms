# Technical Architecture Plan

## Overview

This document describes the high-level technical architecture for the Adaptive Learning Management System. The system consists of a FastAPI backend, React frontend, PostgreSQL database, and integration with Large Language Models (LLMs) for advanced metrics and content generation.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  - Student Dashboard    - Learning Interface   - Admin Panel    │
└───────────────┬─────────────────────────────────────────────────┘
                │ HTTP/REST API
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                             │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   API Layer  │  │   Services   │  │  Adaptation  │          │
│  │   (Routes)   │  │    Layer     │  │    Engine    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Metrics    │  │     LLM      │  │   Content    │          │
│  │  Processor   │  │  Integration │  │   Selector   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────┬─────────────────────────┬───────────────────────┘
                │                         │
                ▼                         ▼
┌─────────────────────────┐    ┌──────────────────────┐
│  PostgreSQL Database    │    │   LLM Service        │
│  - Users                │    │   (Ollama/DeepSeek)  │
│  - Dialogs              │    │   - Awareness eval   │
│  - Messages             │    │   - Error analysis   │
│  - Metrics              │    │   - Content gen      │
│  - Content              │    └──────────────────────┘
│  - User Profiles        │
└─────────────────────────┘
```

## 1. Backend Architecture (FastAPI)

### 1.1 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Application entry point
│   ├── config.py               # Configuration management
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── api/                    # API layer
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── dialogs.py      # Dialog endpoints
│   │   │   ├── messages.py     # Message endpoints
│   │   │   ├── metrics.py      # Metrics endpoints
│   │   │   ├── users.py        # User management
│   │   │   ├── content.py      # Content management
│   │   │   └── recommendations.py  # Recommendation endpoints
│   │   └── middleware/
│   │       ├── __init__.py
│   │       ├── auth.py         # Authentication
│   │       └── logging.py      # Request logging
│   │
│   ├── models/                 # Database models (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── dialog.py
│   │   ├── message.py
│   │   ├── metric.py
│   │   ├── content.py
│   │   └── user_profile.py
│   │
│   ├── schemas/                # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── dialog.py
│   │   ├── message.py
│   │   ├── metric.py
│   │   └── recommendation.py
│   │
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── dialog_service.py
│   │   ├── metrics_service.py
│   │   ├── content_service.py
│   │   ├── user_service.py
│   │   └── llm_service.py      # LLM integration
│   │
│   ├── core/                   # Core system components
│   │   ├── __init__.py
│   │   ├── adaptation/         # Adaptation engine
│   │   │   ├── __init__.py
│   │   │   ├── engine.py       # Main adaptation logic
│   │   │   ├── rules.py        # Rule-based adapter (Level A)
│   │   │   ├── bandit.py       # Contextual bandit (Level B)
│   │   │   └── irt_bkt.py      # IRT/BKT models (Level C)
│   │   ├── metrics/            # Metrics computation
│   │   │   ├── __init__.py
│   │   │   ├── synchronous.py  # Fast metrics
│   │   │   ├── asynchronous.py # LLM-based metrics
│   │   │   └── aggregators.py  # EMA, rolling averages
│   │   └── recommendation/     # Content recommendation
│   │       ├── __init__.py
│   │       ├── selector.py
│   │       └── ranker.py
│   │
│   ├── db/                     # Database utilities
│   │   ├── __init__.py
│   │   ├── session.py          # DB session management
│   │   └── migrations/         # Alembic migrations
│   │
│   └── utils/                  # Utility functions
│       ├── __init__.py
│       ├── logger.py
│       └── validators.py
│
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── test_api/
│   ├── test_services/
│   └── test_core/
│
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
└── README.md
```

### 1.2 Core Backend Modules

#### 1.2.1 API Layer (`app/api/routes/`)
**Responsibility**: Handle HTTP requests, validate input, return responses

**Main Endpoints**:
- `POST /api/v1/users` — Create user
- `GET /api/v1/users/{user_id}` — Get user profile
- `POST /api/v1/dialogs` — Start new dialog
- `GET /api/v1/dialogs/{dialog_id}` — Get dialog history
- `POST /api/v1/messages` — Send message in dialog
- `POST /api/v1/metrics` — Log metric event
- `GET /api/v1/metrics/user/{user_id}` — Get user metrics
- `POST /api/v1/recommendations/next` — Get next recommended content
- `GET /api/v1/content` — List available content
- `GET /api/v1/content/{content_id}` — Get specific content item

#### 1.2.2 Services Layer (`app/services/`)
**Responsibility**: Business logic, orchestration between components

**Key Services**:
- **DialogService**: Manage dialog lifecycle, store messages
- **MetricsService**: Compute and store metrics, trigger async LLM evaluation
- **ContentService**: Retrieve and filter content based on criteria
- **UserService**: Manage user profiles, update mastery levels
- **LLMService**: Interface with external LLM APIs (Ollama, DeepSeek)

#### 1.2.3 Adaptation Engine (`app/core/adaptation/`)
**Responsibility**: Make adaptation decisions based on metrics

**Components**:
- **AdaptationEngine** (main): Orchestrates all adaptation strategies
- **RulesAdapter**: Level A - simple threshold-based rules
- **BanditAdapter**: Level B - contextual bandit for content selection
- **IRTBKTAdapter**: Level C - advanced probabilistic models

**Data Flow**:
```
User Action → Metrics → User Profile → Adaptation Engine → Decision
                                                              ↓
                                            (next_difficulty, next_format,
                                             next_tempo, remediation_focus)
```

#### 1.2.4 Metrics Processor (`app/core/metrics/`)
**Responsibility**: Compute 17 metrics from dialog events

**Types**:
- **Synchronous Metrics** (computed immediately):
  - interaction_time, response_time, accuracy, attempts_count
  - followups_count, difficulty_level

- **Asynchronous Metrics** (computed selectively via LLM):
  - awareness_score, explanation_depth, confidence_level
  - error_type, error_pattern, comprehension_rating

**Aggregators**: EMA (Exponential Moving Average), rolling windows for topic mastery

## 2. Frontend Architecture (React)

### 2.1 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/             # Reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── dialogs/            # Dialog-related components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── InputArea.tsx
│   │   ├── content/            # Content display
│   │   │   ├── LessonViewer.tsx
│   │   │   ├── ExerciseCard.tsx
│   │   │   └── HintPanel.tsx
│   │   └── metrics/            # Metrics visualization
│   │       ├── ProgressChart.tsx
│   │       └── MasteryIndicator.tsx
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx       # Student dashboard
│   │   ├── Learning.tsx        # Main learning interface
│   │   ├── Profile.tsx         # User profile
│   │   └── Admin.tsx           # Admin panel
│   │
│   ├── services/               # API clients
│   │   ├── api.ts              # Axios configuration
│   │   ├── dialogService.ts
│   │   ├── contentService.ts
│   │   └── userService.ts
│   │
│   ├── store/                  # State management (Redux/Zustand)
│   │   ├── dialogSlice.ts
│   │   ├── userSlice.ts
│   │   └── contentSlice.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useDialog.ts
│   │   ├── useMetrics.ts
│   │   └── useAdaptation.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── dialog.ts
│   │   ├── user.ts
│   │   └── content.ts
│   │
│   ├── utils/
│   │   └── formatters.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
└── tsconfig.json
```

### 2.2 Main Pages and Components

#### 2.2.1 Student Dashboard
- Overview of learning progress
- Current topic mastery levels
- Recommended next lessons
- Recent activity

#### 2.2.2 Learning Interface
- Chat-based interaction with system
- Content display (text/visual/video/interactive)
- Exercise/quiz interface
- Hint system
- Real-time feedback

#### 2.2.3 Admin Panel
- Content management (CRUD operations)
- User analytics
- System performance metrics
- Adaptation strategy configuration

## 3. Database Architecture (PostgreSQL)

### 3.1 Core Entities

```
users
├── user_id (PK)
├── username
├── email
├── created_at
└── updated_at

dialogs
├── dialog_id (PK)
├── user_id (FK → users)
├── dialog_type (educational/test/assessment/reflective)
├── topic
├── started_at
├── ended_at
└── metadata (JSONB)

messages
├── message_id (PK)
├── dialog_id (FK → dialogs)
├── sender_type (user/system)
├── content
├── timestamp
├── is_question (boolean)
└── metadata (JSONB)

content_items
├── content_id (PK)
├── title
├── topic
├── subtopic
├── difficulty_level (easy/normal/hard/challenge)
├── format (text/visual/video/interactive)
├── content_data (JSONB)
├── reference_answer (JSONB)
└── hints (JSONB array)

metrics
├── metric_id (PK)
├── user_id (FK → users)
├── dialog_id (FK → dialogs)
├── message_id (FK → messages, nullable)
├── metric_name
├── metric_value_f (float, nullable)
├── metric_value_s (string, nullable)
├── metric_value_j (JSONB, nullable)
├── timestamp
└── context (JSONB)

user_profiles
├── profile_id (PK)
├── user_id (FK → users, unique)
├── topic_mastery (JSONB) — {"topic1": 0.75, "topic2": 0.60, ...}
├── preferred_format (text/visual/video/interactive)
├── learning_pace (slow/medium/fast)
├── error_patterns (JSONB array)
├── avg_response_time (float)
├── last_updated
└── metadata (JSONB)

experiments
├── experiment_id (PK)
├── user_id (FK → users)
├── variant_name
├── started_at
└── ended_at
```

### 3.2 Key Relationships

- `users` 1:N `dialogs`
- `users` 1:1 `user_profiles`
- `dialogs` 1:N `messages`
- `dialogs` 1:N `metrics`
- `content_items` referenced by recommendation logic

### 3.3 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_dialogs_user_id ON dialogs(user_id);
CREATE INDEX idx_messages_dialog_id ON messages(dialog_id);
CREATE INDEX idx_metrics_user_id ON metrics(user_id);
CREATE INDEX idx_metrics_dialog_id ON metrics(dialog_id);
CREATE INDEX idx_content_difficulty ON content_items(difficulty_level);
CREATE INDEX idx_content_topic ON content_items(topic);

-- JSONB indexes for fast queries
CREATE INDEX idx_user_profile_mastery ON user_profiles USING gin(topic_mastery);
CREATE INDEX idx_content_skills ON content_items USING gin(content_data);
```

## 4. LLM Integration

### 4.1 Integration Points

**LLM is used for**:
1. **Asynchronous Metrics Computation** (10-20% of interactions):
   - Awareness score: evaluate quality of user explanations
   - Explanation depth: count reasoning steps
   - Error pattern classification: identify systematic mistakes
   - Comprehension sentiment analysis

2. **Content Generation** (optional):
   - Generate hints based on user error
   - Rephrase explanations in different styles
   - Create counterexamples for reflective dialogs

3. **Dialog Management**:
   - Understand user questions (NLU)
   - Generate contextual responses
   - Adapt tone based on emotional state

### 4.2 LLM Service Architecture

```python
class LLMService:
    def evaluate_awareness(self, user_explanation: str,
                          reference: str) -> float

    def classify_error_type(self, user_answer: str,
                           correct_answer: str) -> str

    def analyze_explanation_depth(self, explanation: str) -> float

    def generate_hint(self, exercise: dict,
                     user_error: str) -> str

    def rephrase_content(self, content: str,
                        target_format: str) -> str
```

### 4.3 LLM Provider Options

- **Ollama** (local deployment): Better for privacy, lower latency
- **DeepSeek / Claude / GPT** (API): Higher quality, easier setup
- **Hybrid**: Local for fast operations, API for complex analysis

## 5. Data Flow Examples

### 5.1 User Completes Exercise

```
1. User submits answer via React frontend
2. Frontend → POST /api/v1/messages (answer content)
3. Backend MessageService:
   - Stores message in database
   - Triggers MetricsService.compute_metrics()
4. MetricsService:
   - Computes synchronous metrics (accuracy, response_time, attempts)
   - Stores metrics in database
   - Optionally queues async LLM evaluation
5. MetricsService → UserService.update_profile()
6. UserService:
   - Updates topic_mastery (EMA)
   - Updates error_patterns if error detected
7. AdaptationEngine.get_next_recommendation():
   - Fetches user profile
   - Applies rules/bandit/IRT to decide next content
8. Backend → Response with next exercise + feedback
9. Frontend displays feedback and loads next content
```

### 5.2 System Adapts Content Format

```
1. User has high followups_count + low satisfaction in dialog
2. MetricsService detects pattern
3. AdaptationEngine:
   - Queries user_profile: preferred_format = NULL
   - Applies rule: many_followups + low_satisfaction → suggest visual
4. Updates user_profile.preferred_format = "visual"
5. Next content selection filters for format="visual" or "interactive"
6. ContentService returns visual content
7. Frontend renders diagram/animation instead of text
```

## 6. Security and Performance Considerations

### 6.1 Security
- **Authentication**: JWT tokens
- **Authorization**: Role-based access control (student/admin)
- **Data privacy**: Anonymization options, GDPR compliance
- **Input validation**: Pydantic schemas for all API inputs
- **SQL injection prevention**: SQLAlchemy ORM
- **Rate limiting**: Prevent abuse of LLM calls

### 6.2 Performance
- **Caching**: Redis for frequently accessed user profiles
- **Database connection pooling**: SQLAlchemy async pool
- **Async processing**: Celery for LLM metric computation
- **Pagination**: All list endpoints paginated
- **CDN**: Static content (videos, images) served via CDN

### 6.3 Scalability
- **Horizontal scaling**: Stateless backend (multiple instances)
- **Database read replicas**: For analytics queries
- **Message queue**: RabbitMQ/Redis for async tasks
- **Microservices (future)**: Split LLM service, metrics service

## 7. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                    │
└──────────────┬────────────────────────┬─────────────────────┘
               │                        │
       ┌───────▼────────┐      ┌────────▼───────┐
       │ Frontend       │      │ Backend        │
       │ (React SPA)    │      │ (FastAPI)      │
       │ Docker         │      │ Docker         │
       └────────────────┘      └────────┬───────┘
                                        │
                          ┌─────────────┼──────────────┐
                          │             │              │
                   ┌──────▼──────┐ ┌───▼────┐  ┌──────▼─────┐
                   │ PostgreSQL  │ │ Redis  │  │ Celery     │
                   │ Database    │ │ Cache  │  │ Workers    │
                   └─────────────┘ └────────┘  └──────┬─────┘
                                                       │
                                                ┌──────▼─────┐
                                                │ LLM Service│
                                                │ (Ollama)   │
                                                └────────────┘
```

### Docker Compose Services:
- `frontend`: React app (nginx)
- `backend`: FastAPI application
- `db`: PostgreSQL database
- `redis`: Cache and message broker
- `celery-worker`: Async task processor
- `ollama`: Local LLM service (optional)

## 8. Monitoring and Observability

### 8.1 Logging
- Structured logging (JSON format)
- Log levels: DEBUG, INFO, WARNING, ERROR
- Centralized logging (ELK stack or similar)

### 8.2 Metrics
- API response times
- Database query performance
- LLM call latency
- User engagement metrics
- Adaptation decision accuracy

### 8.3 Alerting
- High error rates
- Slow response times
- Database connection issues
- LLM service downtime

## 9. Development Workflow

1. **Local Development**:
   - Docker Compose for full stack
   - Hot reload for backend and frontend
   - Local PostgreSQL instance

2. **Testing**:
   - Unit tests (pytest for backend, Jest for frontend)
   - Integration tests (API endpoints)
   - E2E tests (Playwright/Cypress)

3. **CI/CD**:
   - GitHub Actions / GitLab CI
   - Automated testing on push
   - Docker image building
   - Deployment to staging/production

## 10. Future Enhancements

- **Real-time collaboration**: Multiple users in same dialog
- **Mobile app**: React Native implementation
- **Advanced analytics**: ML-based insights dashboard
- **Content authoring tools**: Visual editor for creating exercises
- **Gamification**: Points, badges, leaderboards
- **A/B testing framework**: Test different adaptation strategies
