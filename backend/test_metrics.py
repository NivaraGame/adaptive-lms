"""
Test script for synchronous metrics computation and database persistence.

This script tests:
1. Synchronous metrics computation with sample data
2. Metrics persistence to database after computation
3. Profile aggregation and updates

Run with: python test_metrics.py
"""

import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.config import settings
from app.db.session import Base
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.content import ContentItem
from app.models.dialog import Dialog
from app.models.message import Message
from app.models.metric import Metric
from app.core.metrics.synchronous import (
    compute_accuracy,
    compute_response_time,
    compute_attempts_count,
    compute_followups_count,
    extract_message_data,
    compute_synchronous_metrics,
    store_metrics
)
from app.core.metrics.aggregators import (
    update_topic_mastery_ema,
    update_topic_mastery,
    update_response_time_avg,
    aggregate_metrics,
    get_topic_mastery,
    get_weak_topics,
    get_strong_topics
)


# Test configuration
# Use main database if test database doesn't exist
TEST_DB_URL = settings.DATABASE_URL

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


def print_test_header(test_name):
    """Print a formatted test header"""
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}TEST: {test_name}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")


def print_success(message):
    """Print success message"""
    print(f"{GREEN}✓ {message}{RESET}")


def print_error(message):
    """Print error message"""
    print(f"{RED}✗ {message}{RESET}")


def print_info(message):
    """Print info message"""
    print(f"{YELLOW}ℹ {message}{RESET}")


