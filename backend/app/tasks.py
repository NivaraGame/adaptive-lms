from celery import Celery
from app.config import settings

# Initialize Celery
celery_app = Celery(
    "adaptive_lms",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)


@celery_app.task(name="tasks.example_task")
def example_task(x: int, y: int) -> int:
    """
    Example Celery task for demonstration purposes.
    Replace with actual tasks for your application.
    """
    return x + y


@celery_app.task(name="tasks.process_metrics")
def process_metrics_task(interaction_id: int):
    """
    Example task for processing learning metrics asynchronously.
    This could include LLM evaluation, analytics updates, etc.
    """
    # TODO: Implement actual metrics processing logic
    print(f"Processing metrics for interaction {interaction_id}")
    return {"status": "completed", "interaction_id": interaction_id}
