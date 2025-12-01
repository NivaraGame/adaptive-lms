#!/usr/bin/env python3
"""
Manual End-to-End Workflow Integration Test

This script tests the complete adaptive learning workflow:
1. User submits answer → Message created
2. Metrics computed automatically
3. User profile updated
4. Adaptation engine makes decision
5. Content selected and returned

Run this with the API server running:
    python tests/test_workflow_manual.py
"""

import requests
import json
import time
from typing import Dict, Any, List

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

# Color codes for output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"


def print_section(title: str):
    """Print a section header"""
    print(f"\n{'='*80}")
    print(f"{BLUE}{title}{RESET}")
    print(f"{'='*80}\n")


def print_success(message: str):
    """Print success message"""
    print(f"{GREEN}✓ {message}{RESET}")


def print_error(message: str):
    """Print error message"""
    print(f"{RED}✗ {message}{RESET}")


def print_info(message: str):
    """Print info message"""
    print(f"{YELLOW}ℹ {message}{RESET}")


def create_user(username: str) -> Dict[str, Any]:
    """Create a new user"""
    response = requests.post(
        f"{BASE_URL}/users",
        json={"username": username, "email": f"{username}@test.com"}
    )
    response.raise_for_status()
    return response.json()


def create_dialog(user_id: int, topic: str = "algebra") -> Dict[str, Any]:
    """Create a new dialog"""
    response = requests.post(
        f"{BASE_URL}/dialogs",
        json={"user_id": user_id, "topic": topic}
    )
    response.raise_for_status()
    return response.json()


def submit_message(
    dialog_id: int,
    content: str,
    content_id: int = None,
    is_correct: bool = None,
    response_time: float = None,
    include_recommendation: bool = False
) -> Dict[str, Any]:
    """Submit a message"""
    extra_data = {}
    if content_id is not None:
        extra_data["content_id"] = content_id
    if is_correct is not None:
        extra_data["is_correct"] = is_correct
    if response_time is not None:
        extra_data["response_time"] = response_time

    params = {}
    if include_recommendation:
        params["include_recommendation"] = "true"

    response = requests.post(
        f"{BASE_URL}/messages",
        params=params,
        json={
            "dialog_id": dialog_id,
            "sender_type": "user",
            "content": content,
            "is_question": False,
            "extra_data": extra_data
        }
    )
    response.raise_for_status()
    return response.json()


def get_recommendation(user_id: int, dialog_id: int = None) -> Dict[str, Any]:
    """Get next recommendation"""
    payload = {"user_id": user_id}
    if dialog_id:
        payload["dialog_id"] = dialog_id

    response = requests.post(
        f"{BASE_URL}/recommendations/next",
        json=payload
    )
    response.raise_for_status()
    return response.json()


def get_profile(user_id: int) -> Dict[str, Any]:
    """Get user profile"""
    response = requests.get(f"{BASE_URL}/profiles/{user_id}")
    response.raise_for_status()
    return response.json()


def test_scenario_high_performer():
    """Test Scenario 1: High-Performing User"""
    print_section("Scenario 1: High-Performing User")

    # Create user and dialog
    print_info("Creating user and dialog...")
    user = create_user(f"high_performer_{int(time.time())}")
    dialog = create_dialog(user["user_id"], topic="algebra")
    print_success(f"Created user_id={user['user_id']}, dialog_id={dialog['dialog_id']}")

    # Submit 5 correct answers with fast response times
    print_info("Submitting 5 correct answers with fast response times...")
    for i in range(5):
        result = submit_message(
            dialog_id=dialog["dialog_id"],
            content=f"Answer {i+1}: 42",
            content_id=2,
            is_correct=True,
            response_time=25
        )
        print_success(f"Submitted message {i+1}, message_id={result['message']['message_id']}")
        time.sleep(0.5)

    # Get profile
    print_info("Checking user profile...")
    profile = get_profile(user["user_id"])
    print(f"  - Avg accuracy: {profile.get('avg_accuracy', 'N/A')}")
    print(f"  - Avg response time: {profile.get('avg_response_time', 'N/A')}s")
    print(f"  - Total interactions: {profile.get('total_interactions', 0)}")

    # Get recommendation
    print_info("Getting recommendation...")
    rec = get_recommendation(user["user_id"], dialog["dialog_id"])
    print(f"  - Recommended content: {rec['content']['title']}")
    print(f"  - Difficulty: {rec['content']['difficulty_level']}")
    print(f"  - Format: {rec['content']['format']}")
    print(f"  - Confidence: {rec['confidence']:.2f}")
    print(f"  - Reasoning: {rec['reasoning'][:150]}...")

    # Verify difficulty increased
    if rec['content']['difficulty_level'] in ['hard', 'challenge']:
        print_success("✓ Difficulty increased to hard/challenge as expected!")
    else:
        print_error(f"✗ Expected hard/challenge, got {rec['content']['difficulty_level']}")

    return rec


