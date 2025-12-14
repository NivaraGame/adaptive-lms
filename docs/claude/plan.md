# Implementation Plan for Adaptive LMS

## Overview

This document provides a step-by-step implementation plan for building the Adaptive Learning Management System. The plan is organized into phases, with each phase building upon the previous one.

## Phase 1: Foundation and MVP (Weeks 1-3)

### Week 1: Development Environment Setup

**Backend Tasks:**
- [ ] Set up Python virtual environment
- [ ] Install dependencies from `requirements.txt`
- [ ] Create `.env` file from `.env.example`
- [ ] Set up PostgreSQL database (Docker or local)
- [ ] Run database schema (`db/schema.sql`)
- [ ] Verify FastAPI server starts (`uvicorn app.main:app --reload`)
- [ ] Test API endpoints with Swagger UI (`http://localhost:8000/docs`)
- [ ] Create sample users and content using API

**Database Tasks:**
- [ ] Set up Alembic for database migrations
  ```bash
  alembic init alembic
  alembic revision --autogenerate -m "Initial schema"
  alembic upgrade head
  ```
- [ ] Create seed data script for development
- [ ] Verify all tables and indexes are created
- [ ] Test JSONB queries (topic_mastery, skills, etc.)

**DevOps Tasks:**
- [ ] Create `docker-compose.yml` for local development
  - PostgreSQL service
  - Redis service (for future caching)
  - Backend service
- [ ] Set up Git repository structure and `.gitignore`
- [ ] Document environment setup in README

**Deliverable**: Working backend API with database, testable via Swagger UI

---

### Week 2: Core Backend Implementation

**Metrics Service:**
- [ ] Implement `app/core/metrics/synchronous.py`
  - Compute basic metrics: accuracy, response_time, attempts_count, followups_count
  - Extract metrics from dialog/message events
  - Store in metrics table
- [ ] Implement `app/core/metrics/aggregators.py`
  - Exponential Moving Average (EMA) for topic mastery
  - Rolling averages for response time
  - Update user profile after each interaction
- [ ] Create metrics computation workflow
  - Triggered after each message/dialog event
  - Update user_profile table

**User Profile Service:**
- [ ] Implement `app/services/user_service.py`
  - `create_user_profile()` - Initialize profile for new users
  - `update_profile()` - Update aggregated metrics
  - `get_profile()` - Retrieve user profile
  - `update_topic_mastery()` - EMA update for topics
- [ ] Add profile initialization on user creation
- [ ] Test profile updates with sample interactions

**Content Service:**
- [ ] Implement `app/services/content_service.py`
  - `get_content_by_filters()` - Query by topic/difficulty/format
  - `get_random_content()` - Random selection for cold start
  - `get_next_in_sequence()` - Sequential learning path
- [ ] Add pagination support
- [ ] Create content filtering logic

**Deliverable**: Working metrics computation and user profile management

---

### Week 3: Rules-Based Adaptation (Level A)

**Adaptation Engine:**
- [ ] Implement `app/core/adaptation/rules.py`
  - `RulesAdapter` class with threshold-based decisions
  - Decision functions:
    - `decide_difficulty()` - Based on accuracy and response time
    - `decide_format()` - Based on followups and satisfaction
    - `decide_tempo()` - Based on session length
    - `identify_remediation()` - Weak topics from profile
- [ ] Implement `app/core/adaptation/engine.py`
  - `AdaptationEngine` class to orchestrate strategies
  - `get_recommendation()` - Main entry point
  - Mode selection (rules/bandit/policy)

**Recommendation Service:**
- [ ] Complete `app/services/recommendation_service.py`
  - Fetch user profile and recent metrics
  - Call adaptation engine
  - Query content matching recommendations
  - Rank and return top recommendation
- [ ] Add reasoning/explanation generation
- [ ] Test with various user scenarios

**API Integration:**
- [ ] Update `/api/v1/recommendations/next` endpoint
- [ ] Add recommendation request validation
- [ ] Test full flow: user answer → metrics → profile update → recommendation

**Testing:**
- [ ] Write unit tests for rules adapter
- [ ] Write integration tests for recommendation flow
- [ ] Manual testing with different user patterns

**Deliverable**: Working MVP with rules-based adaptation

---

## Phase 2: Frontend and User Experience (Weeks 4-6)

### Week 4: React Frontend Setup

**Project Setup:**
- [ ] Initialize React project with Vite
  ```bash
  cd frontend
  npm create vite@latest . -- --template react-ts
  npm install
  ```
