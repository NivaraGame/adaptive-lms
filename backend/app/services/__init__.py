"""
Services package for Adaptive LMS.

This package contains business logic services that are used by API routes.
Services separate business logic from HTTP handling, making code more maintainable and testable.
"""

from . import user_service
from . import recommendation_service

__all__ = [
    "user_service",
    "recommendation_service",
]
