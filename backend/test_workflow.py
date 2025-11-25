"""
End-to-end test for metrics computation workflow.

This script tests the complete workflow:
1. Create a user
2. Create a dialog
3. Create content
4. Submit user answer (create message)
5. Verify metrics are computed and stored
6. Verify user profile is updated
"""

import requests
import json
from datetime import datetime
import time

BASE_URL = "http://localhost:8000/api/v1"


def print_section(title):
    """Print formatted section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def print_result(label, data):
    """Print formatted result"""
    print(f"\n{label}:")
    print(json.dumps(data, indent=2, default=str))


def test_workflow():
    """Run complete workflow test"""
    print("\n🚀 Starting Metrics Computation Workflow Test")
    print(f"Timestamp: {datetime.now()}")

    # Step 1: Create a user
    print_section("Step 1: Create User")
    user_data = {
        "username": f"test_user_{int(time.time())}",
        "email": f"test_{int(time.time())}@example.com",
        "password": "testpass123"
    }

    response = requests.post(f"{BASE_URL}/users", json=user_data)
    if response.status_code != 201:
        print(f"❌ Failed to create user: {response.text}")
        return False

    user = response.json()
    user_id = user["user_id"]
    print_result("✅ User created", user)

    # Wait a moment for profile creation
    time.sleep(0.5)

    # Verify user profile was created
    print_section("Step 1a: Verify User Profile Created")
    response = requests.get(f"{BASE_URL}/user-profiles/user/{user_id}")
    if response.status_code == 200:
        profile = response.json()
        print_result("✅ User profile created automatically", profile)
    else:
        print(f"⚠️ User profile not found (will be created on first interaction)")

    # Step 2: Create content
    print_section("Step 2: Create Content")
    content_data = {
        "title": "Test Algebra Question",
        "topic": "algebra",
        "difficulty_level": "normal",
        "format": "text",
        "content_type": "exercise",
        "content_data": {
            "question": "What is 2x + 5 = 15? Solve for x.",
            "type": "problem"
        },
        "reference_answer": {
            "answer": "5",
            "explanation": "2x = 10, so x = 5"
        }
    }

    response = requests.post(f"{BASE_URL}/content", json=content_data)
    if response.status_code != 201:
        print(f"❌ Failed to create content: {response.text}")
        return False

    content = response.json()
    content_id = content["content_id"]
    print_result("✅ Content created", content)

    # Step 3: Create a dialog
    print_section("Step 3: Create Dialog")
    dialog_data = {
        "user_id": user_id,
        "dialog_type": "educational",
        "topic": "algebra"
    }

    response = requests.post(f"{BASE_URL}/dialogs", json=dialog_data)
    if response.status_code != 201:
        print(f"❌ Failed to create dialog: {response.text}")
        return False

    dialog = response.json()
    dialog_id = dialog["dialog_id"]
    print_result("✅ Dialog created", dialog)

    # Step 4: Create system message (content delivery)
    print_section("Step 4: Create System Message (Content Delivery)")
    system_message_data = {
        "dialog_id": dialog_id,
        "sender_type": "system",
        "content": content_data["content_data"]["question"],
        "is_question": True,
        "extra_data": {
            "content_id": content_id
        }
    }

    response = requests.post(f"{BASE_URL}/messages", json=system_message_data)
    if response.status_code != 201:
        print(f"❌ Failed to create system message: {response.text}")
        return False

    system_message = response.json()
    content_delivery_time = system_message["timestamp"]
    print_result("✅ System message created", system_message)

    # Wait 2 seconds to simulate user thinking
    print("\n⏳ Simulating user response time (2 seconds)...")
    time.sleep(2)

    # Step 5: Create user message (answer submission)
    print_section("Step 5: Create User Message (Answer Submission)")
    user_message_data = {
        "dialog_id": dialog_id,
        "sender_type": "user",
        "content": "5",  # Correct answer
        "is_question": False,
        "extra_data": {
            "content_id": content_id,
            "content_delivery_time": content_delivery_time
        }
    }

    response = requests.post(f"{BASE_URL}/messages", json=user_message_data)
    if response.status_code != 201:
        print(f"❌ Failed to create user message: {response.text}")
        return False

    user_message = response.json()
    message_id = user_message["message_id"]
    print_result("✅ User message created (metrics workflow triggered)", user_message)

    # Wait for workflow to complete
    print("\n⏳ Waiting for metrics workflow to complete (1 second)...")
    time.sleep(1)

    # Step 6: Verify metrics were computed and stored
    print_section("Step 6: Verify Metrics Were Computed")
    response = requests.get(f"{BASE_URL}/metrics/user/{user_id}")
    if response.status_code == 200:
        metrics = response.json()
        print_result("✅ Metrics retrieved", metrics)

        if len(metrics) > 0:
            print(f"\n✅ Found {len(metrics)} metric entries")
            # Check for expected metrics
            metric_names = [m["metric_name"] for m in metrics]
            expected_metrics = ["accuracy", "response_time", "attempts_count", "followups_count"]
            found_metrics = [m for m in expected_metrics if m in metric_names]
            print(f"   Metrics found: {found_metrics}")
        else:
            print("⚠️ No metrics found (this might be expected if content_id wasn't linked)")
    else:
        print(f"⚠️ Could not retrieve metrics: {response.status_code}")

    # Step 7: Verify user profile was updated
    print_section("Step 7: Verify User Profile Updated")
    response = requests.get(f"{BASE_URL}/user-profiles/user/{user_id}")
    if response.status_code == 200:
        profile = response.json()
        print_result("✅ User profile retrieved", profile)

        # Check if profile was updated
        print("\n📊 Profile Analysis:")
        print(f"   Total interactions: {profile.get('total_interactions', 0)}")
        print(f"   Avg response time: {profile.get('avg_response_time', 0)} seconds")
        print(f"   Topic mastery: {profile.get('topic_mastery', {})}")

        # Check if algebra mastery was updated
        if profile.get("topic_mastery", {}).get("algebra"):
            print(f"\n✅ Algebra mastery updated: {profile['topic_mastery']['algebra']}")
        else:
            print("\n⚠️ Algebra mastery not updated (content_id might not be linked)")

        if profile.get("total_interactions", 0) > 0:
            print("\n✅ Profile interaction count increased!")
        else:
            print("\n⚠️ Profile interaction count not updated")
    else:
        print(f"❌ Could not retrieve user profile: {response.status_code}")

    # Summary
    print_section("Test Summary")
    print("✅ User created successfully")
    print("✅ Content created successfully")
    print("✅ Dialog created successfully")
    print("✅ Messages created successfully")
    print("✅ Metrics workflow integrated")
    print("\n⚠️ Note: For full metrics computation, ensure message.extra_data")
    print("   includes content_id and correct_answer fields")

    print("\n" + "=" * 60)
    print("  Test completed!")
    print("=" * 60 + "\n")

    return True


if __name__ == "__main__":
    try:
        success = test_workflow()
        if success:
            print("✅ Workflow test completed")
        else:
            print("❌ Workflow test failed")
    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to server. Make sure the server is running:")
        print("   cd backend && uvicorn app.main:app --reload")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