- [ ] Install dependencies
  - `axios` - API client
  - `@tanstack/react-query` - Data fetching
  - `zustand` or `redux-toolkit` - State management
  - `react-router-dom` - Routing
  - `tailwindcss` - Styling (optional)
- [ ] Set up TypeScript types for API schemas
- [ ] Create API client service

**Core Components:**
- [ ] Create `services/api.ts` - Axios configuration
- [ ] Create `services/dialogService.ts` - Dialog API calls
- [ ] Create `services/contentService.ts` - Content API calls
- [ ] Create `services/userService.ts` - User API calls
- [ ] Set up routing (dashboard, learning, profile)

**Deliverable**: React project with API integration

---

### Week 5: Learning Interface

**Chat Interface:**
- [ ] Create `components/dialogs/ChatInterface.tsx`
  - Display dialog history
  - Message bubbles (user vs system)
  - Input area for user responses
  - Loading states
- [ ] Create `components/dialogs/MessageBubble.tsx`
- [ ] Create `components/dialogs/InputArea.tsx`
- [ ] Implement real-time message updates

**Content Display:**
- [ ] Create `components/content/LessonViewer.tsx`
  - Render different content formats (text/visual/video)
  - Handle JSON content_data structure
  - Display hints (collapsible)
  - Show explanations after answers
- [ ] Create `components/content/ExerciseCard.tsx`
  - Display questions
  - Multiple choice / text input
  - Submit button
  - Feedback display
- [ ] Create `components/content/HintPanel.tsx`
  - Progressive hint disclosure
  - Track hint usage for metrics

**Learning Flow:**
- [ ] Implement dialog creation on page load
- [ ] Implement message sending and receiving
- [ ] Implement content fetching based on recommendations
- [ ] Implement answer submission and feedback
- [ ] Implement "next content" button

**Deliverable**: Functional learning interface

---

### Week 6: Dashboard and Visualizations

**Student Dashboard:**
- [ ] Create `pages/Dashboard.tsx`
  - Overview of learning progress
  - Recent activity feed
  - Current topic mastery bars
  - Recommended next lessons
- [ ] Create `components/metrics/ProgressChart.tsx`
  - Chart library (Chart.js or Recharts)
  - Display accuracy over time
  - Display time spent per topic
- [ ] Create `components/metrics/MasteryIndicator.tsx`
  - Visual representation of topic mastery
  - Color coding (red/yellow/green)

**User Profile Page:**
- [ ] Create `pages/Profile.tsx`
  - Display user information
  - Learning statistics
  - Preferences (preferred format, difficulty)
  - Edit profile settings

**Polish:**
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Add toast notifications
- [ ] Responsive design (mobile-friendly)

**Deliverable**: Complete student-facing UI

---

## Phase 3: ML Enhancement (Weeks 7-9)

### Week 7: Contextual Bandit Implementation (Level B)

**Bandit Algorithm:**
- [ ] Implement `app/core/adaptation/bandit.py`
  - `LinUCBBandit` class
  - `select_arm()` method
  - `update()` method
  - Model persistence (save/load)
- [ ] Define arms (format × difficulty combinations)
- [ ] Implement reward computation function
- [ ] Create feature extraction function (17 metrics → vector)

**Integration:**
- [ ] Create `BanditAdapter` in adaptation engine
- [ ] Implement online learning loop
  - Background task to update model
  - Queue user interactions for batch updates
- [ ] Add bandit model initialization on startup
- [ ] Add model checkpointing (save every N updates)

**Testing:**
- [ ] Unit tests for LinUCB algorithm
- [ ] Simulate user interactions and verify learning
- [ ] Compare bandit vs rules performance (offline eval)

**Deliverable**: Working contextual bandit adapter

---

### Week 8: LLM Service Integration

**LLM Service:**
- [ ] Implement `app/services/llm_service.py`
  - `LLMService` class
  - Provider abstraction (Ollama/OpenAI/DeepSeek)
  - `evaluate_awareness()` - Score explanation quality
  - `classify_error_type()` - Identify error category
  - `analyze_explanation_depth()` - Count reasoning steps
  - `generate_hint()` - Create contextual hints
- [ ] Set up Ollama locally or configure API keys
- [ ] Implement prompt templates for each task
- [ ] Add retry logic and error handling

**Async Metrics:**
- [ ] Implement `app/core/metrics/asynchronous.py`
  - Celery tasks for LLM calls (optional)
  - Sample 10-20% of interactions
  - Compute awareness, depth, confidence
  - Store in metrics table
- [ ] Set up task queue (Celery + Redis or simple async)
- [ ] Add background worker

