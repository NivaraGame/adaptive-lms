# Week 3: Rules-Based Adaptation (Level A)

## Overview

Week 3 focuses on implementing the **rules-based adaptation engine** that powers personalized content recommendations. The main goal is to create a threshold-based decision system that analyzes user profiles and metrics to recommend appropriate content difficulty, format, tempo, and identify topics needing remediation. This week completes the MVP by connecting all backend services into an intelligent recommendation system.

---

## 1. Rules Adapter - Core Decision Logic

### Module: `app/core/adaptation/rules.py`

- [x] Create the rules adapter module file structure
- [x] Define threshold constants and configuration
  - [x] Define accuracy thresholds (e.g., high: >0.8, medium: 0.5-0.8, low: <0.5)
  - [x] Define response time thresholds (fast: <30s, normal: 30-90s, slow: >90s)
  - [x] Define mastery thresholds (mastered: >0.7, learning: 0.4-0.7, struggling: <0.4)
  - [x] Define followup count thresholds (high engagement: >3, low: 0-1)
  - [x] Make thresholds configurable (environment variables or config file)
- [x] Implement `RulesAdapter` class
  - [x] Initialize with configuration parameters
  - [x] Create helper methods for threshold checking
  - [x] Implement decision state tracking
- [x] Implement `decide_difficulty(user_profile, recent_metrics)` function
  - [x] Extract recent accuracy from metrics (last 5-10 interactions)
  - [x] Extract average response time
  - [x] Calculate current difficulty level
  - [x] Apply rules:
    - [x] If accuracy > 0.8 AND response_time < 60s → Increase difficulty
    - [x] If accuracy < 0.5 OR response_time > 120s → Decrease difficulty
    - [x] Otherwise → Keep same difficulty
  - [x] Return recommended difficulty level (easy/normal/hard/challenge)
  - [x] Return confidence score (0-1)
- [x] Implement `decide_format(user_profile, recent_metrics)` function
  - [x] Extract followups_count from recent metrics
  - [x] Extract satisfaction/feedback signals (if available)
  - [x] Check user's preferred_format from profile (if set)
  - [x] Apply rules:
    - [x] If followups > 3 → Visual or interactive format (needs more support)
    - [x] If quick responses + high accuracy → Text format (efficient learner)
    - [x] If slow responses → Video format (needs more explanation)
    - [x] If preferred_format set → Bias towards preference
  - [x] Return recommended format (text/visual/video/interactive)
  - [x] Return confidence score
- [x] Implement `decide_tempo(user_profile, session_metrics)` function
  - [x] Calculate session length (time since dialog started)
  - [x] Count interactions in current session
  - [x] Extract average response time
  - [x] Apply rules:
    - [x] If session > 60 min → Suggest break or lighter content
    - [x] If interactions > 20 in session → Suggest review or recap
    - [x] If response_time increasing over session → Fatigue detected, slow down
    - [x] Otherwise → Normal tempo
  - [x] Return tempo recommendation (fast/normal/slow/break)
  - [x] Return reasoning string
- [x] Implement `identify_remediation(user_profile)` function
  - [x] Extract topic_mastery JSONB from profile
  - [x] Identify topics with mastery < 0.4 (struggling)
  - [x] Sort by lowest mastery first
  - [x] Return list of topics needing remediation
  - [x] Include mastery scores for each topic
- [x] Implement `get_recommendation(user_profile, recent_metrics, session_context)` function
  - [x] Call all decision functions
  - [x] Combine recommendations into single decision object
  - [x] Generate explanation text for why these recommendations were made
  - [x] Return structured recommendation (difficulty, format, tempo, topics, reasoning)
- [x] Add logging for all decisions
  - [x] Log input data (user_id, metrics summary)
  - [x] Log decision outputs
  - [x] Log threshold comparisons