class TestMetrics:
    """Test suite for metrics computation and persistence"""

    def __init__(self):
        """Initialize test database connection"""
        self.engine = create_engine(TEST_DB_URL, echo=False)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.db = None
        self.test_user = None
        self.test_profile = None
        self.test_content = None
        self.test_dialog = None

    def setup(self):
        """Set up test database and sample data"""
        print_test_header("Setup: Creating Test Database and Sample Data")

        # Create all tables
        Base.metadata.create_all(bind=self.engine)
        print_success("Database tables created")

        # Create session
        self.db = self.SessionLocal()
        print_success("Database session created")

        # Create test user
        self.test_user = User(
            username=f"test_user_{datetime.utcnow().timestamp()}",
            email=f"test_{datetime.utcnow().timestamp()}@example.com",
            hashed_password="test_hash"
        )
        self.db.add(self.test_user)
        self.db.commit()
        self.db.refresh(self.test_user)
        print_success(f"Test user created (ID: {self.test_user.user_id})")

        # Create user profile
        self.test_profile = UserProfile(
            user_id=self.test_user.user_id,
            topic_mastery={},
            avg_response_time=0.0,
            total_interactions=0
        )
        self.db.add(self.test_profile)
        self.db.commit()
        self.db.refresh(self.test_profile)
        print_success(f"User profile created (ID: {self.test_profile.profile_id})")

        # Create test content
        self.test_content = ContentItem(
            title="Sample Algebra Question",
            topic="algebra",
            subtopic="linear_equations",
            difficulty_level="normal",
            format="text",
            content_type="exercise",
            content_data={"question": "What is x if 2x + 4 = 10?"},
            reference_answer={"answer": "3", "explanation": "2x = 6, so x = 3"}
        )
        self.db.add(self.test_content)
        self.db.commit()
        self.db.refresh(self.test_content)
        print_success(f"Test content created (ID: {self.test_content.content_id})")

        # Create test dialog
        self.test_dialog = Dialog(
            user_id=self.test_user.user_id,
            dialog_type="test",
            topic="algebra"
        )
        self.db.add(self.test_dialog)
        self.db.commit()
        self.db.refresh(self.test_dialog)
        print_success(f"Test dialog created (ID: {self.test_dialog.dialog_id})")

    def teardown(self):
        """Clean up test data"""
        print_test_header("Teardown: Cleaning Up Test Data")

        if self.db:
            try:
                # Delete in reverse order of foreign key dependencies
                self.db.query(Metric).filter(Metric.user_id == self.test_user.user_id).delete()
                self.db.query(Message).filter(Message.dialog_id == self.test_dialog.dialog_id).delete()
                self.db.query(Dialog).filter(Dialog.dialog_id == self.test_dialog.dialog_id).delete()
                self.db.query(UserProfile).filter(UserProfile.user_id == self.test_user.user_id).delete()
                self.db.query(ContentItem).filter(ContentItem.content_id == self.test_content.content_id).delete()
                self.db.query(User).filter(User.user_id == self.test_user.user_id).delete()
                self.db.commit()
                print_success("Test data cleaned up")
            except Exception as e:
                print_error(f"Error during cleanup: {e}")
                self.db.rollback()
            finally:
                self.db.close()

    def test_1_accuracy_computation(self):
        """Test 1: Accuracy computation with different answer types"""
        print_test_header("Test 1: Accuracy Computation")

        # Test binary correct answer
        accuracy = compute_accuracy("3", "3", "binary")
        assert accuracy == 1.0, f"Expected 1.0, got {accuracy}"
        print_success("Binary correct answer: 1.0")

        # Test binary incorrect answer
        accuracy = compute_accuracy("4", "3", "binary")
        assert accuracy == 0.0, f"Expected 0.0, got {accuracy}"
        print_success("Binary incorrect answer: 0.0")

        # Test case-insensitive comparison
        accuracy = compute_accuracy("Paris", "paris", "binary")
        assert accuracy == 1.0, f"Expected 1.0, got {accuracy}"
        print_success("Case-insensitive comparison: 1.0")

        # Test JSONB correct answer
        accuracy = compute_accuracy("3", {"answer": "3"}, "binary")
        assert accuracy == 1.0, f"Expected 1.0, got {accuracy}"
        print_success("JSONB answer format: 1.0")

        # Test list of correct answers
        accuracy = compute_accuracy("paris", ["Paris", "PARIS"], "binary")
        assert accuracy == 1.0, f"Expected 1.0, got {accuracy}"
        print_success("Multiple correct answers: 1.0")

    def test_2_response_time_computation(self):
        """Test 2: Response time computation"""
        print_test_header("Test 2: Response Time Computation")

        # Test 30-second response time
        t1 = datetime(2025, 1, 1, 10, 0, 0)
        t2 = datetime(2025, 1, 1, 10, 0, 30)
        response_time = compute_response_time(t1, t2)
        assert response_time == 30.0, f"Expected 30.0, got {response_time}"
        print_success(f"30-second response time: {response_time}s")

        # Test 2-minute response time
        t1 = datetime(2025, 1, 1, 10, 0, 0)
        t2 = datetime(2025, 1, 1, 10, 2, 0)
        response_time = compute_response_time(t1, t2)
        assert response_time == 120.0, f"Expected 120.0, got {response_time}"
        print_success(f"2-minute response time: {response_time}s")

    def test_3_attempts_and_followups(self):
        """Test 3: Attempts and follow-ups counting"""
        print_test_header("Test 3: Attempts and Follow-ups Counting")

        # Test attempts count
        message_data = {"attempts": 3}
        attempts = compute_attempts_count(message_data)
        assert attempts == 3, f"Expected 3, got {attempts}"
        print_success(f"Attempts count: {attempts}")

        # Test default attempts
        message_data = {}
        attempts = compute_attempts_count(message_data)
        assert attempts == 1, f"Expected 1, got {attempts}"
        print_success(f"Default attempts count: {attempts}")

        # Test follow-ups count
        dialog_messages = [
            {"sender_type": "system", "content": "Question?"},
            {"sender_type": "user", "content": "Answer"},
            {"sender_type": "user", "content": "Wait, clarification?"},
            {"sender_type": "user", "content": "Another question?"}
        ]
        followups = compute_followups_count(dialog_messages)
        assert followups == 2, f"Expected 2, got {followups}"
        print_success(f"Follow-ups count: {followups}")

    def test_4_synchronous_metrics_computation(self):
        """Test 4: Complete synchronous metrics computation"""
        print_test_header("Test 4: Synchronous Metrics Computation")

        # Prepare message data
        delivery_time = datetime.utcnow() - timedelta(seconds=25)
        response_time = datetime.utcnow()

        message_data = {
            "user_id": self.test_user.user_id,
            "dialog_id": self.test_dialog.dialog_id,
            "content_id": self.test_content.content_id,
            "user_answer": "3",
            "correct_answer": {"answer": "3"},
            "content_delivery_time": delivery_time,
            "user_response_time": response_time,
            "attempts": 1,
            "topic": "algebra",
            "dialog_messages": [
                {"sender_type": "system", "content": "Question"},
                {"sender_type": "user", "content": "3"}
            ]
        }

        # Compute metrics
        metrics = compute_synchronous_metrics(message_data, self.db)

        # Verify all metrics are computed
        assert metrics["user_id"] == self.test_user.user_id
        print_success(f"User ID: {metrics['user_id']}")

        assert metrics["accuracy"] == 1.0
        print_success(f"Accuracy: {metrics['accuracy']}")

        assert metrics["response_time"] is not None
        assert 24 <= metrics["response_time"] <= 26  # ~25 seconds
        print_success(f"Response time: {metrics['response_time']:.2f}s")

        assert metrics["attempts_count"] == 1
        print_success(f"Attempts count: {metrics['attempts_count']}")

        assert metrics["followups_count"] == 0
        print_success(f"Follow-ups count: {metrics['followups_count']}")

        return metrics

    def test_5_metrics_persistence(self):
        """Test 5: Metrics persistence to database"""
        print_test_header("Test 5: Metrics Persistence to Database")

        # Compute metrics first
        delivery_time = datetime.utcnow() - timedelta(seconds=30)
        response_time = datetime.utcnow()

        message_data = {
            "user_id": self.test_user.user_id,
            "dialog_id": self.test_dialog.dialog_id,
            "content_id": self.test_content.content_id,
            "user_answer": "3",
            "correct_answer": {"answer": "3"},
            "content_delivery_time": delivery_time,
            "user_response_time": response_time,
            "attempts": 1,
            "topic": "algebra",
            "dialog_messages": []
        }

        metrics = compute_synchronous_metrics(message_data, self.db)

        # Store metrics in database
        metric_objects = store_metrics(metrics, self.db)

        assert len(metric_objects) == 4, f"Expected 4 metrics stored, got {len(metric_objects)}"
        print_success(f"Stored {len(metric_objects)} metrics to database")

        # Verify metrics in database
        db_metrics = self.db.query(Metric).filter(
            Metric.user_id == self.test_user.user_id
        ).all()

        assert len(db_metrics) >= 4, f"Expected at least 4 metrics in DB, got {len(db_metrics)}"
        print_success(f"Verified {len(db_metrics)} metrics in database")

        # Check metric names
        metric_names = [m.metric_name for m in db_metrics]
        expected_names = ["accuracy", "response_time", "attempts_count", "followups_count"]
        for name in expected_names:
            assert name in metric_names, f"Missing metric: {name}"
        print_success(f"All metric types found: {expected_names}")

        # Check accuracy metric
        accuracy_metric = next((m for m in db_metrics if m.metric_name == "accuracy"), None)
        assert accuracy_metric is not None
        assert accuracy_metric.metric_value_f == 1.0
        print_success(f"Accuracy metric value: {accuracy_metric.metric_value_f}")

        return metrics

    def test_6_ema_calculation(self):
        """Test 6: EMA (Exponential Moving Average) calculation"""
        print_test_header("Test 6: EMA Calculation")

        # Test EMA with correct answer (improvement)
        current_mastery = 0.5
        new_score = 1.0
        alpha = 0.3
        new_mastery = update_topic_mastery_ema(current_mastery, new_score, alpha)
        expected = 0.3 * 1.0 + 0.7 * 0.5  # 0.65
        assert abs(new_mastery - expected) < 0.001, f"Expected {expected}, got {new_mastery}"
        print_success(f"EMA with improvement: {current_mastery} → {new_mastery}")

        # Test EMA with incorrect answer (decline)
        current_mastery = 0.5
        new_score = 0.0
        new_mastery = update_topic_mastery_ema(current_mastery, new_score, alpha)
        expected = 0.3 * 0.0 + 0.7 * 0.5  # 0.35
        assert abs(new_mastery - expected) < 0.001, f"Expected {expected}, got {new_mastery}"
        print_success(f"EMA with decline: {current_mastery} → {new_mastery}")

    def test_7_topic_mastery_update(self):
        """Test 7: Topic mastery update in database"""
        print_test_header("Test 7: Topic Mastery Update")

        # Update topic mastery for algebra
        new_mastery = update_topic_mastery(
            user_id=self.test_user.user_id,
            topic="algebra",
            score=1.0,
            db=self.db,
            alpha=0.3
        )

        assert new_mastery > 0, f"Expected positive mastery, got {new_mastery}"
        print_success(f"Algebra mastery updated: {new_mastery:.4f}")

        # Verify in database
        profile = self.db.query(UserProfile).filter(
            UserProfile.user_id == self.test_user.user_id
        ).first()

        assert "algebra" in profile.topic_mastery
        assert profile.topic_mastery["algebra"] == round(new_mastery, 4)
        print_success(f"Verified in database: {profile.topic_mastery['algebra']}")

        # Update again (should increase)
        new_mastery_2 = update_topic_mastery(
            user_id=self.test_user.user_id,
            topic="algebra",
            score=1.0,
            db=self.db,
            alpha=0.3
        )

        assert new_mastery_2 > new_mastery, "Mastery should increase with correct answer"
        print_success(f"Algebra mastery increased: {new_mastery:.4f} → {new_mastery_2:.4f}")

    def test_8_response_time_aggregation(self):
        """Test 8: Response time rolling average"""
        print_test_header("Test 8: Response Time Aggregation")

        # Test first interaction
        avg = update_response_time_avg(0.0, 30.0, 0, window_size=10)
        assert avg == 30.0, f"Expected 30.0, got {avg}"
        print_success(f"First interaction: {avg}s")

        # Test second interaction
        avg = update_response_time_avg(30.0, 20.0, 1, window_size=10)
        expected = 30.0 * 0.5 + 20.0 * 0.5  # 25.0
        assert abs(avg - expected) < 0.1, f"Expected {expected}, got {avg}"
        print_success(f"Second interaction: {avg}s")

        # Test with window size reached
        avg = update_response_time_avg(25.0, 15.0, 10, window_size=10)
        expected = 25.0 * 0.9 + 15.0 * 0.1  # 24.0
        assert abs(avg - expected) < 0.1, f"Expected {expected}, got {avg}"
        print_success(f"With full window: {avg}s")

    def test_9_aggregate_metrics(self):
        """Test 9: Complete metrics aggregation"""
        print_test_header("Test 9: Complete Metrics Aggregation")

        # Prepare metrics
        metrics = {
            "accuracy": 1.0,
            "response_time": 25.0,
            "content_id": self.test_content.content_id,
            "topic": "algebra"
        }

        # Aggregate metrics
        updated_profile = aggregate_metrics(
            user_id=self.test_user.user_id,
            metrics=metrics,
            db=self.db,
            alpha=0.3,
            window_size=10
        )

        # Verify updates
        assert "algebra" in updated_profile["topic_mastery"]
        print_success(f"Topic mastery updated: {updated_profile['topic_mastery']}")

        assert updated_profile["avg_response_time"] > 0
        print_success(f"Avg response time: {updated_profile['avg_response_time']}s")

        assert updated_profile["total_interactions"] > 0
        print_success(f"Total interactions: {updated_profile['total_interactions']}")

    def test_10_multiple_topics(self):
        """Test 10: Multiple topics tracking"""
        print_test_header("Test 10: Multiple Topics Tracking")

        topics_scores = [
            ("algebra", 1.0),
            ("calculus", 0.8),
            ("geometry", 0.6),
            ("algebra", 1.0),  # Second algebra interaction
        ]

        for topic, score in topics_scores:
            update_topic_mastery(
                user_id=self.test_user.user_id,
                topic=topic,
                score=score,
                db=self.db,
                alpha=0.3
            )

        # Verify all topics tracked
        profile = self.db.query(UserProfile).filter(
            UserProfile.user_id == self.test_user.user_id
        ).first()

        assert "algebra" in profile.topic_mastery
        assert "calculus" in profile.topic_mastery
        assert "geometry" in profile.topic_mastery
        print_success(f"All topics tracked: {list(profile.topic_mastery.keys())}")
        print_success(f"Topic masteries: {profile.topic_mastery}")

    def test_11_weak_and_strong_topics(self):
        """Test 11: Identify weak and strong topics"""
        print_test_header("Test 11: Weak and Strong Topics Identification")

        # Get weak topics
        weak_topics = get_weak_topics(
            user_id=self.test_user.user_id,
            db=self.db,
            threshold=0.5,
            limit=3
        )
        print_success(f"Weak topics (< 0.5): {weak_topics}")

        # Get strong topics
        strong_topics = get_strong_topics(
            user_id=self.test_user.user_id,
            db=self.db,
            threshold=0.7,
            limit=3
        )
        print_success(f"Strong topics (>= 0.7): {strong_topics}")

    def test_12_end_to_end_workflow(self):
        """Test 12: Complete end-to-end workflow"""
        print_test_header("Test 12: End-to-End Workflow")

        print_info("Simulating complete user interaction workflow...")

        # Step 1: Create message
        message = Message(
            dialog_id=self.test_dialog.dialog_id,
            sender_type="user",
            content="3",
            extra_data={"content_id": self.test_content.content_id, "attempts": 1}
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        print_success(f"Step 1: Message created (ID: {message.message_id})")

        # Step 2: Extract message data
        delivery_time = datetime.utcnow() - timedelta(seconds=20)
        message_data = extract_message_data(
            message=message,
            content=self.test_content,
            dialog_messages=[]
        )
        message_data["content_delivery_time"] = delivery_time
        print_success("Step 2: Message data extracted")

        # Step 3: Compute synchronous metrics
        metrics = compute_synchronous_metrics(message_data, self.db)
        print_success(f"Step 3: Metrics computed - Accuracy: {metrics.get('accuracy')}, "
                     f"Response time: {metrics.get('response_time'):.2f}s")

        # Step 4: Store metrics
        metric_objects = store_metrics(metrics, self.db)
        print_success(f"Step 4: {len(metric_objects)} metrics stored to database")

        # Step 5: Aggregate metrics
        updated_profile = aggregate_metrics(
            user_id=self.test_user.user_id,
            metrics=metrics,
            db=self.db
        )
        print_success(f"Step 5: Profile updated - Total interactions: "
                     f"{updated_profile['total_interactions']}")

        # Step 6: Verify database state
        db_metrics_count = self.db.query(Metric).filter(
            Metric.user_id == self.test_user.user_id
        ).count()
        print_success(f"Step 6: Verified {db_metrics_count} total metrics in database")

        profile = self.db.query(UserProfile).filter(
            UserProfile.user_id == self.test_user.user_id
        ).first()
        print_success(f"Step 6: Profile state - Interactions: {profile.total_interactions}, "
                     f"Topics: {list(profile.topic_mastery.keys())}")

    def run_all_tests(self):
        """Run all tests"""
        tests = [
            self.test_1_accuracy_computation,
            self.test_2_response_time_computation,
            self.test_3_attempts_and_followups,
            self.test_4_synchronous_metrics_computation,
            self.test_5_metrics_persistence,
            self.test_6_ema_calculation,
            self.test_7_topic_mastery_update,
            self.test_8_response_time_aggregation,
            self.test_9_aggregate_metrics,
            self.test_10_multiple_topics,
            self.test_11_weak_and_strong_topics,
            self.test_12_end_to_end_workflow,
        ]

        passed = 0
        failed = 0
        errors = []

        for test in tests:
            try:
                test()
                passed += 1
            except AssertionError as e:
                failed += 1
                errors.append((test.__name__, str(e)))
                print_error(f"FAILED: {test.__name__} - {str(e)}")
            except Exception as e:
                failed += 1
                errors.append((test.__name__, str(e)))
                print_error(f"ERROR: {test.__name__} - {str(e)}")

        # Print summary
        print_test_header("Test Summary")
        print(f"\n{GREEN}Passed: {passed}{RESET}")
        print(f"{RED}Failed: {failed}{RESET}")
        print(f"Total: {passed + failed}")

        if errors:
            print(f"\n{RED}Failed Tests:{RESET}")
            for test_name, error in errors:
                print(f"  - {test_name}: {error}")

        return passed, failed


def main():
    """Main test execution"""
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}Metrics System Test Suite{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")
    print_info(f"Using database: {TEST_DB_URL}")

    tester = TestMetrics()

    try:
        # Setup
        tester.setup()

        # Run all tests
        passed, failed = tester.run_all_tests()

        # Final result
        print_test_header("Final Result")
        if failed == 0:
            print(f"\n{GREEN}{'='*60}{RESET}")
            print(f"{GREEN}ALL TESTS PASSED! ✓{RESET}")
            print(f"{GREEN}{'='*60}{RESET}\n")
            return 0
        else:
            print(f"\n{RED}{'='*60}{RESET}")
            print(f"{RED}SOME TESTS FAILED ✗{RESET}")
            print(f"{RED}{'='*60}{RESET}\n")
            return 1

    except Exception as e:
        print_error(f"Test suite error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        # Cleanup
        tester.teardown()


if __name__ == "__main__":
    sys.exit(main())