**Integration:**
- [ ] Trigger async metrics after user explanations
- [ ] Update user profile with LLM-based metrics
- [ ] Use LLM metrics in adaptation decisions

**Deliverable**: LLM-powered metrics computation

---

### Week 9: Advanced Adaptation (Level C - Optional)

**IRT/BKT Implementation:**
- [ ] Implement `app/core/adaptation/irt_bkt.py`
  - `IRTModel` class (1PL Rasch model)
  - `BKTModel` class
  - `PolicyAdapter` class
- [ ] Calibrate item difficulties from data
- [ ] Initialize user abilities
- [ ] Track skill mastery per user
- [ ] Implement policy learner

**Comparison:**
- [ ] Create evaluation framework
  - Offline replay of historical data
  - A/B testing setup
- [ ] Compare all three levels (rules/bandit/policy)
- [ ] Document performance differences

**Deliverable**: Advanced ML adapter with evaluation

---

## Phase 4: Production Readiness (Weeks 10-12)

### Week 10: Testing and Quality

**Backend Tests:**
- [ ] Unit tests for all core modules (adaptation, metrics, services)
  - Target: 80%+ coverage
- [ ] Integration tests for API endpoints
- [ ] Database tests (rollback after each test)
- [ ] Mock LLM service for testing
- [ ] Performance tests (response time, throughput)

**Frontend Tests:**
- [ ] Unit tests for components (Jest + React Testing Library)
- [ ] Integration tests for user flows
- [ ] E2E tests (Playwright or Cypress)
  - User registration flow
  - Dialog creation and interaction
  - Content recommendation flow

**Load Testing:**
- [ ] Use Locust or k6 to simulate users
- [ ] Test concurrent dialogs
- [ ] Identify bottlenecks
- [ ] Optimize slow queries

**Deliverable**: Comprehensive test suite

---

### Week 11: Deployment and DevOps

**Containerization:**
- [ ] Create production `Dockerfile` for backend
  - Multi-stage build
  - Non-root user
  - Health checks
- [ ] Create `Dockerfile` for frontend
  - Build optimized production bundle
  - Serve with nginx
- [ ] Update `docker-compose.yml` for production
  - Separate dev and prod configs
  - Volume mounts for persistence
  - Environment variable management

**CI/CD Pipeline:**
- [ ] Set up GitHub Actions or GitLab CI
  - Lint and format check (black, flake8)
  - Run tests
  - Build Docker images
  - Push to registry
- [ ] Set up staging environment
- [ ] Set up production environment
- [ ] Implement blue-green deployment or rolling updates

**Monitoring:**
- [ ] Add structured logging (JSON format)
- [ ] Set up Prometheus metrics (optional)
- [ ] Set up error tracking (Sentry or similar)
- [ ] Create health check endpoints
- [ ] Set up uptime monitoring

**Deliverable**: Production deployment pipeline

---

### Week 12: Admin Panel and Analytics

**Admin Interface:**
- [ ] Create admin routes (protected)
  - `/admin/users` - User management
  - `/admin/content` - Content CRUD
  - `/admin/analytics` - System analytics
- [ ] Create admin React pages
  - User list with filters
  - Content editor (form for creating exercises)
  - Analytics dashboard
- [ ] Implement authentication middleware
- [ ] Add role-based access control

**Analytics:**
- [ ] Create analytics queries
  - User engagement metrics
  - Content effectiveness (avg accuracy per content)
  - Adaptation performance (bandit arm statistics)
  - LLM usage statistics
- [ ] Create visualization components
- [ ] Export functionality (CSV/JSON)

**Documentation:**
- [ ] API documentation (beyond Swagger)
- [ ] User guide for students
- [ ] Admin manual
- [ ] Developer documentation
- [ ] Deployment guide

**Deliverable**: Complete system with admin panel

---

## Phase 5: Optimization and Launch (Weeks 13-14)

### Week 13: Performance Optimization

**Database Optimization:**
- [ ] Analyze slow queries (PostgreSQL slow query log)
- [ ] Add missing indexes
- [ ] Optimize JSONB queries
- [ ] Implement database connection pooling
- [ ] Set up read replicas for analytics (optional)

**Caching:**
- [ ] Implement Redis caching for:
  - User profiles (frequently accessed)
  - Content items (static data)
  - Bandit model state
- [ ] Add cache invalidation logic
- [ ] Set appropriate TTLs

**Frontend Optimization:**
- [ ] Code splitting for routes
- [ ] Lazy loading for components
- [ ] Image optimization
- [ ] Bundle size analysis and reduction
- [ ] Add service worker for offline support (PWA)