- [x] Test rules adapter with sample profiles
  - [x] Test with high-performing user (accuracy > 0.8)
  - [x] Test with struggling user (accuracy < 0.5)
  - [x] Test with mixed performance user
  - [x] Test with new user (no history - cold start)
- [x] Verify all decision functions return expected outputs
  - [x] Check return types match schema
  - [x] Verify confidence scores are in [0, 1] range
  - [x] Verify reasoning text is generated

---

## 2. Adaptation Engine - Strategy Orchestration

### Module: `app/core/adaptation/engine.py`

- [x] Create the adaptation engine module file structure
- [x] Define adaptation strategy enum/types
  - [x] RULES - Threshold-based (Level A)
  - [x] BANDIT - Contextual bandit (Level B, future)
  - [x] POLICY - IRT/BKT policy learning (Level C, future)
- [x] Implement `AdaptationEngine` class
  - [x] Initialize with default strategy (RULES)
  - [x] Store reference to RulesAdapter instance
  - [x] Add strategy registry (for future extensibility)
  - [x] Implement strategy switching logic
- [x] Implement `set_strategy(strategy_type)` method
  - [x] Validate strategy type
  - [x] Switch active adapter
  - [x] Log strategy change
- [x] Implement `get_recommendation(user_id, context)` method
  - [x] Fetch user profile from database
  - [x] Fetch recent metrics (last 10 interactions)
  - [x] Fetch session context (current dialog info)
  - [x] Call active adapter's get_recommendation()
  - [x] Return recommendation object
  - [x] Handle errors (missing profile, no metrics, etc.)
- [x] Implement `get_current_strategy()` method
  - [x] Return active strategy type
  - [x] Include strategy metadata (version, config)
- [x] Implement fallback logic
  - [x] If adapter fails, fall back to safe default recommendation
  - [x] Log fallback events
  - [x] Return safe default recommendation
- [x] Add context building helper
  - [x] Extract session info (dialog_id, messages_count, start_time)
  - [x] Calculate session duration
  - [x] Identify current topic being studied
  - [x] Package into context object
- [x] Test adaptation engine initialization
  - [x] Verify default strategy is RULES
  - [x] Verify strategy switching works
- [x] Test get_recommendation() with various scenarios
  - [x] New user (cold start)
  - [x] User with history
  - [x] User mid-session
  - [x] Missing data scenarios
- [x] Test fallback behavior
  - [x] Simulate adapter failure
  - [x] Verify fallback to safe defaults
  - [x] Verify error logging

---

## 3. Recommendation Service - Business Logic

### Module: `app/services/recommendation_service.py`

- [x] Create or update the recommendation service module
- [x] Implement `RecommendationService` class
  - [x] Initialize with database session
  - [x] Store reference to AdaptationEngine
  - [x] Initialize content service dependency
- [x] Implement `get_next_recommendation(user_id, dialog_id)` function
  - [x] Validate inputs (user_id, dialog_id exist)
  - [x] Fetch user profile via adaptation_engine
  - [x] Fetch recent metrics for user
  - [x] Fetch current dialog info
  - [x] Build session context
  - [x] Call adaptation_engine.get_recommendation()
  - [x] Parse recommendation (difficulty, format, topics)
  - [x] Query content_service with filters
  - [x] Rank and select best content item
  - [x] Return content recommendation with reasoning
- [x] Implement content ranking logic
  - [x] If remediation needed, prioritize those topics
  - [x] Filter by recommended difficulty
  - [x] Filter by recommended format
  - [x] Apply diversity (avoid repeating same content)
  - [x] Score each candidate content item
  - [x] Return top-ranked item
- [x] Implement `generate_reasoning(recommendation, selected_content)` function
  - [x] Extract decision reasoning from adapter
  - [x] Add context about selected content
  - [x] Create human-readable explanation
  - [x] Return reasoning text
- [x] Implement cold start handling
  - [x] For new users with no history:
    - [x] Start with "normal" difficulty
    - [x] Select random topic
    - [x] Use preferred format if set, else "text"
    - [x] Return with cold start flag
  - [x] Log cold start events