def test_scenario_cold_start():
    """Test Scenario 4: Cold Start (New User)"""
    print_section("Scenario 4: Cold Start (New User)")

    # Create user and dialog
    print_info("Creating new user...")
    user = create_user(f"cold_start_{int(time.time())}")
    dialog = create_dialog(user["user_id"], topic="algebra")
    print_success(f"Created user_id={user['user_id']}, dialog_id={dialog['dialog_id']}")

    # Get recommendation immediately (no history)
    print_info("Getting recommendation for cold start user...")
    rec = get_recommendation(user["user_id"], dialog["dialog_id"])
    print(f"  - Recommended content: {rec['content']['title']}")
    print(f"  - Difficulty: {rec['content']['difficulty_level']}")
    print(f"  - Format: {rec['content']['format']}")
    print(f"  - Confidence: {rec['confidence']:.2f}")
    print(f"  - Reasoning: {rec['reasoning'][:150]}...")

    # Verify normal difficulty for cold start
    if rec['content']['difficulty_level'] == 'normal':
        print_success("✓ Cold start user got normal difficulty as expected!")
    else:
        print_error(f"✗ Expected normal, got {rec['content']['difficulty_level']}")

    # Verify low confidence
    if rec['confidence'] <= 0.6:
        print_success("✓ Confidence is appropriately low for cold start!")
    else:
        print_error(f"✗ Expected low confidence, got {rec['confidence']}")

    return rec


def test_scenario_full_workflow():
    """Test Scenario 6: Full workflow with automatic recommendation"""
    print_section("Scenario 6: Full Workflow with Automatic Recommendation")

    # Create user and dialog
    print_info("Creating user and dialog...")
    user = create_user(f"workflow_{int(time.time())}")
    dialog = create_dialog(user["user_id"], topic="algebra")
    print_success(f"Created user_id={user['user_id']}, dialog_id={dialog['dialog_id']}")

    # Submit message with include_recommendation=true
    print_info("Submitting message with include_recommendation=true...")
    result = submit_message(
        dialog_id=dialog["dialog_id"],
        content="My answer is 42",
        content_id=2,
        is_correct=True,
        response_time=45,
        include_recommendation=True
    )

    # Verify response structure
    print_info("Verifying response structure...")
    assert "message" in result, "Missing 'message' in response"
    assert "recommendation" in result, "Missing 'recommendation' in response"
    assert "workflow_metadata" in result, "Missing 'workflow_metadata' in response"
    print_success("✓ Response has correct structure")

    # Check workflow metadata
    metadata = result["workflow_metadata"]
    print_info("Checking workflow metadata...")
    print(f"  - Metrics computed: {metadata.get('metrics_computed', False)}")
    print(f"  - Profile updated: {metadata.get('profile_updated', False)}")
    print(f"  - Recommendation generated: {metadata.get('recommendation_generated', False)}")
    print(f"  - Total processing time: {metadata.get('total_processing_time_ms', 0)}ms")
    print(f"  - Errors: {len(metadata.get('errors', []))}")

    # Verify all steps completed
    if metadata.get('metrics_computed') and metadata.get('profile_updated') and metadata.get('recommendation_generated'):
        print_success("✓ All workflow steps completed successfully!")
    else:
        print_error("✗ Some workflow steps failed")
        if metadata.get('errors'):
            for error in metadata['errors']:
                print_error(f"  Error: {error}")

    # Display recommendation
    if result["recommendation"]:
        rec = result["recommendation"]
        print_info("Recommendation details:")
        print(f"  - Content: {rec['content']['title']}")
        print(f"  - Difficulty: {rec['content']['difficulty_level']}")
        print(f"  - Confidence: {rec['confidence']:.2f}")
        print(f"  - Reasoning: {rec['reasoning'][:150]}...")

    return result