**Deliverable**: Optimized system

---

### Week 14: Final Testing and Launch

**User Acceptance Testing:**
- [ ] Recruit beta testers
- [ ] Gather feedback on UX
- [ ] Fix critical bugs
- [ ] Adjust adaptation parameters based on feedback

**Security Audit:**
- [ ] Review authentication implementation
- [ ] Check for SQL injection vulnerabilities
- [ ] Validate input sanitization
- [ ] Review CORS configuration
- [ ] Check for XSS vulnerabilities
- [ ] Review API rate limiting

**Launch Preparation:**
- [ ] Prepare launch content (sample lessons/exercises)
- [ ] Create onboarding flow for new users
- [ ] Set up analytics tracking
- [ ] Prepare marketing materials (if applicable)

**Launch:**
- [ ] Deploy to production
- [ ] Monitor errors and performance
- [ ] Be ready for hotfixes
- [ ] Gather initial user feedback

**Deliverable**: Live production system

---

## Post-Launch: Continuous Improvement

### Ongoing Tasks

**Monitoring:**
- [ ] Daily check of error rates
- [ ] Weekly review of adaptation performance
- [ ] Monthly user engagement analysis
- [ ] Quarterly system health review

**Content Development:**
- [ ] Create more content items
- [ ] Diversify topics
- [ ] Add different content formats
- [ ] Incorporate user feedback

**Model Improvement:**
- [ ] Retrain bandit model with more data
- [ ] Tune hyperparameters (alpha, reward weights)
- [ ] Experiment with new features
- [ ] A/B test model variants

**Feature Additions:**
- [ ] Gamification (points, badges, leaderboards)
- [ ] Social features (peer learning, forums)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Content authoring tools

---

## Risk Mitigation

### Technical Risks

**Risk**: Database performance degrades with scale
- **Mitigation**: Implement caching, read replicas, query optimization
- **Monitoring**: Track query performance, set alerts

**Risk**: LLM API costs too high or latency too long
- **Mitigation**: Use sampling (20%), implement local Ollama, cache results
- **Monitoring**: Track API usage and costs

**Risk**: Bandit model doesn't learn effectively
- **Mitigation**: Start with rules, gradually transition, extensive testing
- **Fallback**: Rules-based adapter always available

### Resource Risks

**Risk**: Limited development time
- **Mitigation**: Prioritize MVP features, use boilerplate code, focus on core functionality
- **Plan**: Can stop at any phase and have working system

**Risk**: Limited hosting budget
- **Mitigation**: Start with single server, use Docker Compose, scale horizontally as needed
- **Option**: Use free tiers (Railway, Render, Heroku for staging)

---

## Success Metrics

### MVP Success (Phase 1)
- [ ] Backend API functional with all endpoints
- [ ] Database schema deployed and tested
- [ ] Rules-based adaptation working
- [ ] Can create users, dialogs, and get recommendations

### Production Success (Phase 2-4)
- [ ] Frontend deployed and accessible
- [ ] Users can complete full learning sessions
- [ ] Adaptation engine provides personalized recommendations
- [ ] System is stable and performant
- [ ] 80%+ test coverage

### Research Success (Phase 3+)
- [ ] Contextual bandit implemented and learning
- [ ] LLM integration working for metrics
- [ ] Measurable improvement over random content selection
- [ ] Publishable results (for thesis)

---

## Estimated Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| Phase 1 | 3 weeks | MVP with rules-based adaptation |
| Phase 2 | 3 weeks | Full frontend with learning interface |
| Phase 3 | 3 weeks | ML-powered adaptation (bandit + LLM) |
| Phase 4 | 3 weeks | Production-ready system |
| Phase 5 | 2 weeks | Optimized and launched |
| **Total** | **14 weeks** | **Complete adaptive LMS** |

**Flexible Milestones**:
- Can stop after Phase 1 for basic working system
- Can skip Phase 3 (Level C) if not needed for research
- Can extend Phase 5 for more features

---

## Next Immediate Steps

1. **Set up development environment** (Week 1, Day 1)
   - Clone repository
   - Create virtual environment
   - Install dependencies
   - Start database
   - Run backend server

2. **Test all endpoints** (Week 1, Day 2)
   - Create test user via API
   - Create test dialog
   - Send messages
   - Verify database entries

3. **Implement first metric** (Week 2, Day 1)
   - Start with simple metric (accuracy)
   - Trigger computation on message
   - Store in database
   - Verify in API response

4. **Build from there** - Follow week-by-week plan

**Good luck with the implementation!** 🚀