- [x] Implement diversity tracking
  - [x] Track recently shown content IDs (last 5-10)
  - [x] Exclude from next recommendation
  - [x] Ensure user doesn't see same content repeatedly
- [x] Implement recommendation history retrieval
  - [x] Get recent recommendations for user
  - [x] Include timestamp and content details
  - [x] Return structured history
- [x] Test recommendation service with real data
  - [x] Test with high-performing user profile
  - [x] Test with struggling user profile
  - [x] Test with new user (cold start)
  - [x] Verify correct content is selected
  - [x] Verify reasoning is generated
- [x] Test edge cases
  - [x] No content matches filters → Fallback to closest match
  - [x] User profile missing → Create default profile
  - [x] No recent metrics → Cold start behavior
- [x] Test diversity logic
  - [x] Multi-tiered content selection strategy
  - [x] Verify fallback mechanisms work

---

## 4. API Integration

### Connecting Recommendation Service to Endpoints

- [x] Create or update recommendation endpoints
  - [x] `POST /api/v1/recommendations/next` - Get next content recommendation
  - [x] `GET /api/v1/recommendations/history` - Get user's recommendation history
  - [x] `GET /api/v1/recommendations/strategy` - Get current strategy info
- [x] Implement `POST /api/v1/recommendations/next` endpoint
  - [x] Define request schema (user_id, dialog_id, optional filters)
  - [x] Define response schema (content item, reasoning, confidence, metadata)
  - [x] Validate request body
  - [x] Call recommendation_service.get_next_recommendation()
  - [x] Return structured response
  - [x] Handle errors (404, 500)
- [x] Add request validation using Pydantic models
  - [x] Create `RecommendationRequest` schema
    - [x] user_id: int
    - [x] dialog_id: int (optional)
    - [x] override_difficulty: str (optional)
    - [x] override_format: str (optional)
  - [x] Validate inputs properly
- [x] Add response models
  - [x] Create `RecommendationResponse` schema
    - [x] content: ContentSummary
    - [x] reasoning: str
    - [x] confidence: float
    - [x] recommendation_metadata: RecommendationMetadata
    - [x] strategy_used: str
    - [x] timestamp: str
  - [x] Include all necessary fields
- [x] Add error handling
  - [x] Handle user not found (404)
  - [x] Handle no suitable content found (404 or fallback)
  - [x] Handle database errors (500)
  - [x] Handle adaptation engine errors (500)
  - [x] Return appropriate HTTP status codes
- [x] Add OpenAPI documentation
  - [x] Document request body
  - [x] Document response schema
  - [x] Add usage examples
  - [x] Document error responses
- [x] Test API endpoint via Swagger UI
  - [x] Create user
  - [x] Create dialog
  - [x] Request recommendation
  - [x] Verify response structure
  - [x] Verify content is appropriate
  - [x] Verify reasoning is present
- [x] Test API endpoint via curl or Postman
  - [x] Test with valid inputs
  - [x] Test with invalid user_id
  - [x] Test with missing dialog_id
  - [x] Test override parameters

---

## 5. Full Workflow Integration

### Connecting All Services End-to-End

- [x] Implement complete user interaction flow
  1. [x] User submits answer to content → POST /api/v1/messages
  2. [x] Metrics computed automatically (from Week 2)
  3. [x] User profile updated (from Week 2)
  4. [x] User requests next content → POST /api/v1/recommendations/next
  5. [x] Adaptation engine makes decision
  6. [x] Content selected and returned
- [x] Update message creation endpoint to include recommendation
  - [x] After message created and metrics computed
  - [x] Optionally auto-trigger next recommendation via `include_recommendation=true` query param
  - [x] Return recommendation in response (optional)
  - [x] Implementation: `app/api/routes/messages.py`
