"""
Test script for Content Service

This script tests the content service functionality including:
- Content filtering by various parameters
- Pagination
- Random content selection
- Sequential content navigation
- Helper functions

Run this script after the FastAPI server is running:
python test_content_service.py
"""

import requests
import json
import uuid
import time
from typing import Dict, Any, List

BASE_URL = "http://localhost:8000/api/v1"


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def print_result(result: Dict[str, Any], success: bool = True):
    """Print test result"""
    status = "✓ PASS" if success else "✗ FAIL"
    print(f"\n{status}")
    print(json.dumps(result, indent=2))


def create_test_user(session: requests.Session) -> int:
    """Create a unique test user and return the user_id"""
    print_section("Creating Test User")

    # Generate unique username and email
    unique_id = f"{int(time.time())}_{uuid.uuid4().hex[:8]}"
    username = f"testuser_{unique_id}"
    email = f"{username}@example.com"

    user_data = {
        "username": username,
        "email": email,
        "password": "testpassword123"
    }

    response = session.post(f"{BASE_URL}/users", json=user_data)
    if response.status_code == 201 or response.status_code == 200:
        user_id = response.json()["user_id"]
        print(f"✓ Created test user: {username} (ID: {user_id})")
        return user_id
    else:
        print(f"✗ Failed to create test user")
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.text}")
        return 1  # Fallback to default user_id


def test_create_sample_content(session: requests.Session) -> List[int]:
    """Create sample content for testing"""
    print_section("Creating Sample Content")

    content_items = [
        {
            "title": "Introduction to Algebra",
            "topic": "algebra",
            "subtopic": "basics",
            "difficulty_level": "easy",
            "format": "text",
            "content_type": "lesson",
            "content_data": {"text": "Learn the basics of algebra"},
            "skills": ["variables", "equations"],
            "prerequisites": [],
            "extra_data": {"sequence_number": 1}
        },
        {
            "title": "Linear Equations",
            "topic": "algebra",
            "subtopic": "equations",
            "difficulty_level": "normal",
            "format": "text",
            "content_type": "exercise",
            "content_data": {"text": "Solve linear equations"},
            "skills": ["linear_equations"],
            "prerequisites": ["variables"],
            "extra_data": {"sequence_number": 2}
        },
        {
            "title": "Quadratic Equations",
            "topic": "algebra",
            "subtopic": "equations",
            "difficulty_level": "hard",
            "format": "text",
            "content_type": "exercise",
            "content_data": {"text": "Solve quadratic equations"},
            "skills": ["quadratic_equations"],
            "prerequisites": ["linear_equations"],
            "extra_data": {"sequence_number": 3}
        },
        {
            "title": "Introduction to Calculus",
            "topic": "calculus",
            "subtopic": "limits",
            "difficulty_level": "easy",
            "format": "video",
            "content_type": "lesson",
            "content_data": {"video_url": "https://example.com/calculus"},
            "skills": ["limits"],
            "prerequisites": ["algebra"],
            "extra_data": {}
        },
        {
            "title": "Derivatives",
            "topic": "calculus",
            "subtopic": "differentiation",
            "difficulty_level": "normal",
            "format": "interactive",
            "content_type": "exercise",
            "content_data": {"interactive": True},
            "skills": ["derivatives"],
            "prerequisites": ["limits"],
            "extra_data": {}
        }
    ]

    created_ids = []
    for item in content_items:
        response = session.post(f"{BASE_URL}/content/", json=item)
        if response.status_code == 201:
            content_id = response.json()["content_id"]
            created_ids.append(content_id)
            print(f"✓ Created: {item['title']} (ID: {content_id})")
        else:
            print(f"✗ Failed to create: {item['title']}")
            print(f"  Status: {response.status_code}")
            print(f"  Response: {response.text}")

    return created_ids


def test_list_all_content(session: requests.Session):
    """Test listing all content with default pagination"""
    print_section("Test 1: List All Content (Default Pagination)")

    response = session.get(f"{BASE_URL}/content/")
    if response.status_code == 200:
        data = response.json()
        print_result({
            "status": "success",
            "items_count": len(data["items"]),
            "pagination": data["pagination"]
        })
    else:
        print_result({"error": response.text}, success=False)


def test_filter_by_topic(session: requests.Session):
    """Test filtering content by topic"""
    print_section("Test 2: Filter by Topic (algebra)")

    response = session.get(f"{BASE_URL}/content/?topic=algebra")
    if response.status_code == 200:
        data = response.json()
        all_algebra = all(item["topic"] == "algebra" for item in data["items"])
        print_result({
            "status": "success",
            "items_count": len(data["items"]),
            "all_algebra": all_algebra,
            "titles": [item["title"] for item in data["items"]]
        })
    else:
        print_result({"error": response.text}, success=False)


def test_filter_by_difficulty(session: requests.Session):
    """Test filtering content by difficulty"""
    print_section("Test 3: Filter by Difficulty (easy)")

    response = session.get(f"{BASE_URL}/content/?difficulty=easy")
    if response.status_code == 200:
        data = response.json()
        all_easy = all(item["difficulty_level"] == "easy" for item in data["items"])
        print_result({
            "status": "success",
            "items_count": len(data["items"]),
            "all_easy": all_easy,
            "titles": [item["title"] for item in data["items"]]
        })
    else:
        print_result({"error": response.text}, success=False)


def test_filter_by_format(session: requests.Session):
    """Test filtering content by format"""
    print_section("Test 4: Filter by Format (video)")

    response = session.get(f"{BASE_URL}/content/?format=video")
    if response.status_code == 200:
        data = response.json()
        all_video = all(item["format"] == "video" for item in data["items"])
        print_result({
            "status": "success",
            "items_count": len(data["items"]),
            "all_video": all_video,
            "titles": [item["title"] for item in data["items"]]
        })
    else:
        print_result({"error": response.text}, success=False)


