"""
Metrics aggregation module.

This module aggregates individual metrics into long-term user profile statistics:
- Exponential Moving Average (EMA) for topic mastery
- Rolling averages for response time
- Aggregated statistics for user profiles

These aggregations are triggered after synchronous metrics are computed
and update the user_profile table.
"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime


def update_topic_mastery_ema(
    current_mastery: float,
    new_score: float,
    alpha: float = 0.3
) -> float:
    """
    Update topic mastery using Exponential Moving Average (EMA).

    EMA gives more weight to recent performance while maintaining history.
    Formula: mastery_new = alpha * current_score + (1 - alpha) * mastery_old

    Args:
        current_mastery: Current mastery value (0.0 to 1.0)
        new_score: New score from latest interaction (0.0 to 1.0)
        alpha: Learning rate / smoothing factor (default: 0.3)
            - Higher alpha = more weight to recent performance
            - Lower alpha = more weight to historical performance

    Returns:
        float: Updated mastery value (0.0 to 1.0)

    Example:
        >>> # Starting from 0.5 mastery, user gets correct answer (1.0)
        >>> update_topic_mastery_ema(0.5, 1.0, alpha=0.3)
        0.65
        >>> # Starting from 0.5 mastery, user gets incorrect answer (0.0)
        >>> update_topic_mastery_ema(0.5, 0.0, alpha=0.3)
        0.35
    """
    return alpha * new_score + (1 - alpha) * current_mastery


def update_topic_mastery(
    user_id: int,
    topic: str,
    score: float,
    db: Session,
    alpha: float = 0.3
) -> float:
    """
    Update a specific topic's mastery in the user profile using EMA.

    Args:
        user_id: User ID
        topic: Topic name (e.g., "algebra", "calculus")
        score: New score from latest interaction (0.0 to 1.0)
        db: SQLAlchemy database session
        alpha: EMA smoothing factor (default: 0.3)

    Returns:
        float: Updated mastery value

    Example:
        >>> # User answers algebra question correctly
        >>> new_mastery = update_topic_mastery(1, "algebra", 1.0, db)
        >>> print(f"New algebra mastery: {new_mastery}")
        New algebra mastery: 0.65
    """
    from app.models.user_profile import UserProfile

    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile:
        raise ValueError(f"User profile not found for user_id: {user_id}")

    # Get current topic mastery (default to 0.0 if topic is new)
    topic_mastery = profile.topic_mastery or {}
    current_mastery = topic_mastery.get(topic, 0.0)

    # Compute new mastery using EMA
    new_mastery = update_topic_mastery_ema(current_mastery, score, alpha)

    # Update topic mastery in JSONB field
    topic_mastery[topic] = round(new_mastery, 4)  # Round to 4 decimal places
    profile.topic_mastery = topic_mastery

    # Mark as modified for SQLAlchemy to detect JSONB change
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(profile, "topic_mastery")

    db.commit()
    db.refresh(profile)

    return new_mastery


def update_response_time_avg(
    current_avg: float,
    new_response_time: float,
    interaction_count: int,
    window_size: int = 10
) -> float:
    """
    Update average response time using rolling average.

    Uses a weighted rolling average to balance recent and historical performance.

    Args:
        current_avg: Current average response time (seconds)
        new_response_time: New response time from latest interaction (seconds)
        interaction_count: Total number of interactions so far
        window_size: Number of recent interactions to consider (default: 10)

    Returns:
        float: Updated average response time (seconds)

    Example:
        >>> # Current avg is 20s, new response is 30s, 5 total interactions
        >>> update_response_time_avg(20.0, 30.0, 5, window_size=10)
        22.0
    """
    if interaction_count == 0:
        return new_response_time

    # If we have fewer interactions than window size, use simple average
    if interaction_count < window_size:
        weight = 1.0 / (interaction_count + 1)
        return current_avg * (1 - weight) + new_response_time * weight

    # Otherwise, use rolling window average
    weight = 1.0 / window_size
    return current_avg * (1 - weight) + new_response_time * weight


def aggregate_metrics(
    user_id: int,
    metrics: Dict[str, Any],
    db: Session,
    alpha: float = 0.3,
    window_size: int = 10
) -> Dict[str, Any]:
    """
    Aggregate metrics and update user profile.

    This is the main aggregation function that processes computed metrics
    and updates the user profile with aggregated statistics.

    Args:
        user_id: User ID
        metrics: Dictionary of computed metrics from compute_synchronous_metrics()
        db: SQLAlchemy database session
        alpha: EMA smoothing factor for topic mastery (default: 0.3)
        window_size: Rolling window size for response time (default: 10)

    Returns:
        dict: Updated profile statistics
            {
                "topic_mastery": dict,
                "avg_response_time": float,
                "total_interactions": int,
            }

    Example:
        >>> metrics = {
        ...     "accuracy": 1.0,
        ...     "response_time": 25.0,
        ...     "content_id": 5,
        ...     "topic": "algebra"
        ... }
        >>> updated_profile = aggregate_metrics(1, metrics, db)
    """
    from app.models.user_profile import UserProfile
    from app.models.content import ContentItem

    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile:
        raise ValueError(f"User profile not found for user_id: {user_id}")

    # Get content to determine topic (if not already in metrics)
    topic = metrics.get("topic")
    if not topic and metrics.get("content_id"):
        content = db.query(ContentItem).filter(ContentItem.content_id == metrics["content_id"]).first()
        if content:
            topic = content.topic

    # Update topic mastery if we have accuracy and topic
    if topic and metrics.get("accuracy") is not None:
        update_topic_mastery(
            user_id=user_id,
            topic=topic,
            score=metrics["accuracy"],
            db=db,
            alpha=alpha
        )

    # Update average response time if available
    if metrics.get("response_time") is not None:
        current_avg = profile.avg_response_time or 0.0
        interaction_count = profile.total_interactions or 0

        new_avg = update_response_time_avg(
            current_avg=current_avg,
            new_response_time=metrics["response_time"],
            interaction_count=interaction_count,
            window_size=window_size
        )

        profile.avg_response_time = round(new_avg, 2)

    # Increment total interactions
    profile.total_interactions = (profile.total_interactions or 0) + 1

    # Update last interaction timestamp (UserProfile uses 'last_updated' not 'updated_at')
    profile.last_updated = datetime.utcnow()

    db.commit()
    db.refresh(profile)

    return {
        "topic_mastery": profile.topic_mastery,
        "avg_response_time": profile.avg_response_time,
        "total_interactions": profile.total_interactions,
    }


def get_topic_mastery(
    user_id: int,
    topic: str,
    db: Session
) -> Optional[float]:
    """
    Get current mastery level for a specific topic.

    Args:
        user_id: User ID
        topic: Topic name
        db: SQLAlchemy database session

    Returns:
        float or None: Mastery level (0.0 to 1.0) or None if topic not found

    Example:
        >>> mastery = get_topic_mastery(1, "algebra", db)
        >>> print(f"Algebra mastery: {mastery}")
        Algebra mastery: 0.75
    """
    from app.models.user_profile import UserProfile

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile or not profile.topic_mastery:
        return None

    return profile.topic_mastery.get(topic)


def get_weak_topics(
    user_id: int,
    db: Session,
    threshold: float = 0.5,
    limit: int = 3
) -> list:
    """
    Identify weak topics that need remediation.

    Args:
        user_id: User ID
        db: SQLAlchemy database session
        threshold: Mastery threshold below which a topic is considered weak
        limit: Maximum number of weak topics to return

    Returns:
        list: List of (topic, mastery) tuples sorted by mastery (weakest first)

    Example:
        >>> weak = get_weak_topics(1, db, threshold=0.5)
        >>> print(weak)
        [('calculus', 0.3), ('geometry', 0.45)]
    """
    from app.models.user_profile import UserProfile

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile or not profile.topic_mastery:
        return []

    # Filter topics below threshold and sort by mastery
    weak_topics = [
        (topic, mastery)
        for topic, mastery in profile.topic_mastery.items()
        if mastery < threshold
    ]

    # Sort by mastery (weakest first)
    weak_topics.sort(key=lambda x: x[1])

    return weak_topics[:limit]


def get_strong_topics(
    user_id: int,
    db: Session,
    threshold: float = 0.7,
    limit: int = 3
) -> list:
    """
    Identify strong topics that the user has mastered.

    Args:
        user_id: User ID
        db: SQLAlchemy database session
        threshold: Mastery threshold above which a topic is considered strong
        limit: Maximum number of strong topics to return

    Returns:
        list: List of (topic, mastery) tuples sorted by mastery (strongest first)

    Example:
        >>> strong = get_strong_topics(1, db, threshold=0.7)
        >>> print(strong)
        [('algebra', 0.85), ('trigonometry', 0.78)]
    """
    from app.models.user_profile import UserProfile

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile or not profile.topic_mastery:
        return []

    # Filter topics above threshold and sort by mastery
    strong_topics = [
        (topic, mastery)
        for topic, mastery in profile.topic_mastery.items()
        if mastery >= threshold
    ]

    # Sort by mastery (strongest first)
    strong_topics.sort(key=lambda x: x[1], reverse=True)

    return strong_topics[:limit]