- [x] Add workflow logging
  - [x] Log each step of the flow with `[WORKFLOW]` prefix
  - [x] Track timing for each step (milliseconds)
  - [x] Identify bottlenecks via workflow_metadata
  - [x] Comprehensive logging in messages endpoint and workflow module
- [x] Add transaction handling
  - [x] Ensure metrics → profile → recommendation is atomic
  - [x] Rollback on errors with proper logging
  - [x] Maintain data consistency via explicit commits
  - [x] Implementation: `app/core/metrics/workflow.py`
- [x] Test complete flow end-to-end
  - [x] Create user
  - [x] Create dialog
  - [x] Submit answer (POST message)
  - [x] Verify metrics created
  - [x] Verify profile updated
  - [x] Request recommendation
  - [x] Verify appropriate content returned
  - [x] Repeat 5 times with different answers
  - [x] Verify recommendations change based on performance
  - [x] Implementation: `tests/test_workflow_manual.py`

---

## 6. End-to-End Testing

### Complete Flow Testing

- [ ] **Test Scenario 1: High-Performing User**
  - [ ] Create user and profile
  - [ ] Submit 5 correct answers on "algebra" topic (accuracy = 1.0)
  - [ ] Keep response times under 30 seconds
  - [ ] Request recommendation
  - [ ] Verify difficulty increased to "hard" or "challenge"
  - [ ] Verify reasoning mentions high accuracy
- [ ] **Test Scenario 2: Struggling User**
  - [ ] Create user and profile
  - [ ] Submit 5 incorrect answers on "calculus" topic (accuracy = 0.2)
  - [ ] Response times over 90 seconds
  - [ ] Request recommendation
  - [ ] Verify difficulty decreased to "easy"
  - [ ] Verify format changed to "visual" or "video"
  - [ ] Verify reasoning mentions low accuracy and slow response
- [ ] **Test Scenario 3: Mixed Performance**
  - [ ] Create user and profile
  - [ ] Submit 3 correct, 2 incorrect answers on "geometry"
  - [ ] Average accuracy ~0.6
  - [ ] Request recommendation
  - [ ] Verify difficulty is "normal"
  - [ ] Verify reasoning is balanced
- [ ] **Test Scenario 4: Cold Start (New User)**
  - [ ] Create brand new user (no interactions)
  - [ ] Request recommendation immediately
  - [ ] Verify recommendation is "normal" difficulty
  - [ ] Verify random topic selected
  - [ ] Verify reasoning mentions cold start
- [ ] **Test Scenario 5: Topic Remediation**
  - [ ] Create user with topic_mastery: {"algebra": 0.3, "calculus": 0.8}
  - [ ] Request recommendation
  - [ ] Verify "algebra" content recommended (weakest topic)
  - [ ] Verify reasoning mentions remediation
- [ ] **Test Scenario 6: Format Adaptation**
  - [ ] Create user
  - [ ] Submit answers with many followup questions (followups_count > 3)
  - [ ] Request recommendation
  - [ ] Verify format changed to "visual" or "interactive"
  - [ ] Verify reasoning mentions high followup count
- [ ] **Test Scenario 7: Session Fatigue**
  - [ ] Create user
  - [ ] Submit 20 answers in one dialog
  - [ ] Make response times increase over time (simulate fatigue)
  - [ ] Request recommendation
  - [ ] Verify tempo recommendation is "slow" or "break"
  - [ ] Verify reasoning mentions session length or fatigue
- [ ] **Test Scenario 8: Diversity Enforcement**
  - [ ] Create user
  - [ ] Request recommendation 5 times in a row (without submitting answers)
  - [ ] Verify different content returned each time
  - [ ] Verify no duplicate content_ids

---

## 7. Unit Testing

### Isolated Component Tests

