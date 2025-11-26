"""
User Profile Service Module

This module provides business logic for user profile management:
- Creating user profiles with default values
- Retrieving user profiles
- Updating user profiles with new metrics
- Managing topic mastery updates
- Handling profile lifecycle operations

This service layer separates business logic from API routes,
making the code more maintainable and testable.
"""

import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.user_profile import UserProfileCreate, UserProfileUpdate
from app.core.metrics.aggregators import (
    update_topic_mastery as update_topic_mastery_ema,
    aggregate_metrics
)

logger = logging.getLogger(__name__)


class UserProfileNotFoundError(Exception):
    """Exception raised when user profile is not found"""
    pass


class UserNotFoundError(Exception):
    """Exception raised when user is not found"""
    pass


class ProfileAlreadyExistsError(Exception):
    """Exception raised when attempting to create duplicate profile"""
    pass


def create_user_profile(
    user_id: int,
    db: Session,
    initial_data: Optional[Dict[str, Any]] = None
) -> UserProfile:
    """
    Create a new user profile with default values.

    This function creates a user profile with sensible defaults for all fields.
    It's idempotent - if a profile already exists, it returns the existing profile
    instead of raising an error (unless strict mode is enabled).

    Args:
        user_id: ID of the user to create profile for
        db: SQLAlchemy database session
        initial_data: Optional dict with custom initial values
            Supported keys:
            - topic_mastery: dict
            - preferred_format: str
            - learning_pace: str
            - current_difficulty: str
            - etc.

    Returns:
        UserProfile: The created (or existing) user profile

    Raises:
        UserNotFoundError: If user with user_id doesn't exist
        IntegrityError: If database constraint is violated

    Example:
        >>> profile = create_user_profile(user_id=1, db=db)
        >>> print(profile.topic_mastery)
        {}
        >>> print(profile.learning_pace)
        'medium'
    """
    logger.info(f"Creating user profile for user_id={user_id}")

    # Verify user exists
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise UserNotFoundError(f"User with id {user_id} not found")

    # Check if profile already exists (idempotency)
    existing_profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id
    ).first()

    if existing_profile:
        logger.info(f"User profile already exists for user_id={user_id}, returning existing profile")
        return existing_profile

    # Set default values
    defaults = {
        "topic_mastery": {},
        "preferred_format": None,
        "learning_pace": "medium",
        "error_patterns": [],
        "avg_response_time": None,
        "avg_accuracy": None,
        "total_interactions": 0,
        "total_time_spent": 0.0,
        "current_difficulty": "normal",
        "extra_data": {},
        "last_updated": datetime.utcnow()
    }

    # Override defaults with initial_data if provided
    if initial_data:
        defaults.update(initial_data)

    # Create new profile
    try:
        profile = UserProfile(
            user_id=user_id,
            **defaults
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)

        logger.info(f"User profile created successfully for user_id={user_id}, profile_id={profile.profile_id}")
        return profile

    except IntegrityError as e:
        logger.error(f"Database integrity error creating profile for user_id={user_id}: {str(e)}")
        db.rollback()
        raise


def get_profile(
    user_id: int,
    db: Session,
    raise_if_missing: bool = True
) -> Optional[UserProfile]:
    """
    Get user profile by user_id.

    Args:
        user_id: ID of the user
        db: SQLAlchemy database session
        raise_if_missing: If True, raise exception when profile not found
        If False, return None when profile not found

    Returns:
        UserProfile or None: The user profile, or None if not found and raise_if_missing=False

    Raises:
        UserProfileNotFoundError: If profile not found and raise_if_missing=True

    Example:
        >>> profile = get_profile(user_id=1, db=db)
        >>> print(profile.topic_mastery)
        {'algebra': 0.75, 'calculus': 0.60}

        >>> # Graceful handling
        >>> profile = get_profile(user_id=999, db=db, raise_if_missing=False)
        >>> if profile is None:
        ...     print("Profile not found")
    """
    logger.debug(f"Retrieving profile for user_id={user_id}")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile and raise_if_missing:
        raise UserProfileNotFoundError(f"Profile not found for user {user_id}")

    return profile