def test_scenario_multiple_iterations():
    """Test multiple iterations to see adaptation in action"""
    print_section("Scenario: Multiple Iterations - Watching Adaptation")

    # Create user and dialog
    print_info("Creating user and dialog...")
    user = create_user(f"iterations_{int(time.time())}")
    dialog = create_dialog(user["user_id"], topic="algebra")
    print_success(f"Created user_id={user['user_id']}, dialog_id={dialog['dialog_id']}")

    # Perform 10 interactions
    for iteration in range(1, 11):
        print(f"\n{YELLOW}--- Iteration {iteration} ---{RESET}")

        # Alternate between correct and incorrect for interesting behavior
        is_correct = (iteration % 3 != 0)  # 2 correct, 1 incorrect pattern
        response_time = 30 + (iteration * 5)  # Gradually slower

        # Submit message with auto-recommendation
        result = submit_message(
            dialog_id=dialog["dialog_id"],
            content=f"Answer {iteration}",
            content_id=2,
            is_correct=is_correct,
            response_time=response_time,
            include_recommendation=True
        )

        # Show results
        metadata = result["workflow_metadata"]
        rec = result["recommendation"]

        print(f"  Submitted: {'✓ Correct' if is_correct else '✗ Incorrect'} "
              f"(response_time={response_time}s)")
        print(f"  Workflow: {metadata.get('total_processing_time_ms', 0):.0f}ms")

        if rec:
            print(f"  Next content: {rec['content']['title']}")
            print(f"  Difficulty: {rec['content']['difficulty_level']} "
                  f"(confidence: {rec['confidence']:.2f})")

        time.sleep(0.5)

    # Final profile check
    print_info("\nFinal user profile:")
    profile = get_profile(user["user_id"])
    print(f"  - Total interactions: {profile.get('total_interactions', 0)}")
    print(f"  - Avg accuracy: {profile.get('avg_accuracy', 'N/A')}")
    print(f"  - Avg response time: {profile.get('avg_response_time', 'N/A')}s")
    print(f"  - Current difficulty: {profile.get('current_difficulty', 'N/A')}")
    print(f"  - Topic mastery: {json.dumps(profile.get('topic_mastery', {}), indent=4)}")

    print_success("✓ Multiple iterations completed successfully!")


def main():
    """Run all test scenarios"""
    print(f"\n{BLUE}╔═══════════════════════════════════════════════════════════════════════╗{RESET}")
    print(f"{BLUE}║   Full Workflow Integration Test - Week 3, Section 5                 ║{RESET}")
    print(f"{BLUE}╚═══════════════════════════════════════════════════════════════════════╝{RESET}\n")

    try:
        # Test server is running
        response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/docs")
        print_success("API server is running!")
    except Exception as e:
        print_error(f"Cannot connect to API server: {e}")
        print_info("Make sure the server is running: uvicorn app.main:app --reload")
        return

    scenarios = [
        ("Cold Start User", test_scenario_cold_start),
        ("High Performer", test_scenario_high_performer),
        ("Full Workflow", test_scenario_full_workflow),
        ("Multiple Iterations", test_scenario_multiple_iterations),
    ]

    results = {}
    for name, test_func in scenarios:
        try:
            result = test_func()
            results[name] = ("PASS", result)
        except Exception as e:
            print_error(f"Test failed: {e}")
            results[name] = ("FAIL", str(e))
            import traceback
            traceback.print_exc()

    # Summary
    print_section("Test Summary")
    for name, (status, _) in results.items():
        if status == "PASS":
            print_success(f"{name}: PASSED")
        else:
            print_error(f"{name}: FAILED")

    passed = sum(1 for status, _ in results.values() if status == "PASS")
    total = len(results)
    print(f"\n{BLUE}Total: {passed}/{total} tests passed{RESET}\n")


if __name__ == "__main__":
    main()
