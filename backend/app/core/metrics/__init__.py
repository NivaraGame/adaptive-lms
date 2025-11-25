"""
Metrics module for the Adaptive LMS.

This module contains:
- synchronous.py: Real-time metrics computation (accuracy, response_time, etc.)
- aggregators.py: Aggregation functions for user profile updates (EMA, rolling averages)
- asynchronous.py: LLM-based metrics (awareness, depth, confidence) - Week 8
"""

from .synchronous import (
    compute_accuracy,
    compute_response_time,
    compute_attempts_count,
    compute_followups_count,
    compute_synchronous_metrics,
)

__all__ = [
    "compute_accuracy",
    "compute_response_time",
    "compute_attempts_count",
    "compute_followups_count",
    "compute_synchronous_metrics",
]
