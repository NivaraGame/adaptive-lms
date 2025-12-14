# Week 2: Core Backend Implementation

## Overview

Week 2 focuses on building the **core backend logic** that drives the adaptive learning system. The main goal is to compute metrics from user interactions, aggregate them into user profiles, and enable content retrieval. This week builds the foundation for the adaptation engine in Week 3.

---

## 1. Metrics Service - Synchronous Metrics

### Module: `app/core/metrics/synchronous.py`

- [x] Create the synchronous metrics module file structure
- [x] Implement function to extract `accuracy` metric from user answer (binary or score)
- [x] Implement function to calculate `response_time` (time between content delivery and user response)
- [x] Implement function to count `attempts_count` (number of attempts for a question)
- [x] Implement function to count `followups_count` (number of follow-up questions asked)
- [x] Create parser function to extract relevant data from message/dialog events
  - [x] Extract timestamps from events
  - [x] Extract answer correctness
  - [x] Extract user interaction metadata
- [x] Implement function to store computed metrics in the `metrics` table
  - [x] Link metrics to `user_id`
  - [x] Link metrics to `dialog_id`
  - [x] Link metrics to `message_id`
  - [x] Link metrics to `content_id`
- [x] Create main `compute_synchronous_metrics(message_data)` function that orchestrates all metric computation
- [x] Test synchronous metrics computation with sample data
- [x] Verify metrics are persisted to database after computation

---

## 2. Metrics Service - Aggregators

### Module: `app/core/metrics/aggregators.py`

- [x] Create the aggregators module file structure
- [x] Implement Exponential Moving Average (EMA) for topic mastery
  - [x] Define EMA formula: `mastery_new = alpha * current_score + (1 - alpha) * mastery_old`
  - [x] Set default alpha value (e.g., 0.3)
  - [x] Handle initialization case (first interaction with a topic)
- [x] Implement `update_topic_mastery(user_id, topic, score)` function
  - [x] Retrieve current mastery from JSONB column
  - [x] Apply EMA calculation
  - [x] Update JSONB field in database
- [x] Implement rolling average for response time
  - [x] Choose window size (e.g., last 10 interactions) or use exponential decay
  - [x] Calculate new average response time
- [x] Implement `update_response_time_avg(user_id, response_time)` function
- [x] Create `aggregate_metrics(user_id, recent_metrics)` function to process batch of metrics
- [x] Test EMA calculation with multiple sequential interactions
  - [x] Test with all correct answers (mastery should increase)
  - [x] Test with all incorrect answers (mastery should decrease)
  - [x] Test with mixed answers (mastery should stabilize)
- [x] Test response time aggregation with varying response times
- [x] Verify JSONB updates in `user_profile.topic_mastery` field

---

## 3. Metrics Computation Workflow

### Integration: Connecting Synchronous Metrics and Aggregators

- [x] Design the metrics computation pipeline architecture
  - [x] Decide on trigger mechanism (background task, synchronous, event listener)
  - [x] Define error handling strategy
- [x] Implement workflow that triggers after user interaction
  1. [x] Listen for message/dialog creation event
  2. [x] Call `compute_synchronous_metrics()` to compute real-time metrics
  3. [x] Store metrics in `metrics` table
  4. [x] Call `aggregate_metrics()` to update user profile
  5. [x] Update `user_profile` table with aggregated statistics
- [x] Add error handling and rollback logic
- [x] Test full workflow end-to-end
  - [x] Submit user answer
  - [x] Verify `metrics` table has new entry
  - [x] Verify `user_profile` table is updated
- [x] Add logging for debugging and monitoring

---

## 4. User Profile Service

### Module: `app/services/user_service.py`

- [x] Create the user service module file structure
- [x] Implement `create_user_profile(user_id)` function
  - [x] Set default values for new profile
    - [x] `topic_mastery = {}`
    - [x] `avg_response_time = None`
    - [x] `total_interactions = 0`
    - [x] Other default fields as per schema
  - [x] Insert new profile into `user_profile` table
  - [x] Handle duplicate profile creation (idempotency)
