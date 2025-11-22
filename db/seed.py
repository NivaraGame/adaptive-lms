#!/usr/bin/env python3
"""
Development Seed Data Script for Adaptive LMS

This script populates the PostgreSQL database with realistic development data.
It is idempotent and safe to run multiple times.

Usage:
    python seed.py              # Run with default DATABASE_URL from config
    python seed.py --reset      # Clear existing data before seeding
"""

import sys
import os
import argparse
from datetime import datetime, timedelta
from typing import Optional

# Add backend app to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import IntegrityError

# Import models
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.dialog import Dialog
from app.models.message import Message
from app.models.content import ContentItem
from app.models.metric import Metric
from app.models.experiment import Experiment
from app.config import settings
from app.db.session import Base

# Simple password hashing (in production, use proper bcrypt)
from hashlib import sha256


def hash_password(password: str) -> str:
    """Simple password hashing for development data"""
    return sha256(password.encode()).hexdigest()


class DatabaseSeeder:
    """Handles seeding of development data with idempotency"""

    def __init__(self, session: Session):
        self.session = session
        self.created_users = {}
        self.created_dialogs = {}
        self.created_content = {}

    def get_or_create_user(self, username: str, email: str, password: str = "password123") -> User:
        """Get existing user or create new one"""
        user = self.session.query(User).filter_by(username=username).first()
        if user:
            print(f"  ✓ User '{username}' already exists")
            self.created_users[username] = user
            return user

        user = User(
            username=username,
            email=email,
            hashed_password=hash_password(password),
            created_at=datetime.utcnow() - timedelta(days=30),
            updated_at=datetime.utcnow()
        )
        self.session.add(user)
        self.session.flush()
        print(f"  ✓ Created user '{username}'")
        self.created_users[username] = user
        return user

    def get_or_create_user_profile(self, user: User, **kwargs) -> UserProfile:
        """Get existing profile or create new one"""
        profile = self.session.query(UserProfile).filter_by(user_id=user.user_id).first()
        if profile:
            print(f"  ✓ Profile for '{user.username}' already exists")
            return profile

        profile = UserProfile(
            user_id=user.user_id,
            **kwargs
        )
        self.session.add(profile)
        self.session.flush()
        print(f"  ✓ Created profile for '{user.username}'")
        return profile

    def get_or_create_content(self, title: str, **kwargs) -> ContentItem:
        """Get existing content or create new one"""
        content = self.session.query(ContentItem).filter_by(title=title).first()
        if content:
            print(f"  ✓ Content '{title}' already exists")
            self.created_content[title] = content
            return content

        content = ContentItem(
            title=title,
            **kwargs
        )
        self.session.add(content)
        self.session.flush()
        print(f"  ✓ Created content '{title}'")
        self.created_content[title] = content
        return content

    def seed_users(self):
        """Seed user data"""
        print("\n📝 Seeding Users...")

        users_data = [
            {
                "username": "alice_learner",
                "email": "alice@example.com",
                "password": "alice123"
            },
            {
                "username": "bob_student",
                "email": "bob@example.com",
                "password": "bob123"
            },
            {
                "username": "charlie_dev",
                "email": "charlie@example.com",
                "password": "charlie123"
            },
            {
                "username": "diana_expert",
                "email": "diana@example.com",
                "password": "diana123"
            },
            {
                "username": "test_user",
                "email": "test@example.com",
                "password": "test123"
            }
        ]

        for user_data in users_data:
            self.get_or_create_user(**user_data)

        self.session.commit()
        print(f"✅ Users seeding complete ({len(users_data)} users)")

    def seed_user_profiles(self):
        """Seed user profile data"""
        print("\n📊 Seeding User Profiles...")

        profiles_data = [
            {
                "username": "alice_learner",
                "topic_mastery": {
                    "python_basics": 0.85,
                    "algorithms": 0.65,
                    "data_structures": 0.72,
                    "web_development": 0.45
                },
                "preferred_format": "text",
                "learning_pace": "medium",
                "error_patterns": ["off-by-one", "syntax"],
                "avg_response_time": 45.5,
                "avg_accuracy": 0.78,
                "total_interactions": 156,
                "total_time_spent": 320.5,
                "current_difficulty": "normal"
            },
            {
                "username": "bob_student",
                "topic_mastery": {
                    "python_basics": 0.55,
                    "algorithms": 0.40,
                    "data_structures": 0.48
                },
                "preferred_format": "visual",
                "learning_pace": "slow",
                "error_patterns": ["logic_errors", "indentation"],
                "avg_response_time": 78.2,
                "avg_accuracy": 0.62,
                "total_interactions": 89,
                "total_time_spent": 180.0,
                "current_difficulty": "easy"
            },
            {
                "username": "charlie_dev",
                "topic_mastery": {
                    "python_basics": 0.95,
                    "algorithms": 0.88,
                    "data_structures": 0.92,
                    "web_development": 0.85,
                    "databases": 0.80
                },
                "preferred_format": "interactive",
                "learning_pace": "fast",
                "error_patterns": [],
                "avg_response_time": 28.5,
                "avg_accuracy": 0.91,
                "total_interactions": 245,
                "total_time_spent": 450.0,
                "current_difficulty": "hard"
            },
            {
                "username": "diana_expert",
                "topic_mastery": {
                    "python_basics": 0.98,
                    "algorithms": 0.95,
                    "data_structures": 0.97,
                    "web_development": 0.93,
                    "databases": 0.90,
                    "machine_learning": 0.85
                },
                "preferred_format": "text",
                "learning_pace": "fast",
                "error_patterns": [],
                "avg_response_time": 22.0,
                "avg_accuracy": 0.95,
                "total_interactions": 412,
                "total_time_spent": 680.0,
                "current_difficulty": "challenge"
            },
            {
                "username": "test_user",
                "topic_mastery": {},
                "preferred_format": None,
                "learning_pace": "medium",
                "error_patterns": [],
                "avg_response_time": None,
                "avg_accuracy": None,
                "total_interactions": 0,
                "total_time_spent": 0.0,
                "current_difficulty": "normal"
            }
        ]

        for profile_data in profiles_data:
            username = profile_data.pop("username")
            user = self.created_users[username]
            self.get_or_create_user_profile(user, **profile_data)

        self.session.commit()
        print(f"✅ User profiles seeding complete ({len(profiles_data)} profiles)")

    def seed_content_items(self):
        """Seed learning content"""
        print("\n📚 Seeding Content Items...")

        content_data = [
            {
                "title": "Introduction to Python Variables",
                "topic": "python_basics",
                "subtopic": "variables",
                "difficulty_level": "easy",
                "format": "text",
                "content_type": "lesson",
                "content_data": {
                    "text": "Variables are containers for storing data values. In Python, you don't need to declare variable types explicitly.",
                    "examples": ["x = 5", "name = 'Alice'", "is_valid = True"]
                },
                "reference_answer": None,
                "hints": ["Variables are created when you assign a value", "Python is dynamically typed"],
                "explanations": ["Variables store data", "Assignment uses = operator"],
                "skills": ["variable_declaration", "basic_syntax"],
                "prerequisites": []
            },
            {
                "title": "Python Lists Exercise",
                "topic": "data_structures",
                "subtopic": "lists",
                "difficulty_level": "normal",
                "format": "interactive",
                "content_type": "exercise",
                "content_data": {
                    "question": "Create a list of numbers from 1 to 5 and append the number 6 to it.",
                    "initial_code": "# Write your code here\nnumbers = []"
                },
                "reference_answer": {
                    "code": "numbers = [1, 2, 3, 4, 5]\nnumbers.append(6)",
                    "output": "[1, 2, 3, 4, 5, 6]"
                },
                "hints": ["Use square brackets to create a list", "The append() method adds items"],
                "explanations": ["Lists are created with []", "append() modifies the list in place"],
                "skills": ["list_creation", "list_methods"],
                "prerequisites": ["variable_declaration"]
            },
            {
                "title": "Binary Search Algorithm",
                "topic": "algorithms",
                "subtopic": "searching",
                "difficulty_level": "hard",
                "format": "text",
                "content_type": "lesson",
                "content_data": {
                    "text": "Binary search is an efficient algorithm for finding an item in a sorted list.",
                    "complexity": "O(log n)",
                    "pseudocode": "1. Compare target with middle element\n2. If equal, return index\n3. If less, search left half\n4. If greater, search right half"
                },
                "reference_answer": None,
                "hints": ["Only works on sorted arrays", "Divides search space in half each iteration"],
                "explanations": ["More efficient than linear search", "Requires sorted input"],
                "skills": ["binary_search", "algorithm_analysis"],
                "prerequisites": ["list_creation", "conditionals", "loops"]
            },
            {
                "title": "Dictionary Comprehension Quiz",
                "topic": "python_basics",
                "subtopic": "comprehensions",
                "difficulty_level": "normal",
                "format": "interactive",
                "content_type": "quiz",
                "content_data": {
                    "question": "What will this dictionary comprehension produce?\n{x: x**2 for x in range(3)}",
                    "options": [
                        "{0: 0, 1: 1, 2: 4}",
                        "{1: 1, 2: 4, 3: 9}",
                        "[0, 1, 4]",
                        "Error"
                    ]
                },
                "reference_answer": {
                    "correct": 0,
                    "explanation": "range(3) produces 0, 1, 2. Each is squared as the value."
                },
                "hints": ["range(3) starts at 0", "x**2 means x squared"],
                "explanations": ["Dictionary comprehension creates key-value pairs", "range(3) = 0, 1, 2"],
                "skills": ["comprehensions", "dictionaries"],
                "prerequisites": ["dictionaries", "loops"]
            },
            {
                "title": "SQL JOIN Operations",
                "topic": "databases",
                "subtopic": "joins",
                "difficulty_level": "hard",
                "format": "visual",
                "content_type": "lesson",
                "content_data": {
                    "text": "SQL JOINs combine rows from two or more tables based on a related column.",
                    "types": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
                    "diagram_url": "/diagrams/sql-joins.png"
                },
                "reference_answer": None,
                "hints": ["INNER JOIN returns only matching rows", "LEFT JOIN includes all left table rows"],
                "explanations": ["JOINs merge tables", "Different types have different behaviors"],
                "skills": ["sql_joins", "relational_databases"],
                "prerequisites": ["sql_basics", "table_relationships"]
            },
            {
                "title": "Web API Basics",
                "topic": "web_development",
                "subtopic": "apis",
                "difficulty_level": "normal",
                "format": "text",
                "content_type": "lesson",
                "content_data": {
                    "text": "APIs allow different software systems to communicate. REST APIs use HTTP methods.",
                    "methods": ["GET", "POST", "PUT", "DELETE"],
                    "status_codes": {"200": "OK", "404": "Not Found", "500": "Server Error"}
                },
                "reference_answer": None,
                "hints": ["GET retrieves data", "POST creates data"],
                "explanations": ["REST uses standard HTTP methods", "Status codes indicate result"],
                "skills": ["api_basics", "http_methods"],
                "prerequisites": ["web_basics"]
            }
        ]

        for content in content_data:
            self.get_or_create_content(**content)

        self.session.commit()
        print(f"✅ Content items seeding complete ({len(content_data)} items)")

    def seed_dialogs_and_messages(self):
        """Seed dialogs and messages"""
        print("\n💬 Seeding Dialogs and Messages...")

        # Dialog for alice_learner
        alice = self.created_users["alice_learner"]
        dialog1 = Dialog(
            user_id=alice.user_id,
            dialog_type="educational",
            topic="python_basics",
            started_at=datetime.utcnow() - timedelta(hours=2),
            ended_at=datetime.utcnow() - timedelta(hours=1, minutes=45),
            extra_data={"session_type": "practice"}
        )

        # Check if similar dialog exists
        existing = self.session.query(Dialog).filter_by(
            user_id=alice.user_id,
            dialog_type="educational",
            topic="python_basics"
        ).first()

        if not existing:
            self.session.add(dialog1)
            self.session.flush()

            # Add messages to dialog
            messages = [
                Message(
                    dialog_id=dialog1.dialog_id,
                    sender_type="system",
                    content="Welcome to your Python basics session! Let's start with variables.",
                    timestamp=dialog1.started_at,
                    is_question=False
                ),
                Message(
                    dialog_id=dialog1.dialog_id,
                    sender_type="system",
                    content="What would you use to store a person's age in Python?",
                    timestamp=dialog1.started_at + timedelta(minutes=1),
                    is_question=True
                ),
                Message(
                    dialog_id=dialog1.dialog_id,
                    sender_type="user",
                    content="age = 25",
                    timestamp=dialog1.started_at + timedelta(minutes=2),
                    is_question=False
                ),
                Message(
                    dialog_id=dialog1.dialog_id,
                    sender_type="system",
                    content="Excellent! That's correct. Variables in Python are assigned using the = operator.",
                    timestamp=dialog1.started_at + timedelta(minutes=2, seconds=5),
                    is_question=False
                )
            ]

            for msg in messages:
                self.session.add(msg)

            print(f"  ✓ Created dialog and messages for '{alice.username}'")
        else:
            print(f"  ✓ Dialog for '{alice.username}' already exists")

        # Dialog for bob_student
        bob = self.created_users["bob_student"]
        dialog2 = Dialog(
            user_id=bob.user_id,
            dialog_type="test",
            topic="data_structures",
            started_at=datetime.utcnow() - timedelta(hours=5),
            ended_at=datetime.utcnow() - timedelta(hours=4, minutes=30),
            extra_data={"test_type": "assessment", "score": 0.65}
        )

        existing2 = self.session.query(Dialog).filter_by(
            user_id=bob.user_id,
            dialog_type="test",
            topic="data_structures"
        ).first()

        if not existing2:
            self.session.add(dialog2)
            self.session.flush()

            messages2 = [
                Message(
                    dialog_id=dialog2.dialog_id,
                    sender_type="system",
                    content="This is an assessment on data structures. Question 1: How do you create an empty list?",
                    timestamp=dialog2.started_at,
                    is_question=True
                ),
                Message(
                    dialog_id=dialog2.dialog_id,
                    sender_type="user",
                    content="list = []",
                    timestamp=dialog2.started_at + timedelta(minutes=3),
                    is_question=False
                ),
                Message(
                    dialog_id=dialog2.dialog_id,
                    sender_type="system",
                    content="Good! Though 'list' is a built-in type, so it's better to use a different variable name.",
                    timestamp=dialog2.started_at + timedelta(minutes=3, seconds=2),
                    is_question=False
                )
            ]

            for msg in messages2:
                self.session.add(msg)

            print(f"  ✓ Created dialog and messages for '{bob.username}'")
        else:
            print(f"  ✓ Dialog for '{bob.username}' already exists")

        # Dialog for charlie_dev
        charlie = self.created_users["charlie_dev"]
        dialog3 = Dialog(
            user_id=charlie.user_id,
            dialog_type="reflective",
            topic="algorithms",
            started_at=datetime.utcnow() - timedelta(days=1),
            ended_at=datetime.utcnow() - timedelta(days=1, hours=-1),
            extra_data={"reflection_type": "problem_solving"}
        )

        existing3 = self.session.query(Dialog).filter_by(
            user_id=charlie.user_id,
            dialog_type="reflective",
            topic="algorithms"
        ).first()

        if not existing3:
            self.session.add(dialog3)
            self.session.flush()

            messages3 = [
                Message(
                    dialog_id=dialog3.dialog_id,
                    sender_type="system",
                    content="Let's review your approach to the binary search problem. What was your strategy?",
                    timestamp=dialog3.started_at,
                    is_question=True
                ),
                Message(
                    dialog_id=dialog3.dialog_id,
                    sender_type="user",
                    content="I divided the array in half each time and compared the target with the middle element.",
                    timestamp=dialog3.started_at + timedelta(minutes=1),
                    is_question=False
                ),
                Message(
                    dialog_id=dialog3.dialog_id,
                    sender_type="system",
                    content="Perfect! That's the core principle of binary search. Your implementation was very efficient.",
                    timestamp=dialog3.started_at + timedelta(minutes=1, seconds=3),
                    is_question=False
                )
            ]

            for msg in messages3:
                self.session.add(msg)

            print(f"  ✓ Created dialog and messages for '{charlie.username}'")
        else:
            print(f"  ✓ Dialog for '{charlie.username}' already exists")

        self.session.commit()
        print("✅ Dialogs and messages seeding complete")

    def seed_metrics(self):
        """Seed metrics data"""
        print("\n📈 Seeding Metrics...")

        alice = self.created_users["alice_learner"]
        bob = self.created_users["bob_student"]
        charlie = self.created_users["charlie_dev"]

        # Get dialogs
        alice_dialog = self.session.query(Dialog).filter_by(user_id=alice.user_id).first()
        bob_dialog = self.session.query(Dialog).filter_by(user_id=bob.user_id).first()

        metrics_data = [
            # Alice metrics
            {
                "user_id": alice.user_id,
                "dialog_id": alice_dialog.dialog_id if alice_dialog else None,
                "metric_name": "accuracy",
                "metric_value_f": 0.85,
                "timestamp": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "user_id": alice.user_id,
                "dialog_id": alice_dialog.dialog_id if alice_dialog else None,
                "metric_name": "response_time",
                "metric_value_f": 42.5,
                "context": {"unit": "seconds"},
                "timestamp": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "user_id": alice.user_id,
                "metric_name": "session_duration",
                "metric_value_f": 15.0,
                "context": {"unit": "minutes"},
                "timestamp": datetime.utcnow() - timedelta(hours=1, minutes=45)
            },
            # Bob metrics
            {
                "user_id": bob.user_id,
                "dialog_id": bob_dialog.dialog_id if bob_dialog else None,
                "metric_name": "accuracy",
                "metric_value_f": 0.65,
                "timestamp": datetime.utcnow() - timedelta(hours=5)
            },
            {
                "user_id": bob.user_id,
                "dialog_id": bob_dialog.dialog_id if bob_dialog else None,
                "metric_name": "response_time",
                "metric_value_f": 85.3,
                "context": {"unit": "seconds"},
                "timestamp": datetime.utcnow() - timedelta(hours=5)
            },
            # Charlie metrics
            {
                "user_id": charlie.user_id,
                "metric_name": "problem_solving_score",
                "metric_value_f": 0.95,
                "metric_value_j": {"problem": "binary_search", "attempts": 1},
                "timestamp": datetime.utcnow() - timedelta(days=1)
            },
            {
                "user_id": charlie.user_id,
                "metric_name": "completion_speed",
                "metric_value_s": "fast",
                "metric_value_f": 18.5,
                "context": {"unit": "minutes"},
                "timestamp": datetime.utcnow() - timedelta(days=1)
            }
        ]

        # Check for existing metrics and only add new ones
        existing_count = self.session.query(Metric).filter(
            Metric.user_id.in_([alice.user_id, bob.user_id, charlie.user_id])
        ).count()

        if existing_count == 0:
            for metric_data in metrics_data:
                metric = Metric(**metric_data)
                self.session.add(metric)
            self.session.commit()
            print(f"  ✓ Created {len(metrics_data)} metrics")
        else:
            print(f"  ✓ Metrics already exist ({existing_count} found)")

        print("✅ Metrics seeding complete")

    def seed_experiments(self):
        """Seed experiment data"""
        print("\n🧪 Seeding Experiments...")

        alice = self.created_users["alice_learner"]
        bob = self.created_users["bob_student"]
        charlie = self.created_users["charlie_dev"]
        diana = self.created_users["diana_expert"]

        experiments_data = [
            {
                "user_id": alice.user_id,
                "experiment_name": "adaptive_difficulty",
                "variant_name": "gradual_increase",
                "started_at": datetime.utcnow() - timedelta(days=15),
                "ended_at": None,
                "extra_data": {"initial_level": "easy", "current_level": "normal"}
            },
            {
                "user_id": bob.user_id,
                "experiment_name": "adaptive_difficulty",
                "variant_name": "slow_progression",
                "started_at": datetime.utcnow() - timedelta(days=20),
                "ended_at": None,
                "extra_data": {"initial_level": "easy", "current_level": "easy"}
            },
            {
                "user_id": charlie.user_id,
                "experiment_name": "content_format",
                "variant_name": "interactive_first",
                "started_at": datetime.utcnow() - timedelta(days=30),
                "ended_at": datetime.utcnow() - timedelta(days=10),
                "extra_data": {"format": "interactive", "satisfaction": 4.5}
            },
            {
                "user_id": charlie.user_id,
                "experiment_name": "adaptive_difficulty",
                "variant_name": "challenge_mode",
                "started_at": datetime.utcnow() - timedelta(days=10),
                "ended_at": None,
                "extra_data": {"initial_level": "hard", "current_level": "challenge"}
            },
            {
                "user_id": diana.user_id,
                "experiment_name": "learning_path",
                "variant_name": "custom_curriculum",
                "started_at": datetime.utcnow() - timedelta(days=45),
                "ended_at": None,
                "extra_data": {"topics": ["machine_learning", "advanced_algorithms"], "progress": 0.75}
            }
        ]

        # Check for existing experiments
        existing_count = self.session.query(Experiment).count()

        if existing_count == 0:
            for exp_data in experiments_data:
                experiment = Experiment(**exp_data)
                self.session.add(experiment)
            self.session.commit()
            print(f"  ✓ Created {len(experiments_data)} experiments")
        else:
            print(f"  ✓ Experiments already exist ({existing_count} found)")

        print("✅ Experiments seeding complete")

    def run_all(self):
        """Run all seeding operations"""
        print("🌱 Starting database seeding...\n")
        print("=" * 50)

        self.seed_users()
        self.seed_user_profiles()
        self.seed_content_items()
        self.seed_dialogs_and_messages()
        self.seed_metrics()
        self.seed_experiments()

        print("\n" + "=" * 50)
        print("✅ Database seeding completed successfully!")
        print("\n📊 Summary:")
        print(f"  - Users: {len(self.created_users)}")
        print(f"  - Content Items: {len(self.created_content)}")
        print(f"  - Dialogs with messages: 3+")
        print(f"  - Metrics and experiments added")
        print("\n🔐 Test credentials:")
        print("  - alice_learner / alice123")
        print("  - bob_student / bob123")
        print("  - charlie_dev / charlie123")
        print("  - diana_expert / diana123")
        print("  - test_user / test123")