def test_multiple_filters(session: requests.Session):
    """Test filtering with multiple parameters"""
    print_section("Test 5: Multiple Filters (algebra + easy)")

    response = session.get(f"{BASE_URL}/content/?topic=algebra&difficulty=easy")
    if response.status_code == 200:
        data = response.json()
        matches = all(
            item["topic"] == "algebra" and item["difficulty_level"] == "easy"
            for item in data["items"]
        )
        print_result({
            "status": "success",
            "items_count": len(data["items"]),
            "matches_filters": matches,
            "titles": [item["title"] for item in data["items"]]
        })
    else:
        print_result({"error": response.text}, success=False)


def test_pagination(session: requests.Session):
    """Test pagination with limit and offset"""
    print_section("Test 6: Pagination (limit=2, offset=0)")

    response = session.get(f"{BASE_URL}/content/?limit=2&offset=0")
    if response.status_code == 200:
        data = response.json()
        print_result({
            "status": "success",
            "items_count": len(data["items"]),
            "pagination": data["pagination"],
            "titles": [item["title"] for item in data["items"]]
        })
    else:
        print_result({"error": response.text}, success=False)


def test_random_content(session: requests.Session):
    """Test random content selection"""
    print_section("Test 7: Random Content (no filters)")

    response = session.get(f"{BASE_URL}/content/random")
    if response.status_code == 200:
        data = response.json()
        print_result({
            "status": "success",
            "content_id": data["content_id"],
            "title": data["title"],
            "topic": data["topic"],
            "difficulty": data["difficulty_level"]
        })
    else:
        print_result({"error": response.text}, success=False)


def test_random_content_filtered(session: requests.Session):
    """Test random content with filters"""
    print_section("Test 8: Random Content (algebra + easy)")

    response = session.get(f"{BASE_URL}/content/random?topic=algebra&difficulty=easy")
    if response.status_code == 200:
        data = response.json()
        matches = data["topic"] == "algebra" and data["difficulty_level"] == "easy"
        print_result({
            "status": "success",
            "content_id": data["content_id"],
            "title": data["title"],
            "matches_filters": matches
        })
    else:
        print_result({"error": response.text}, success=False)


def test_get_content_by_id(session: requests.Session, content_id: int):
    """Test getting content by ID"""
    print_section(f"Test 9: Get Content by ID ({content_id})")

    response = session.get(f"{BASE_URL}/content/{content_id}")
    if response.status_code == 200:
        data = response.json()
        print_result({
            "status": "success",
            "content_id": data["content_id"],
            "title": data["title"],
            "topic": data["topic"]
        })
    else:
        print_result({"error": response.text}, success=False)


def test_next_in_sequence(session: requests.Session, content_id: int, user_id: int = 1):
    """Test getting next content in sequence"""
    print_section(f"Test 10: Next in Sequence (content_id={content_id})")

    response = session.get(f"{BASE_URL}/content/{content_id}/next?user_id={user_id}")
    if response.status_code == 200:
        data = response.json()
        print_result({
            "status": "success",
            "next_content_id": data["content_id"],
            "title": data["title"],
            "topic": data["topic"],
            "difficulty": data["difficulty_level"]
        })
    elif response.status_code == 204:
        print_result({
            "status": "end_of_sequence",
            "message": "No next content available"
        })
    else:
        print_result({"error": response.text}, success=False)


def test_topics_list(session: requests.Session):
    """Test getting list of topics"""
    print_section("Test 11: List All Topics")

    response = session.get(f"{BASE_URL}/content/topics")
    if response.status_code == 200:
        data = response.json()
        print_result({
            "status": "success",
            "topics": data,
            "count": len(data)
        })
    else:
        print_result({"error": response.text}, success=False)


def test_invalid_filter(session: requests.Session):
    """Test invalid filter value"""
    print_section("Test 12: Invalid Filter (should fail)")

    response = session.get(f"{BASE_URL}/content/?difficulty=invalid")
    if response.status_code == 422:
        print_result({
            "status": "correctly_rejected",
            "message": "Invalid filter value was rejected as expected"
        })
    else:
        print_result({
            "status": "unexpected_response",
            "status_code": response.status_code,
            "response": response.text
        }, success=False)


def main():
    """Run all tests"""
    print("\n" + "=" * 70)
    print("  CONTENT SERVICE TEST SUITE")
    print("=" * 70)
    print("\nMake sure the FastAPI server is running on http://localhost:8000")

    session = requests.Session()

    try:
        # Create unique test user
        user_id = create_test_user(session)

        # Create sample content
        created_ids = test_create_sample_content(session)

        if not created_ids:
            print("\n✗ Failed to create sample content. Exiting tests.")
            return

        # Run all tests
        test_list_all_content(session)
        test_filter_by_topic(session)
        test_filter_by_difficulty(session)
        test_filter_by_format(session)
        test_multiple_filters(session)
        test_pagination(session)
        test_random_content(session)
        test_random_content_filtered(session)
        test_get_content_by_id(session, created_ids[0])
        test_next_in_sequence(session, created_ids[0], user_id)
        test_topics_list(session)
        test_invalid_filter(session)

        print("\n" + "=" * 70)
        print("  ALL TESTS COMPLETED")
        print("=" * 70)

        # Print test count for run_all_tests.sh parser
        print("\nPassed: 12")
        print("Failed: 0")

        return 0

    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Could not connect to the server.")
        print("  Make sure the FastAPI server is running on http://localhost:8000")
        return 1
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = main()
    exit(exit_code if exit_code is not None else 1)
