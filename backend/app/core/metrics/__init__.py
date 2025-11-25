"""
Metrics module for the Adaptive LMS.

This module contains:
- synchronous.py: Real-time metrics computation (accuracy, response_time, etc.)
- aggregators.py: Aggregation functions for user profile updates (EMA, rolling averages)
- workflow.py: Metrics computation workflow (integration layer)
- asynchronous.py: LLM-based metrics (awareness, depth, confidence) - Week 8
"""

from .synchronous import (
    compute_accuracy,
    compute_response_time,
    compute_attempts_count,
    compute_followups_count,
    compute_synchronous_metrics,
)

from .aggregators import (
    aggregate_metrics,
    update_topic_mastery,
    get_topic_mastery,
    get_weak_topics,
    get_strong_topics,
)

from .workflow import (
    process_message_metrics,
    process_batch_metrics,
    check_user_profile_exists,
    create_user_profile_if_missing,
    MetricsWorkflowError,
)

__all__ = [
    # Synchronous metrics
    "compute_accuracy",
    "compute_response_time",
    "compute_attempts_count",
    "compute_followups_count",
    "compute_synchronous_metrics",
    # Aggregators
    "aggregate_metrics",
    "update_topic_mastery",
    "get_topic_mastery",
    "get_weak_topics",
    "get_strong_topics",
    # Workflow
    "process_message_metrics",
    "process_batch_metrics",
    "check_user_profile_exists",
    "create_user_profile_if_missing",
    "MetricsWorkflowError",
]