- [ ] Write unit tests for `RulesAdapter`
  - [ ] Test `decide_difficulty()` with various accuracy/response_time inputs
    - [ ] High accuracy, fast response → Increase difficulty
    - [ ] Low accuracy, slow response → Decrease difficulty
    - [ ] Medium accuracy → Keep same
  - [ ] Test `decide_format()` with various followup counts
    - [ ] High followups → Visual/interactive
    - [ ] Low followups + fast → Text
  - [ ] Test `decide_tempo()` with session length
    - [ ] Long session → Suggest break
    - [ ] Normal session → Normal tempo
  - [ ] Test `identify_remediation()` with topic_mastery
    - [ ] Returns topics with mastery < 0.4
    - [ ] Sorted by lowest mastery first
  - [ ] Test `get_recommendation()` combines all decisions
    - [ ] Returns complete recommendation object
    - [ ] Reasoning is generated
- [ ] Write unit tests for `AdaptationEngine`
  - [ ] Test strategy initialization (default is RULES)
  - [ ] Test `set_strategy()` method
  - [ ] Test `get_recommendation()` delegates to adapter
  - [ ] Test fallback behavior on adapter failure
- [ ] Write unit tests for `RecommendationService`
  - [ ] Test `get_next_recommendation()` calls engine correctly
  - [ ] Test content ranking logic
  - [ ] Test cold start handling
  - [ ] Test diversity logic
  - [ ] Mock database and content_service dependencies
- [ ] Run all unit tests
  - [ ] Achieve >80% code coverage for new modules
  - [ ] Fix any failing tests
  - [ ] Document test results

---

## 8. Integration Testing

### Multi-Component Tests

- [ ] Write integration test for recommendation flow
  - [ ] Create test user in database
  - [ ] Create test content items
  - [ ] Insert test metrics
  - [ ] Call recommendation_service.get_next_recommendation()
  - [ ] Verify correct content selected
  - [ ] Verify database state
- [ ] Write integration test for API endpoint
  - [ ] Use TestClient (FastAPI testing)
  - [ ] POST to /api/v1/recommendations/next
  - [ ] Verify response status code
  - [ ] Verify response schema
  - [ ] Verify database queries executed correctly
- [ ] Write integration test for full workflow
  - [ ] POST /api/v1/users (create user)
  - [ ] POST /api/v1/dialogs (create dialog)
  - [ ] POST /api/v1/messages (submit answer)
  - [ ] POST /api/v1/recommendations/next (get recommendation)
  - [ ] Verify entire chain works
  - [ ] Rollback database after test
- [ ] Test error scenarios
  - [ ] Non-existent user_id
  - [ ] Invalid dialog_id
  - [ ] Database connection failure
  - [ ] No content available
- [ ] Run all integration tests
  - [ ] Use test database (not production)
  - [ ] Ensure tests are idempotent
  - [ ] Document test results

---

## 9. Manual Testing and Validation

### Interactive Testing via Swagger UI

- [ ] Test complete user journey
  1. [ ] Create user: POST /api/v1/users
  2. [ ] Verify profile auto-created: GET /api/v1/profiles/{user_id}
  3. [ ] Create dialog: POST /api/v1/dialogs
  4. [ ] Get initial recommendation: POST /api/v1/recommendations/next
  5. [ ] Submit answer to recommended content: POST /api/v1/messages
  6. [ ] Verify metrics created: GET /api/v1/metrics (if endpoint exists)
  7. [ ] Verify profile updated: GET /api/v1/profiles/{user_id}
  8. [ ] Get next recommendation: POST /api/v1/recommendations/next
  9. [ ] Verify recommendation changed appropriately
- [ ] Test with different user patterns
  - [ ] High performer (all correct answers)
  - [ ] Low performer (all incorrect answers)
  - [ ] Inconsistent performer (random answers)
  - [ ] Quick learner (fast + accurate)
  - [ ] Slow learner (slow but improving)
- [ ] Verify reasoning quality
  - [ ] Read reasoning text for each recommendation
  - [ ] Ensure it makes sense given user history
  - [ ] Check for typos or unclear language
