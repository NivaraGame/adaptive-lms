#!/bin/bash
#
# API Testing Script for Recommendation Endpoints (Week 3, Section 4)
#
# This script tests the recommendation API endpoints via curl:
# 1. POST /api/v1/recommendations/next
# 2. GET /api/v1/recommendations/history
# 3. GET /api/v1/recommendations/strategy
#
# Usage: bash tests/test_api_recommendations.sh

set -e  # Exit on error

BASE_URL="http://localhost:8000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================================"
echo "RECOMMENDATION API ENDPOINT TESTS (Week 3, Section 4)"
echo "============================================================"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    local test_name=$1
    local status=$2
    if [ "$status" -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name"
        ((TESTS_FAILED++))
    fi
}

# Function to make HTTP request and check response
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local test_name=$5

    echo ""
    echo "-----------------------------------------------------------"
    echo -e "${YELLOW}TEST:${NC} $test_name"
    echo "Request: $method $endpoint"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi

    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" 2>&1)
    fi

    # Extract HTTP status code (last line)
    http_code=$(echo "$response" | tail -n 1)
    # Extract response body (all but last line)
    body=$(echo "$response" | sed '$d')

    echo "HTTP Status: $http_code (expected: $expected_status)"
    echo "Response:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"

    if [ "$http_code" -eq "$expected_status" ]; then
        print_result "$test_name" 0
        return 0
    else
        print_result "$test_name" 1
        return 1
    fi
}

echo ""
echo "=== 1. GET /api/v1/recommendations/strategy ==="
test_endpoint "GET" "/recommendations/strategy" "" 200 \
    "Get current adaptation strategy"

echo ""
echo ""
echo "=== 2. POST /api/v1/recommendations/next ==="

# Test 2.1: Valid request with existing user
test_endpoint "POST" "/recommendations/next" \
    '{"user_id": 1, "dialog_id": null}' 200 \
    "Get recommendation for user 1 (cold start)"

# Test 2.2: Valid request with dialog_id
test_endpoint "POST" "/recommendations/next" \
    '{"user_id": 1, "dialog_id": 1}' 200 \
    "Get recommendation for user 1 with dialog context"

# Test 2.3: Valid request with difficulty override
test_endpoint "POST" "/recommendations/next" \
    '{"user_id": 1, "dialog_id": null, "override_difficulty": "easy"}' 200 \
    "Get recommendation with difficulty override (easy)"

# Test 2.4: Valid request with format override
test_endpoint "POST" "/recommendations/next" \
    '{"user_id": 1, "dialog_id": null, "override_format": "visual"}' 200 \
    "Get recommendation with format override (visual)"

# Test 2.5: Valid request with both overrides
test_endpoint "POST" "/recommendations/next" \
    '{"user_id": 1, "dialog_id": null, "override_difficulty": "hard", "override_format": "video"}' 200 \
    "Get recommendation with both overrides"

# Test 2.6: Invalid user (should return 404 or use fallback)
echo ""
echo -e "${YELLOW}Note:${NC} Testing with non-existent user (may return 200 with fallback or 404)"
test_endpoint "POST" "/recommendations/next" \
    '{"user_id": 99999, "dialog_id": null}' 200 \
    "Get recommendation for non-existent user (fallback behavior)" || \
test_endpoint "POST" "/recommendations/next" \
    '{"user_id": 99999, "dialog_id": null}' 404 \
    "Get recommendation for non-existent user (404 error)"

# Test 2.7: Invalid request - missing user_id (should return 422)
test_endpoint "POST" "/recommendations/next" \
    '{"dialog_id": 1}' 422 \
    "Invalid request - missing user_id (validation error)"

# Test 2.8: Invalid request - invalid difficulty value (should return 422 or process normally)
echo ""
echo -e "${YELLOW}Note:${NC} Testing with invalid override value"
test_endpoint "POST" "/recommendations/next" \
    '{"user_id": 1, "override_difficulty": "super_hard"}' 200 \
    "Request with invalid difficulty override (should handle gracefully)" || \
    echo -e "${YELLOW}  (Override may be ignored or validated)${NC}"

echo ""
echo ""
echo "=== 3. GET /api/v1/recommendations/history ==="

# Test 3.1: Get history for user
test_endpoint "GET" "/recommendations/history?user_id=1&limit=10" "" 200 \
    "Get recommendation history for user 1"

# Test 3.2: Get history with different limit
test_endpoint "GET" "/recommendations/history?user_id=1&limit=5" "" 200 \
    "Get recommendation history with limit=5"

# Test 3.3: Get history for non-existent user (should return empty list)
test_endpoint "GET" "/recommendations/history?user_id=99999&limit=10" "" 200 \
    "Get history for non-existent user (should return empty)"

# Test 3.4: Missing user_id parameter (should return 422)
echo ""
echo -e "${YELLOW}Note:${NC} Testing without required parameter"
curl -s -w "\n%{http_code}" "$BASE_URL/recommendations/history?limit=10" 2>&1 | \
    tail -n 1 | grep -q "422" && \
    print_result "Missing user_id parameter (validation error)" 0 || \
    print_result "Missing user_id parameter (validation error)" 1

echo ""
echo ""
echo "============================================================"
echo "TEST SUMMARY"
echo "============================================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL API TESTS PASSED!${NC}"
    echo "Week 3 Section 4 API testing is complete."
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo "Please review the errors above."
    exit 1
fi