- [x] Implement `get_profile(user_id)` function
  - [x] Query `user_profile` table by user_id
  - [x] Return as UserProfile model
  - [x] Handle case where profile doesn't exist (raise_if_missing parameter)
- [x] Implement `update_profile(user_id, metrics_data)` function
  - [x] Accept aggregated metrics as input
  - [x] Call appropriate aggregator functions (uses aggregate_metrics from aggregators.py)
  - [x] Persist all changes to database
  - [x] Use database transaction for atomicity
- [x] Implement `update_topic_mastery(user_id, topic, score)` function
  - [x] Use JSONB operations to update specific topic (via aggregators.py)
  - [x] Uses EMA algorithm for mastery updates
  - [x] Handle new topics (first time seeing a topic)
- [x] Integrate `create_user_profile()` with user registration endpoint
  - [x] Hook into `POST /api/v1/users` endpoint
  - [x] Auto-create profile when user registers
- [x] Integrate `update_profile()` with metrics workflow
  - [x] Already integrated via aggregate_metrics in workflow.py
- [x] Test user profile CRUD operations
  - [x] Create profile for new user
  - [x] Retrieve profile
  - [x] Update profile with new metrics
  - [x] Test script created: `backend/test_user_service.py`
- [x] Test topic mastery updates with multiple interactions
  - [x] EMA algorithm implemented and tested in aggregators.py
  - [x] Integration with metrics workflow complete

---

## 5. Content Service

### Module: `app/services/content_service.py`

- [x] Create the content service module file structure
- [x] Implement `get_content_by_filters(topic, difficulty, format)` function
  - [x] Build dynamic SQL query with optional filters
  - [x] Handle `topic` filter (string match)
  - [x] Handle `difficulty` filter (enum or integer: 1=easy, 2=medium, 3=hard)
  - [x] Handle `format` filter (text/visual/video/interactive)
  - [x] Support multiple values per filter (e.g., difficulty in [1, 2])
  - [x] Return list of matching content items as Pydantic models
- [x] Add pagination support to `get_content_by_filters()`
  - [x] Add `limit` parameter (default: 10)
  - [x] Add `offset` parameter (default: 0)
  - [x] Implement SQL LIMIT and OFFSET
  - [x] Return pagination metadata (total count, current page, total pages)
- [x] Implement `get_random_content(filters)` function
  - [x] Use SQL `ORDER BY RANDOM() LIMIT 1` for PostgreSQL
  - [x] Optionally apply filters before random selection
  - [x] Handle case where no content matches filters
- [x] Implement `get_next_in_sequence(user_id, current_content_id)` function
  - [x] Query based on `sequence_number` in content metadata
  - [x] Handle prerequisites (if content has dependency graph)
  - [x] Return next content item in learning path
  - [x] Handle end of sequence (return None or wrap around)
- [x] Create helper function for content filtering logic
  - [x] Validate filter values
  - [x] Sanitize inputs to prevent SQL injection
- [x] Test content retrieval by topic
  - [x] Query: `GET /api/v1/content?topic=algebra`
  - [x] Verify only algebra content returned
- [x] Test content retrieval by difficulty
  - [x] Query: `GET /api/v1/content?difficulty=2`
  - [x] Verify only medium difficulty content returned
- [x] Test content retrieval by format
  - [x] Query: `GET /api/v1/content?format=video`
  - [x] Verify only video content returned
- [x] Test content retrieval with multiple filters
  - [x] Query: `GET /api/v1/content?topic=algebra&difficulty=2`
- [x] Test random content selection
  - [x] Query: `GET /api/v1/content/random`
  - [x] Verify random item returned
  - [x] Call multiple times, verify different items
- [x] Test pagination
  - [x] Query page 1: `GET /api/v1/content?limit=5&offset=0`
  - [x] Query page 2: `GET /api/v1/content?limit=5&offset=5`
  - [x] Verify different results
- [x] Test sequential content retrieval
  - [x] Get content item 1
  - [x] Get next in sequence
  - [x] Verify correct ordering

---

## 6. API Integration

### Connecting Services to API Endpoints

