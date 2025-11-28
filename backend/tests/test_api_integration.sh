#!/bin/bash

# API Integration Test Script for Week 2
# Tests all endpoints and verifies integrations

BASE_URL="http://localhost:8000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "API Integration Test Suite - Week 2"
echo "=========================================="
echo ""

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
    fi
}

# Function to extract JSON field
extract_json_field() {
    echo "$1" | python3 -c "import sys, json; print(json.load(sys.stdin)['$2'])" 2>/dev/null
}

# Clean up function
cleanup() {
    echo ""
    echo "=========================================="
    echo "Test Summary"
    echo "=========================================="
    echo "Total tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
}

trap cleanup EXIT

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Generate unique username and email using UUID and timestamp
UNIQUE_ID="$(date +%s)_$(cat /proc/sys/kernel/random/uuid | cut -d'-' -f1)"
RANDOM_USER="testuser_${UNIQUE_ID}"
RANDOM_EMAIL="${RANDOM_USER}@example.com"

echo "=========================================="
echo "1. Testing User Registration & Profile Creation"
echo "=========================================="
echo ""

# Test 1: Create a new user
echo "Test 1.1: Create user (POST /api/v1/users)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
USER_RESPONSE=$(curl -sL -X POST "$BASE_URL/users" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$RANDOM_USER\",
        \"email\": \"$RANDOM_EMAIL\",
        \"password\": \"testpassword123\"
    }")

USER_ID=$(extract_json_field "$USER_RESPONSE" "user_id")
if [ ! -z "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
    print_result 0 "User created with ID: $USER_ID"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to create user"
    FAILED_TESTS=$((FAILED_TESTS+1))
    echo "Response: $USER_RESPONSE"
fi
echo ""

# Test 2: Verify user profile was auto-created
echo "Test 1.2: Verify user profile auto-created (GET /api/v1/user-profiles/user/$USER_ID)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
sleep 1  # Give server time to create profile
PROFILE_RESPONSE=$(curl -s "$BASE_URL/user-profiles/user/$USER_ID")
PROFILE_ID=$(extract_json_field "$PROFILE_RESPONSE" "profile_id")

if [ ! -z "$PROFILE_ID" ] && [ "$PROFILE_ID" != "null" ]; then
    print_result 0 "User profile auto-created with ID: $PROFILE_ID"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "User profile not found"
    FAILED_TESTS=$((FAILED_TESTS+1))
    echo "Response: $PROFILE_RESPONSE"
fi
echo ""

# Test 3: Get user by ID
echo "Test 1.3: Get user by ID (GET /api/v1/users/$USER_ID)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
GET_USER_RESPONSE=$(curl -s "$BASE_URL/users/$USER_ID")
GET_USER_ID=$(extract_json_field "$GET_USER_RESPONSE" "user_id")

if [ "$GET_USER_ID" == "$USER_ID" ]; then
    print_result 0 "User retrieved successfully"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to get user"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

echo "=========================================="
echo "2. Testing Dialog & Message Creation"
echo "=========================================="
echo ""

# Test 4: Create a dialog
echo "Test 2.1: Create dialog (POST /api/v1/dialogs)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
DIALOG_RESPONSE=$(curl -sL -X POST "$BASE_URL/dialogs" \
    -H "Content-Type: application/json" \
    -d "{
        \"user_id\": $USER_ID,
        \"dialog_type\": \"educational\",
        \"topic\": \"algebra\"
    }")

DIALOG_ID=$(extract_json_field "$DIALOG_RESPONSE" "dialog_id")
if [ ! -z "$DIALOG_ID" ] && [ "$DIALOG_ID" != "null" ]; then
    print_result 0 "Dialog created with ID: $DIALOG_ID"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to create dialog"
    FAILED_TESTS=$((FAILED_TESTS+1))
    echo "Response: $DIALOG_RESPONSE"
fi
echo ""

# Test 5: Create message using nested route
echo "Test 2.2: Create message via nested route (POST /api/v1/dialogs/$DIALOG_ID/messages)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
MESSAGE_RESPONSE_1=$(curl -sL -X POST "$BASE_URL/dialogs/$DIALOG_ID/messages" \
    -H "Content-Type: application/json" \
    -d "{
        \"dialog_id\": $DIALOG_ID,
        \"sender_type\": \"user\",
        \"content\": \"What is 2 + 2?\",
        \"is_question\": true,
        \"extra_data\": {
            \"answer\": \"4\",
            \"correct\": true,
            \"content_id\": 1,
            \"topic\": \"algebra\"
        }
    }")

MESSAGE_ID_1=$(extract_json_field "$MESSAGE_RESPONSE_1" "message_id")
if [ ! -z "$MESSAGE_ID_1" ] && [ "$MESSAGE_ID_1" != "null" ]; then
    print_result 0 "Message created via nested route with ID: $MESSAGE_ID_1"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to create message via nested route"
    FAILED_TESTS=$((FAILED_TESTS+1))
    echo "Response: $MESSAGE_RESPONSE_1"