- [ ] Verify recommendation diversity
  - [ ] Request multiple recommendations
  - [ ] Ensure no immediate repeats
- [ ] Test edge cases
  - [ ] User with empty profile
  - [ ] User with one topic mastered, others weak
  - [ ] Very long session (20+ interactions)
- [ ] Document test results
  - [ ] Create test report with screenshots
  - [ ] Note any issues or unexpected behavior
  - [ ] Create bug tickets if needed

---

## 10. Database Verification

### Data Integrity Checks

- [ ] Verify recommendation data storage (if storing recommendations)
  - [ ] Check recommendation history table exists
  - [ ] Verify columns: user_id, content_id, reasoning, timestamp, strategy_used
  - [ ] Query recommendations for test user
- [ ] Verify metrics → profile → recommendation flow
  - [ ] Submit interaction
  - [ ] Check metrics table has new entry
  - [ ] Check user_profile updated
  - [ ] Request recommendation
  - [ ] Verify recommendation based on updated profile
- [ ] Verify JSONB topic_mastery queries
  - [ ] Query users with high mastery in specific topic
  - [ ] Example: `SELECT * FROM user_profile WHERE topic_mastery->>'algebra' > '0.7'`
  - [ ] Verify query performance
- [ ] Check database indexes
  - [ ] Ensure indexes exist on frequently queried columns
  - [ ] user_profile.user_id (should already exist)
  - [ ] metrics.user_id (should already exist)
  - [ ] content.topic, content.difficulty, content.format
- [ ] Analyze query performance
  - [ ] Run EXPLAIN ANALYZE on recommendation query
  - [ ] Check for sequential scans
  - [ ] Add indexes if needed

---

## 11. Code Quality and Documentation

- [ ] Add docstrings to all functions
  - [ ] RulesAdapter methods (decide_difficulty, decide_format, etc.)
  - [ ] AdaptationEngine methods
  - [ ] RecommendationService methods
  - [ ] Include parameter descriptions
  - [ ] Include return type descriptions
  - [ ] Include usage examples
- [ ] Add type hints to all functions
  - [ ] Use Python typing module (List, Dict, Optional, etc.)
  - [ ] Use Pydantic models for structured data
  - [ ] Ensure type checker compliance (mypy)
- [ ] Add inline comments for complex logic
  - [ ] Explain threshold comparisons
  - [ ] Explain ranking algorithm
  - [ ] Explain fallback logic
- [ ] Add logging statements
  - [ ] Log all adaptation decisions
  - [ ] Log recommendation selections
  - [ ] Log fallback events
  - [ ] Use appropriate log levels (DEBUG, INFO, WARNING, ERROR)
- [ ] Update README with Week 3 progress
  - [ ] Document new endpoints
  - [ ] Document recommendation system architecture
  - [ ] Add usage examples for recommendation API
  - [ ] Update project status
- [ ] Create architecture diagram (optional)
  - [ ] Show flow: User → Message → Metrics → Profile → Engine → Recommendation
  - [ ] Use tool like draw.io or mermaid
  - [ ] Save in docs/ folder

---

## 12. Configuration and Environment

- [ ] Add configuration for rules thresholds
  - [ ] Create `app/core/adaptation/config.py`
  - [ ] Define all threshold values
  - [ ] Allow overriding via environment variables
  - [ ] Example: `DIFFICULTY_HIGH_THRESHOLD=0.8`
- [ ] Document configuration options
  - [ ] Update .env.example with new variables
  - [ ] Document each threshold's purpose
  - [ ] Provide sensible defaults
- [ ] Add adaptation strategy configuration
  - [ ] `ADAPTATION_STRATEGY=rules` (default)
  - [ ] Future: Allow switching to bandit or policy
- [ ] Test with different configuration values
  - [ ] Try very strict thresholds
  - [ ] Try very lenient thresholds
  - [ ] Verify system behavior changes appropriately

---

## 13. Performance and Optimization