- [x] Update message creation endpoint (`POST /api/v1/dialogs/{id}/messages`)
  - [x] Trigger metrics computation after message creation
  - [x] Return computed metrics in response (optional)
  - [x] Added nested route at `POST /api/v1/dialogs/{dialog_id}/messages`
  - [x] Existing route `POST /api/v1/messages` also works
- [x] Update user registration endpoint (`POST /api/v1/users`)
  - [x] Call `create_user_profile()` after user creation
  - [x] Return success confirmation
  - [x] Implementation in `app/api/routes/users.py:49-57`
- [x] Create or update content endpoints
  - [x] `GET /api/v1/content` - List content with filters and pagination
  - [x] `GET /api/v1/content/{id}` - Get single content item
  - [x] `GET /api/v1/content/random` - Get random content
  - [x] `GET /api/v1/content/{id}/next` - Get next in sequence
  - [x] `GET /api/v1/content/topics` - Get list of all topics (bonus)
  - [x] All endpoints fully implemented in `app/api/routes/content.py`
- [x] Add request validation using Pydantic models
  - [x] Validate topic names
  - [x] Validate difficulty values (easy/normal/hard/challenge)
  - [x] Validate format values (text/visual/video/interactive)
  - [x] All schemas in `app/schemas/` with field validators
- [x] Add response models for all endpoints
  - [x] Content response model (`ContentItemResponse`, `ContentListResponse`)
  - [x] Metrics response model (in `app/schemas/metric.py`)
  - [x] Profile response model (`UserProfileResponse`)
  - [x] Pagination metadata model
- [x] Add error handling for all endpoints
  - [x] Handle not found (404)
  - [x] Handle validation errors (422)
  - [x] Handle database errors (500)
  - [x] Custom exceptions: `ContentNotFoundError`, `InvalidFilterError`, etc.
- [x] Test all endpoints via Swagger UI (`http://localhost:8000/docs`)
  - [x] Created comprehensive test script: `backend/test_api_integration.sh`
  - [x] Automated testing: 12/18 tests passing
  - [x] Manual Swagger UI testing: All endpoints functional
  - [x] Documentation: `backend/API_INTEGRATION_REPORT.md`

---

## 7. End-to-End Testing

### Complete Flow Testing

- [ ] **Test Scenario 1: New User Registration**
  - [ ] Create new user via `POST /api/v1/users`
  - [ ] Verify user created in `users` table
  - [ ] Verify profile created in `user_profile` table
  - [ ] Verify default values set correctly
- [ ] **Test Scenario 2: First Interaction (Cold Start)**
  - [ ] Create dialog for user
  - [ ] Get random content
  - [ ] Submit answer with correct response
  - [ ] Verify metrics computed and stored
  - [ ] Verify profile updated (topic mastery > 0)
- [ ] **Test Scenario 3: Multiple Interactions on Same Topic**
  - [ ] Submit 3 correct answers for "algebra"
  - [ ] Verify topic mastery increases each time (EMA)
  - [ ] Submit 2 incorrect answers for "algebra"
  - [ ] Verify topic mastery decreases (EMA)
  - [ ] Check final mastery value is reasonable
- [ ] **Test Scenario 4: Multiple Topics**
  - [ ] Submit interactions for "algebra"
  - [ ] Submit interactions for "calculus"
  - [ ] Submit interactions for "geometry"
  - [ ] Verify `topic_mastery` JSONB has all three topics
  - [ ] Verify each topic has independent mastery score
- [ ] **Test Scenario 5: Response Time Tracking**
  - [ ] Submit answer with 5-second response time
  - [ ] Submit answer with 10-second response time
  - [ ] Submit answer with 3-second response time
  - [ ] Verify average response time updates correctly
- [ ] **Test Scenario 6: Content Filtering**
  - [ ] Query easy algebra content
  - [ ] Verify results match filters
  - [ ] Query hard calculus content
  - [ ] Verify results match filters
- [ ] **Test Scenario 7: Sequential Learning**
  - [ ] Get content item 1 in a sequence
  - [ ] Complete it (submit answer)
  - [ ] Get next in sequence
  - [ ] Verify correct next item returned

---

## 8. Database Verification

### Manual Database Checks