def get_profile_by_id(
    profile_id: int,
    db: Session,
    raise_if_missing: bool = True
) -> Optional[UserProfile]:
    """
    Get user profile by profile_id.

    Args:
        profile_id: ID of the profile
        db: SQLAlchemy database session
        raise_if_missing: If True, raise exception when profile not found

    Returns:
        UserProfile or None: The user profile

    Raises:
        UserProfileNotFoundError: If profile not found and raise_if_missing=True
    """
    logger.debug(f"Retrieving profile by profile_id={profile_id}")

    profile = db.query(UserProfile).filter(UserProfile.profile_id == profile_id).first()

    if not profile and raise_if_missing:
        raise UserProfileNotFoundError(f"Profile with id {profile_id} not found")

    return profile


def update_profile(
    user_id: int,
    metrics_data: Dict[str, Any],
    db: Session,
    use_transaction: bool = True
) -> UserProfile:
    """
    Update user profile with aggregated metrics.

    This function accepts metrics data and updates the user profile accordingly.
    It calls the appropriate aggregator functions and persists changes.

    Args:
        user_id: ID of the user
        metrics_data: Dictionary containing metrics to update
            Supported keys:
            - accuracy: float (0-1) - triggers topic mastery update
            - response_time: float (seconds)
            - topic: str - required if accuracy is provided
            - content_id: int - alternative to topic
            - Any other profile fields to update directly
        db: SQLAlchemy database session
        use_transaction: If True, wrap in transaction for atomicity

    Returns:
        UserProfile: The updated user profile

    Raises:
        UserProfileNotFoundError: If profile doesn't exist

    Example:
        >>> metrics = {
        ...     "accuracy": 1.0,
        ...     "response_time": 25.0,
        ...     "topic": "algebra"
        ... }
        >>> profile = update_profile(user_id=1, metrics_data=metrics, db=db)
        >>> print(profile.topic_mastery['algebra'])
        0.65
    """
    logger.info(f"Updating profile for user_id={user_id} with metrics: {metrics_data}")

    # Get profile
    profile = get_profile(user_id, db, raise_if_missing=True)

    try:
        # Use aggregate_metrics function from aggregators module
        # This handles topic mastery, response time, and interaction count
        updated_stats = aggregate_metrics(
            user_id=user_id,
            metrics=metrics_data,
            db=db
        )

        logger.info(f"Profile updated for user_id={user_id}: {updated_stats}")

        # Refresh profile to get latest state
        db.refresh(profile)
        return profile

    except Exception as e:
        logger.error(f"Error updating profile for user_id={user_id}: {str(e)}")
        if use_transaction:
            db.rollback()
        raise


def update_topic_mastery(
    user_id: int,
    topic: str,
    score: float,
    db: Session,
    alpha: float = 0.3
) -> float:
    """
    Update mastery for a specific topic using Exponential Moving Average (EMA).

    This function updates a single topic's mastery score in the user profile.
    It uses EMA to balance recent performance with historical performance.

    Args:
        user_id: ID of the user
        topic: Topic name (e.g., "algebra", "calculus")
        score: New score from latest interaction (0.0 to 1.0)
        db: SQLAlchemy database session
        alpha: EMA smoothing factor (default: 0.3)
            - Higher alpha = more weight to recent performance
            - Lower alpha = more weight to historical performance

    Returns:
        float: Updated mastery value (0.0 to 1.0)

    Raises:
        UserProfileNotFoundError: If profile doesn't exist

    Example:
        >>> # User answers algebra question correctly
        >>> new_mastery = update_topic_mastery(
        ...     user_id=1,
        ...     topic="algebra",
        ...     score=1.0,
        ...     db=db
        ... )
        >>> print(f"New algebra mastery: {new_mastery:.2f}")
        New algebra mastery: 0.65
    """
    logger.info(f"Updating topic mastery for user_id={user_id}, topic={topic}, score={score}")

    # Verify profile exists first
    profile = get_profile(user_id, db, raise_if_missing=True)

    # Use the aggregator function
    try:
        new_mastery = update_topic_mastery_ema(
            user_id=user_id,
            topic=topic,
            score=score,
            db=db,
            alpha=alpha
        )

        logger.info(f"Topic mastery updated: user_id={user_id}, topic={topic}, new_mastery={new_mastery}")
        return new_mastery

    except Exception as e:
        logger.error(f"Error updating topic mastery for user_id={user_id}, topic={topic}: {str(e)}")
        raise