- [ ] Profile recommendation endpoint performance
  - [ ] Measure end-to-end latency
  - [ ] Target: < 500ms for recommendation
  - [ ] Identify slow queries
- [ ] Optimize database queries
  - [ ] Fetch user profile and metrics in single query if possible
  - [ ] Use query.options(joinedload(...)) for eager loading
  - [ ] Cache frequently accessed data (profile, content)
- [ ] Add caching (optional for Week 3)
  - [ ] Cache user profiles for 1 minute
  - [ ] Cache content items indefinitely (invalidate on update)
  - [ ] Use Redis or simple in-memory cache
- [ ] Load testing (optional for Week 3)
  - [ ] Use Locust or k6 to simulate concurrent users
  - [ ] Test 10-50 concurrent recommendation requests
  - [ ] Verify no errors under load
  - [ ] Document performance metrics

---

## 14. Validation and Sign-off

### Week 3 Completion Checklist

- [ ] **Rules Adapter**: Implements all decision functions (difficulty, format, tempo, remediation)
- [ ] **Adaptation Engine**: Orchestrates strategies and provides get_recommendation() entry point
- [ ] **Recommendation Service**: Fetches profiles, calls engine, queries content, returns ranked recommendation
- [ ] **API Integration**: /api/v1/recommendations/next endpoint works correctly
- [ ] **Full Workflow**: User answer → metrics → profile update → recommendation works end-to-end
- [ ] **Testing**: Unit tests, integration tests, and manual tests all pass
- [ ] **Database**: All data flows correctly through metrics → profile → recommendation
- [ ] **Documentation**: Code documented, README updated, usage examples provided

### Key Validation Questions

- [ ] Can you create a user and immediately get a recommendation (cold start)?
- [ ] Can you submit correct answers and see difficulty increase?
- [ ] Can you submit incorrect answers and see difficulty decrease?
- [ ] Can you submit many followup questions and see format change?
- [ ] Does the recommendation reasoning make sense?
- [ ] Are recommendations diverse (no immediate repeats)?
- [ ] Does topic remediation work (recommends weakest topic)?
- [ ] Does the complete flow work: answer → metrics → profile → recommendation?

---

## Deliverable

By the end of Week 3, you should have:

✅ **Rules Adapter**: Complete threshold-based decision logic for difficulty, format, tempo, and remediation
✅ **Adaptation Engine**: Orchestration layer with strategy pattern for future extensibility
✅ **Recommendation Service**: Business logic to fetch profiles, call engine, rank content, and return recommendations
✅ **API Integration**: Working /api/v1/recommendations/next endpoint with full validation and error handling
✅ **Complete MVP**: End-to-end flow from user interaction to personalized content recommendation
✅ **Tests**: Unit tests for adapters, integration tests for flow, manual tests confirming all scenarios work
✅ **Documentation**: Code documented, architecture explained, usage examples provided

---

## Dependencies

**Must be completed before Week 3**:
- Week 2 deliverables:
  - Metrics service (synchronous metrics)
  - Aggregators (EMA for topic mastery)
  - User profile service (CRUD operations)
  - Content service (filtering, random, sequence)
  - Metrics workflow (automatic computation and profile update)

**Enables Week 4**:
- Week 4 (React Frontend) depends on:
  - Working recommendation API endpoint
  - Complete backend flow (users, dialogs, messages, recommendations)
  - Stable API contracts (schemas)

---

## Notes

- Focus on correctness and clarity in decision logic
- Keep threshold values configurable for easy tuning
- Extensive logging will help debug recommendation issues
- Test with real-world user patterns (high/low performers, cold start)
- Document reasoning for all decisions (helps with debugging and user trust)
- Keep code simple and readable - avoid premature optimization
- If blocked, test with hardcoded values first, then make configurable
- Ask questions if threshold values are unclear
- Document any deviations from the plan

**Good luck with Week 3!** 🚀
