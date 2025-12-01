# Adaptive LMS - Test Suite Documentation

This directory contains the comprehensive test suite for the Adaptive Learning Management System backend.

## 📁 Test Files

### Bash Tests
- **`test_api_integration.sh`** - Full API integration tests (18 tests)
  - User registration and profile creation
  - Dialog and message management
  - Metrics computation integration
  - Content endpoints (CRUD, filtering, pagination)
  - Error handling

- **`test_api_recommendations.sh`** - Recommendation API endpoint tests (Week 3, Section 4)
  - GET /api/v1/recommendations/strategy - Current adaptation strategy
  - POST /api/v1/recommendations/next - Get personalized recommendations
  - GET /api/v1/recommendations/history - Recommendation history
  - Request validation and error handling (422 for invalid parameters)
  - Difficulty and format overrides (with validation)
  - Valid values: difficulty=['easy','normal','hard','challenge'], format=['text','visual','video','interactive']
  - Cold start behavior
  - Non-existent user handling

### Python Tests
- **`test_metrics.py`** - Metrics computation system tests (12 tests)
  - Accuracy computation (binary, case-insensitive, JSONB)
  - Response time calculation
  - Attempts and follow-ups counting
  - Synchronous metrics computation
  - Database persistence
  - EMA calculations
  - Topic mastery updates
  - Response time aggregation
  - Weak/strong topic identification
  - End-to-end workflow

- **`test_user_service.py`** - User profile service tests (6 tests)
  - User creation with auto-profile generation
  - Profile retrieval by user_id and profile_id
  - Profile field updates (preferences)
  - Profile deletion

- **`test_content_service.py`** - Content service tests (12 tests)
  - List all content with pagination
  - Filter by topic, difficulty, format
  - Multiple filter combinations
  - Random content selection
  - Sequential content navigation
  - Topics list retrieval
  - Invalid filter validation

- **`test_recommendation_flow.py`** - Recommendation engine integration tests (4 tests)
  - AdaptationEngine initialization and strategy management
  - RulesAdapter decision-making with sample data
  - RecommendationService full flow (profile → metrics → content selection)
  - API schema compatibility validation

- **`test_workflow.py`** - End-to-end workflow test (1 comprehensive test)
  - Complete user learning journey
  - User → Content → Dialog → Messages → Metrics → Profile Updates

- **`test_workflow_manual.py`** - Full Workflow Integration Tests (Week 3, Section 5)
  - Complete adaptive learning loop end-to-end testing
  - High-performing user scenario (difficulty increases)
  - Cold start user scenario (new user, no history)
  - Full workflow with automatic recommendations
  - Multiple iterations with adaptive behavior
  - Transaction consistency verification
  - Workflow logging and metadata validation
  - Requires running API server with populated content database

## 🚀 Running Tests

### Run All Tests

From the backend directory, execute:

```bash
./run_all_tests.sh
```

This master script will:
1. Perform pre-flight checks (Python, server, dependencies)
2. Execute all test suites in order
3. Provide a comprehensive summary

### Run Individual Tests

#### Bash Tests
```bash
# API integration tests
bash tests/test_api_integration.sh

# Recommendation API tests (Week 3)
bash tests/test_api_recommendations.sh
```

#### Python Tests
```bash
# Metrics tests
python3 tests/test_metrics.py

# User service tests (requires Enter keypress)
python3 tests/test_user_service.py

# Content service tests (requires Enter keypress)
python3 tests/test_content_service.py

# Recommendation flow tests (Week 3)
python3 tests/test_recommendation_flow.py

# End-to-end workflow test
python3 tests/test_workflow.py

# Full workflow integration test (Week 3, Section 5)
python3 tests/test_workflow_manual.py
```

## 📋 Prerequisites

### Required Services
- **Backend Server**: Must be running on `http://localhost:8000`
  ```bash
  uvicorn app.main:app --reload
  ```

- **PostgreSQL Database**: Must be accessible and configured
  - Database: `adaptive_lms`
  - Connection string configured in `.env`

### Required Python Packages
```bash
pip install -r requirements.txt
```

Key dependencies:
- `requests` - HTTP client for API tests
- `sqlalchemy` - Database ORM
- `psycopg2-binary` - PostgreSQL adapter
- `pydantic` - Data validation

## 📊 Test Coverage

### Total Test Count: 69+ Tests

| Test Suite | Count | Coverage |
|------------|-------|----------|
| API Integration | 18 | API endpoints, HTTP handling, error cases |
| API Recommendations | 12+ | Recommendation endpoints, validation, overrides, error handling |
| Metrics System | 12 | Computation, persistence, aggregation |
| User Service | 6 | CRUD operations, profile management |
| Content Service | 12 | Filtering, pagination, navigation |
| Recommendation Flow | 4 | Adaptation engine, strategy orchestration, content selection |
| Workflow E2E | 1 | Complete user journey |
| Workflow Integration | 4 | Full adaptive learning loop, multiple scenarios (Week 3) |