- [ ] Verify `metrics` table structure
  - [ ] Check columns exist: user_id, dialog_id, content_id, timestamp, accuracy, response_time, etc.
  - [ ] Check data types are correct
- [ ] Verify `user_profile` table structure
  - [ ] Check `topic_mastery` is JSONB
  - [ ] Check `avg_response_time` is numeric
  - [ ] Check indexes exist on `user_id`
- [ ] Insert sample metrics manually and verify aggregation
  - [ ] Insert 5 metrics for one user
  - [ ] Run aggregation function
  - [ ] Query user_profile and verify updates
- [ ] Test JSONB query performance
  - [ ] Query users by topic mastery: `topic_mastery @> '{"algebra": 0.7}'`
  - [ ] Measure query time
  - [ ] Add GIN index if slow: `CREATE INDEX idx_topic_mastery ON user_profile USING GIN (topic_mastery);`

---

## 9. Code Quality and Documentation

- [ ] Add docstrings to all functions
  - [ ] Include parameter descriptions
  - [ ] Include return type descriptions
  - [ ] Include usage examples
- [ ] Add type hints to all functions
  - [ ] Use Python typing module
  - [ ] Use Pydantic models where appropriate
- [ ] Add inline comments for complex logic
  - [ ] Explain EMA calculation
  - [ ] Explain JSONB update queries
- [ ] Write unit tests (optional for Week 2, required for Week 10)
  - [ ] Test metrics computation functions
  - [ ] Test aggregator functions
  - [ ] Mock database calls
- [ ] Add logging statements
  - [ ] Log metric computation
  - [ ] Log profile updates
  - [ ] Log content queries
- [ ] Update README with Week 2 progress
  - [ ] Document new endpoints
  - [ ] Document new services
  - [ ] Add usage examples

---

## 10. Validation and Sign-off

### Week 2 Completion Checklist

- [ ] **Metrics Service**: Can compute synchronous metrics from user interactions
- [ ] **Aggregators**: Can update user profiles with EMA and rolling averages
- [ ] **User Profile Service**: Full CRUD operations work correctly
- [ ] **Content Service**: Can retrieve content by filters, random, and sequence
- [ ] **Workflow**: Automatic metrics → profile update after each interaction
- [ ] **API Integration**: All services accessible via REST endpoints
- [ ] **Database**: All tables updated correctly after interactions
- [ ] **Testing**: Manual tests confirm all functionality works

### Key Validation Questions

- [ ] Can you create a user and see their profile auto-created?
- [ ] Can you submit an answer and see metrics computed?
- [ ] Can you submit multiple answers and see profile updated with EMA?
- [ ] Can you query content by topic/difficulty and get correct results?
- [ ] Can you get random content for cold start scenarios?
- [ ] Does the `topic_mastery` JSONB field update correctly?
- [ ] Does the average response time calculation work?

---

## Deliverable

By the end of Week 2, you should have:

✅ **Metrics Service**: Computes synchronous metrics from user interactions
✅ **Aggregators**: Updates user profiles with EMA for topic mastery and rolling averages
✅ **User Profile Service**: Full CRUD for user profiles, auto-initialization on user creation
✅ **Content Service**: Retrieves content by filters, random selection, and sequences
✅ **Workflow**: Automatic metrics computation → profile update after each interaction
✅ **API Integration**: All services accessible via REST endpoints
✅ **Tests**: Manual tests confirm metrics, profiles, and content retrieval work correctly

---

## Dependencies

**Must be completed before Week 2**:
- Database schema deployed (`db/schema.sql`)
- FastAPI server running with base endpoints
- Tables exist: `users`, `user_profile`, `content`, `dialogs`, `messages`, `metrics`

**Enables Week 3**:
- Week 3 (Rules-Based Adaptation) depends on:
  - User profiles with up-to-date topic mastery
  - Metrics computation working correctly
  - Content retrieval by filters

---

## Notes

- Focus on correctness first, optimization later (Week 13)
- Use Swagger UI for all manual testing
- Keep code simple and readable
- Ask questions if any requirements are unclear
- Document any deviations from the plan
- If you get blocked, move to next task and come back later

**Good luck with Week 2!** 🚀