def reset_database(engine):
    """Drop all tables and recreate them"""
    print("⚠️  Resetting database (dropping all tables)...")
    Base.metadata.drop_all(bind=engine)
    print("✓ Dropped all tables")
    Base.metadata.create_all(bind=engine)
    print("✓ Recreated all tables")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Seed the Adaptive LMS database with development data")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Reset database (drop and recreate tables) before seeding"
    )
    parser.add_argument(
        "--db-url",
        type=str,
        default=None,
        help="Database URL (defaults to config DATABASE_URL)"
    )

    args = parser.parse_args()

    # Get database URL
    db_url = args.db_url or settings.DATABASE_URL

    print(f"🔗 Connecting to database...")
    print(f"   URL: {db_url.split('@')[1] if '@' in db_url else 'local'}")

    try:
        # Create engine
        engine = create_engine(db_url, pool_pre_ping=True)

        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✓ Connected to PostgreSQL")
            print(f"  Version: {version.split(',')[0]}")

        # Reset if requested
        if args.reset:
            confirm = input("\n⚠️  Are you sure you want to reset the database? (yes/no): ")
            if confirm.lower() == "yes":
                reset_database(engine)
            else:
                print("Reset cancelled.")
                return
        else:
            # Create tables if they don't exist
            Base.metadata.create_all(bind=engine)

        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()

        try:
            # Run seeding
            seeder = DatabaseSeeder(session)
            seeder.run_all()
        finally:
            session.close()

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