### Pass Rate: 100% ✅ (when server is running)

## 🧪 Test Features

### Unique Test Data
All tests generate unique usernames and emails using:
```
testuser_<timestamp>_<uuid8chars>@example.com
```

This ensures:
- No database conflicts
- Tests can run repeatedly
- Parallel execution support
- No manual cleanup needed

### Comprehensive Validation
- ✅ HTTP status codes
- ✅ Response payloads
- ✅ Database persistence
- ✅ Profile updates
- ✅ Metrics computation
- ✅ Error handling
- ✅ Edge cases

## 📈 Sample Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Adaptive LMS - Comprehensive Test Suite
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ Pre-flight Check: Python Environment
✓ Python found: Python 3.12.3

▶ Pre-flight Check: Backend Server
✓ Backend server is running on http://localhost:8000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Test Results Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Individual Test Suites:
  ✓ test_metrics: 12/12
  ✓ test_content_service: 12/12
  ✓ test_user_service: 6/6
  ✓ test_recommendation_flow: 4/4
  ✓ test_api_integration: 18/18
  ✓ test_api_recommendations: 12/12
  ✓ test_workflow: 1/1

Overall Statistics:
  Total Tests:  65
  Passed:       65
  Failed:       0
  Pass Rate:    100%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ ALL TESTS PASSED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔍 Debugging Failed Tests

### Check Test Logs
All test output is saved to `/tmp/`:
```bash
# View specific test log
cat /tmp/test_api_integration_output.log
cat /tmp/test_api_recommendations_output.log
cat /tmp/test_metrics_output.log
cat /tmp/test_user_service_output.log
cat /tmp/test_content_service_output.log
cat /tmp/test_recommendation_flow_output.log
cat /tmp/test_workflow_output.log
```

### Common Issues

1. **Server Not Running**
   - Error: `Connection refused` or `Could not connect to server`
   - Solution: Start backend with `uvicorn app.main:app --reload`

2. **Database Connection Failed**
   - Error: `Could not connect to database`
   - Solution: Check PostgreSQL is running and `.env` configuration

3. **Import Errors in Python Tests**
   - Error: `ModuleNotFoundError: No module named 'app'`
   - Solution: Run tests from the `backend/` directory

4. **Unique Constraint Violations**
   - Error: `duplicate key value violates unique constraint`
   - Solution: Tests should auto-generate unique data; check UUID generation

## 🏗️ Test Architecture

### Test Organization
```
backend/
├── tests/
│   ├── test_api_integration.sh       # Bash - API endpoints
│   ├── test_api_recommendations.sh   # Bash - Recommendation API (Week 3)
│   ├── test_metrics.py               # Python - Metrics system
│   ├── test_user_service.py          # Python - User profiles
│   ├── test_content_service.py       # Python - Content management
│   ├── test_recommendation_flow.py   # Python - Adaptation engine (Week 3)
│   ├── test_workflow.py              # Python - E2E workflow
│   ├── test_workflow_manual.py       # Python - Full workflow integration (Week 3, Sec 5)
│   └── README.md                     # This file
├── run_all_tests.sh                  # Master test runner
└── app/                              # Application code
```

### Test Dependencies
- Tests are independent and can run in any order
- Each test creates its own unique test data
- Cleanup is handled automatically
- No shared state between tests

## 📝 Adding New Tests

### Bash Test Template
```bash
#!/bin/bash
BASE_URL="http://localhost:8000/api/v1"

# Generate unique user
UNIQUE_ID="$(date +%s)_$(cat /proc/sys/kernel/random/uuid | cut -d'-' -f1)"
RANDOM_USER="testuser_${UNIQUE_ID}"
RANDOM_EMAIL="${RANDOM_USER}@example.com"

# Your test logic here
```

### Python Test Template
```python
import uuid
import time

# Generate unique user
unique_id = f"{int(time.time())}_{uuid.uuid4().hex[:8]}"
username = f"testuser_{unique_id}"
email = f"{username}@example.com"

# Your test logic here
```

## 🎯 CI/CD Integration

This test suite is designed for continuous integration:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    cd backend
    ./run_all_tests.sh
```

## 📚 Related Documentation
- [API Documentation](../README.md)
- [Database Schema](../app/models/)
- [Metrics System](../app/core/metrics/)
- [User Profiles](../app/services/user_profile_service.py)

## 🤝 Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all existing tests still pass
3. Add new test files following naming convention: `test_*.py` or `test_*.sh`
4. Update this README with new test descriptions
5. Run full test suite before committing

## ✅ Quality Assurance

This test suite ensures:
- ✅ All API endpoints work correctly
- ✅ Database operations persist correctly
- ✅ Metrics computation is accurate
- ✅ Profile updates work as expected
- ✅ Error handling is proper
- ✅ Edge cases are covered
- ✅ End-to-end workflows function correctly

**Maintained By**: Adaptive LMS Development Team
**Last Updated**: November 2025
**Status**: All tests passing ✅