def update_profile_fields(
    user_id: int,
    update_data: Dict[str, Any],
    db: Session
) -> UserProfile:
    """
    Update specific fields in user profile directly (not metrics-based).

    This function is for updating profile fields that aren't computed from metrics,
    such as preferred_format, learning_pace, etc.

    Args:
        user_id: ID of the user
        update_data: Dictionary with fields to update
        db: SQLAlchemy database session

    Returns:
        UserProfile: The updated profile

    Raises:
        UserProfileNotFoundError: If profile doesn't exist

    Example:
        >>> updated = update_profile_fields(
        ...     user_id=1,
        ...     update_data={"preferred_format": "video", "learning_pace": "fast"},
        ...     db=db
        ... )
    """
    logger.info(f"Updating profile fields for user_id={user_id}: {update_data}")

    profile = get_profile(user_id, db, raise_if_missing=True)

    try:
        # Update only provided fields
        for field, value in update_data.items():
            if hasattr(profile, field):
                setattr(profile, field, value)
            else:
                logger.warning(f"Ignoring unknown field: {field}")

        # Update timestamp
        profile.last_updated = datetime.utcnow()

        db.commit()
        db.refresh(profile)

        logger.info(f"Profile fields updated for user_id={user_id}")
        return profile

    except Exception as e:
        logger.error(f"Error updating profile fields for user_id={user_id}: {str(e)}")
        db.rollback()
        raise


def delete_profile(
    user_id: int,
    db: Session
) -> bool:
    """
    Delete user profile.

    Args:
        user_id: ID of the user
        db: SQLAlchemy database session

    Returns:
        bool: True if profile was deleted, False if it didn't exist

    Example:
        >>> deleted = delete_profile(user_id=1, db=db)
        >>> print(f"Profile deleted: {deleted}")
    """
    logger.info(f"Deleting profile for user_id={user_id}")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile:
        logger.warning(f"Profile not found for deletion: user_id={user_id}")
        return False

    try:
        db.delete(profile)
        db.commit()
        logger.info(f"Profile deleted for user_id={user_id}")
        return True

    except Exception as e:
        logger.error(f"Error deleting profile for user_id={user_id}: {str(e)}")
        db.rollback()
        raise


def get_or_create_profile(
    user_id: int,
    db: Session
) -> UserProfile:
    """
    Get existing profile or create one if it doesn't exist.

    This is a convenience function that ensures a profile always exists.

    Args:
        user_id: ID of the user
        db: SQLAlchemy database session

    Returns:
        UserProfile: Existing or newly created profile

    Example:
        >>> profile = get_or_create_profile(user_id=1, db=db)
        >>> # Profile is guaranteed to exist now
    """
    profile = get_profile(user_id, db, raise_if_missing=False)

    if not profile:
        logger.info(f"Profile doesn't exist for user_id={user_id}, creating new one")
        profile = create_user_profile(user_id, db)

    return profile


def get_topic_progress(
    user_id: int,
    topic: str,
    db: Session
) -> Optional[float]:
    """
    Get current mastery level for a specific topic.

    Args:
        user_id: ID of the user
        topic: Topic name
        db: SQLAlchemy database session

    Returns:
        float or None: Mastery level (0.0-1.0) or None if not found

    Example:
        >>> mastery = get_topic_progress(user_id=1, topic="algebra", db=db)
        >>> if mastery:
        ...     print(f"Algebra mastery: {mastery:.0%}")
    """
    profile = get_profile(user_id, db, raise_if_missing=False)

    if not profile or not profile.topic_mastery:
        return None

    return profile.topic_mastery.get(topic)


def get_all_topic_progress(
    user_id: int,
    db: Session
) -> Dict[str, float]:
    """
    Get mastery levels for all topics.

    Args:
        user_id: ID of the user
        db: SQLAlchemy database session

    Returns:
        dict: Dictionary mapping topic names to mastery levels

    Example:
        >>> progress = get_all_topic_progress(user_id=1, db=db)
        >>> print(progress)
        {'algebra': 0.75, 'calculus': 0.60, 'geometry': 0.82}
    """
    profile = get_profile(user_id, db, raise_if_missing=False)

    if not profile or not profile.topic_mastery:
        return {}

    return profile.topic_mastery


def check_profile_exists(
    user_id: int,
    db: Session
) -> bool:
    """
    Check if user profile exists.

    Args:
        user_id: ID of the user
        db: SQLAlchemy database session

    Returns:
        bool: True if profile exists, False otherwise

    Example:
        >>> if check_profile_exists(user_id=1, db=db):
        ...     print("Profile exists")
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    return profile is not None
