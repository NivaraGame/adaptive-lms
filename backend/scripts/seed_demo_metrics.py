"""
Seed demo metrics for static user (userId=1) to populate dashboard charts
"""
import sys
import os
from datetime import datetime, timedelta
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models.metric import Metric
from app.models.user_profile import UserProfile


def seed_demo_metrics():
    db = SessionLocal()

    try:
        user_id = 1

        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            print(f"User profile for user_id={user_id} not found. Run seed_db.py first.")
            return

        # Generate metrics for last 90 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=90)

        metrics_created = 0
        current_date = start_date
        base_accuracy = 0.5

        while current_date <= end_date:
            daily_interactions = random.randint(3, 5)

            for _ in range(daily_interactions):
                days_passed = (current_date - start_date).days
                improvement = min(0.3, days_passed * 0.003)

                accuracy = base_accuracy + improvement + random.uniform(-0.15, 0.15)
                accuracy = max(0.0, min(1.0, accuracy))

                metric = Metric(
                    user_id=user_id,
                    metric_name="accuracy",
                    metric_value_f=accuracy,
                    timestamp=current_date + timedelta(hours=random.randint(8, 20)),
                    context={"demo": True}
                )
                db.add(metric)

                response_time = random.uniform(10, 60)
                time_metric = Metric(
                    user_id=user_id,
                    metric_name="response_time",
                    metric_value_f=response_time,
                    timestamp=current_date + timedelta(hours=random.randint(8, 20)),
                    context={"demo": True}
                )
                db.add(time_metric)

                metrics_created += 2

            current_date += timedelta(days=1)

        db.commit()
        print(f"✅ Created {metrics_created} demo metrics for user_id={user_id}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_metrics()