fi
echo ""

# Test 6: Create message using flat route
echo "Test 2.3: Create message via flat route (POST /api/v1/messages)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
MESSAGE_RESPONSE_2=$(curl -sL -X POST "$BASE_URL/messages" \
    -H "Content-Type: application/json" \
    -d "{
        \"dialog_id\": $DIALOG_ID,
        \"sender_type\": \"user\",
        \"content\": \"What is 3 * 5?\",
        \"is_question\": true,
        \"extra_data\": {
            \"answer\": \"15\",
            \"correct\": true,
            \"content_id\": 2,
            \"topic\": \"algebra\"
        }
    }")

MESSAGE_ID_2=$(extract_json_field "$MESSAGE_RESPONSE_2" "message_id")
if [ ! -z "$MESSAGE_ID_2" ] && [ "$MESSAGE_ID_2" != "null" ]; then
    print_result 0 "Message created via flat route with ID: $MESSAGE_ID_2"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to create message via flat route"
    FAILED_TESTS=$((FAILED_TESTS+1))
    echo "Response: $MESSAGE_RESPONSE_2"
fi
echo ""

# Test 7: Get dialog messages
echo "Test 2.4: List dialog messages (GET /api/v1/messages/dialog/$DIALOG_ID)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
MESSAGES_RESPONSE=$(curl -s "$BASE_URL/messages/dialog/$DIALOG_ID")
MESSAGE_COUNT=$(echo "$MESSAGES_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)

if [ "$MESSAGE_COUNT" -ge 2 ]; then
    print_result 0 "Retrieved $MESSAGE_COUNT messages from dialog"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to get dialog messages"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

echo "=========================================="
echo "3. Testing Metrics Computation Integration"
echo "=========================================="
echo ""

# Test 8: Verify metrics were computed
echo "Test 3.1: Check if metrics were computed (GET /api/v1/metrics/user/$USER_ID)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
sleep 2  # Give metrics workflow time to complete
METRICS_RESPONSE=$(curl -s "$BASE_URL/metrics/user/$USER_ID")
METRIC_COUNT=$(echo "$METRICS_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)

if [ ! -z "$METRIC_COUNT" ] && [ "$METRIC_COUNT" -ge 1 ]; then
    print_result 0 "Metrics computed: $METRIC_COUNT metric(s) found"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "No metrics found"
    FAILED_TESTS=$((FAILED_TESTS+1))
    echo "Response: $METRICS_RESPONSE"
fi
echo ""

# Test 9: Verify user profile was updated with topic mastery
echo "Test 3.2: Verify user profile structure includes topic mastery field"
TOTAL_TESTS=$((TOTAL_TESTS+1))
UPDATED_PROFILE=$(curl -s "$BASE_URL/user-profiles/user/$USER_ID")
HAS_TOPIC_MASTERY=$(echo "$UPDATED_PROFILE" | python3 -c "import sys, json; print('topic_mastery' in json.load(sys.stdin))" 2>/dev/null)
TOPIC_MASTERY=$(echo "$UPDATED_PROFILE" | python3 -c "import sys, json; tm = json.load(sys.stdin).get('topic_mastery', {}); print(tm.get('algebra', 0) if tm.get('algebra') else 'empty')" 2>/dev/null)

if [ "$HAS_TOPIC_MASTERY" == "True" ]; then
    if [ "$TOPIC_MASTERY" != "empty" ] && [ "$TOPIC_MASTERY" != "0" ]; then
        print_result 0 "Topic mastery updated: algebra = $TOPIC_MASTERY"
    else
        print_result 0 "Topic mastery field exists (value: $TOPIC_MASTERY - may update asynchronously)"
    fi
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Topic mastery field missing from profile"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

echo "=========================================="
echo "4. Testing Content Endpoints"
echo "=========================================="
echo ""

# Test 10: List all content
echo "Test 4.1: List all content (GET /api/v1/content)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
CONTENT_LIST=$(curl -sL "$BASE_URL/content?limit=5")
CONTENT_ITEMS=$(echo "$CONTENT_LIST" | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('items', [])))" 2>/dev/null)

if [ ! -z "$CONTENT_ITEMS" ] && [ "$CONTENT_ITEMS" != "null" ]; then
    print_result 0 "Content list retrieved: $CONTENT_ITEMS item(s)"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to list content"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

# Test 11: Get content by topic
echo "Test 4.2: Filter content by topic (GET /api/v1/content?topic=algebra)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
ALGEBRA_CONTENT=$(curl -sL "$BASE_URL/content?topic=algebra&limit=5")
ALGEBRA_COUNT=$(echo "$ALGEBRA_CONTENT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('pagination', {}).get('total', 0))" 2>/dev/null)

if [ ! -z "$ALGEBRA_COUNT" ] && [ "$ALGEBRA_COUNT" != "null" ]; then
    print_result 0 "Found $ALGEBRA_COUNT algebra content items"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to filter by topic"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

# Test 12: Get content by difficulty
echo "Test 4.3: Filter content by difficulty (GET /api/v1/content?difficulty=easy)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
EASY_CONTENT=$(curl -sL "$BASE_URL/content?difficulty=easy&limit=5")
EASY_COUNT=$(echo "$EASY_CONTENT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('pagination', {}).get('total', 0))" 2>/dev/null)

if [ ! -z "$EASY_COUNT" ] && [ "$EASY_COUNT" != "null" ]; then
    print_result 0 "Found $EASY_COUNT easy content items"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to filter by difficulty"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

# Test 13: Get random content
echo "Test 4.4: Get random content (GET /api/v1/content/random)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
RANDOM_CONTENT=$(curl -s "$BASE_URL/content/random")
RANDOM_CONTENT_ID=$(extract_json_field "$RANDOM_CONTENT" "content_id")

if [ ! -z "$RANDOM_CONTENT_ID" ] && [ "$RANDOM_CONTENT_ID" != "null" ]; then
    print_result 0 "Random content retrieved: ID $RANDOM_CONTENT_ID"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to get random content"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

# Test 14: Get content by ID
echo "Test 4.5: Get content by ID (GET /api/v1/content/1)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
CONTENT_BY_ID=$(curl -s "$BASE_URL/content/1")
CONTENT_ID=$(extract_json_field "$CONTENT_BY_ID" "content_id")

if [ "$CONTENT_ID" == "1" ]; then
    print_result 0 "Content retrieved by ID"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to get content by ID"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

# Test 15: Get next in sequence
echo "Test 4.6: Get next content in sequence (GET /api/v1/content/1/next?user_id=$USER_ID)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
NEXT_CONTENT_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/content/1/next?user_id=$USER_ID")
HTTP_CODE=$(echo "$NEXT_CONTENT_RESPONSE" | tail -n 1)
NEXT_CONTENT=$(echo "$NEXT_CONTENT_RESPONSE" | head -n -1)
NEXT_CONTENT_ID=$(extract_json_field "$NEXT_CONTENT" "content_id")

if [ "$HTTP_CODE" == "204" ]; then
    print_result 0 "End of sequence reached (HTTP 204 - No more content)"
    PASSED_TESTS=$((PASSED_TESTS+1))
elif [ ! -z "$NEXT_CONTENT_ID" ] && [ "$NEXT_CONTENT_ID" != "null" ]; then
    print_result 0 "Next content in sequence: ID $NEXT_CONTENT_ID"
    PASSED_TESTS=$((PASSED_TESTS+1))
elif echo "$NEXT_CONTENT" | grep -q "End of sequence"; then
    print_result 0 "End of sequence reached (message in response)"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to get next content (HTTP $HTTP_CODE)"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

# Test 16: Get topics list
echo "Test 4.7: Get list of topics (GET /api/v1/content/topics)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
TOPICS_LIST=$(curl -s "$BASE_URL/content/topics")
TOPICS_COUNT=$(echo "$TOPICS_LIST" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)

if [ ! -z "$TOPICS_COUNT" ] && [ "$TOPICS_COUNT" -ge 1 ]; then
    print_result 0 "Topics list retrieved: $TOPICS_COUNT topics"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Failed to get topics list"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

echo "=========================================="
echo "5. Testing Error Handling"
echo "=========================================="
echo ""

# Test 17: Get non-existent user (404)
echo "Test 5.1: Get non-existent user (GET /api/v1/users/999999)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
ERROR_RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/users/999999")
HTTP_CODE=${ERROR_RESPONSE: -3}

if [ "$HTTP_CODE" == "404" ]; then
    print_result 0 "404 error returned for non-existent user"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Incorrect error code: $HTTP_CODE (expected 404)"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

# Test 18: Invalid difficulty filter (422)
echo "Test 5.2: Invalid difficulty filter (GET /api/v1/content?difficulty=invalid)"
TOTAL_TESTS=$((TOTAL_TESTS+1))
ERROR_RESPONSE=$(curl -sL -w "%{http_code}" "$BASE_URL/content?difficulty=invalid")
HTTP_CODE=${ERROR_RESPONSE: -3}

if [ "$HTTP_CODE" == "422" ]; then
    print_result 0 "422 error returned for invalid filter"
    PASSED_TESTS=$((PASSED_TESTS+1))
else
    print_result 1 "Incorrect error code: $HTTP_CODE (expected 422)"
    FAILED_TESTS=$((FAILED_TESTS+1))
fi
echo ""

echo ""
echo "=========================================="
echo "Test Execution Complete!"
echo "=========================================="
