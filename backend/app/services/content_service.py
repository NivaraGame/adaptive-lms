"""
Content Service Module

This module provides business logic for content management and retrieval:
- Filtering content by topic, difficulty, format, and content_type
- Pagination support for content listings
- Random content selection for cold start scenarios
- Sequential content navigation for learning paths
- Helper functions for content filtering and validation

This service layer separates business logic from API routes,
making the code more maintainable and testable.
"""

import logging
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, Integer, cast

from app.models.content import ContentItem

logger = logging.getLogger(__name__)


class ContentNotFoundError(Exception):
    """Exception raised when content is not found"""
    pass


class InvalidFilterError(Exception):
    """Exception raised when invalid filter values are provided"""
    pass


def validate_filter_values(
    difficulty: Optional[str] = None,
    format: Optional[str] = None,
    content_type: Optional[str] = None
) -> None:
    """
    Validate filter values against allowed values.

    Args:
        difficulty: Difficulty level to validate
        format: Format to validate
        content_type: Content type to validate

    Raises:
        InvalidFilterError: If any filter value is invalid

    Example:
        >>> validate_filter_values(difficulty="easy", format="text")
        # No exception - values are valid

        >>> validate_filter_values(difficulty="invalid")
        # Raises InvalidFilterError
    """
    allowed_difficulties = ['easy', 'normal', 'hard', 'challenge']
    allowed_formats = ['text', 'visual', 'video', 'interactive']
    allowed_types = ['lesson', 'exercise', 'quiz', 'explanation']

    if difficulty and difficulty not in allowed_difficulties:
        raise InvalidFilterError(
            f"Invalid difficulty '{difficulty}'. Must be one of: {', '.join(allowed_difficulties)}"
        )

    if format and format not in allowed_formats:
        raise InvalidFilterError(
            f"Invalid format '{format}'. Must be one of: {', '.join(allowed_formats)}"
        )

    if content_type and content_type not in allowed_types:
        raise InvalidFilterError(
            f"Invalid content_type '{content_type}'. Must be one of: {', '.join(allowed_types)}"
        )


def get_content_by_filters(
    db: Session,
    topic: Optional[str] = None,
    subtopic: Optional[str] = None,
    difficulty: Optional[str] = None,
    format: Optional[str] = None,
    content_type: Optional[str] = None,
    skills: Optional[List[str]] = None,
    limit: int = 10,
    offset: int = 0
) -> Tuple[List[ContentItem], int]:
    """
    Get content items with optional filters and pagination.

    This function builds a dynamic SQL query based on the provided filters.
    It supports filtering by topic, difficulty, format, content_type, and skills.
    Returns both the content items and the total count for pagination.

    Args:
        db: SQLAlchemy database session
        topic: Filter by topic (exact match)
        subtopic: Filter by subtopic (exact match)
        difficulty: Filter by difficulty level (easy/normal/hard/challenge)
        format: Filter by format (text/visual/video/interactive)
        content_type: Filter by type (lesson/exercise/quiz/explanation)
        skills: Filter by skills (content must have at least one of these skills)
        limit: Maximum number of items to return (default: 10, max: 100)
        offset: Number of items to skip (default: 0)

    Returns:
        Tuple[List[ContentItem], int]: List of content items and total count

    Raises:
        InvalidFilterError: If any filter values are invalid

    Example:
        >>> # Get easy algebra content
        >>> items, total = get_content_by_filters(
        ...     db=db,
        ...     topic="algebra",
        ...     difficulty="easy",
        ...     limit=5
        ... )
        >>> print(f"Found {total} items, showing {len(items)}")
        Found 42 items, showing 5
    """
    logger.info(f"Filtering content: topic={topic}, difficulty={difficulty}, "
                f"format={format}, type={content_type}, limit={limit}, offset={offset}")

    # Validate filter values
    validate_filter_values(difficulty, format, content_type)

    # Limit the maximum items per page
    if limit > 100:
        logger.warning(f"Limit {limit} exceeds maximum, capping at 100")
        limit = 100

    # Build query
    query = db.query(ContentItem)

    # Apply filters
    if topic:
        query = query.filter(ContentItem.topic == topic)

    if subtopic:
        query = query.filter(ContentItem.subtopic == subtopic)

    if difficulty:
        query = query.filter(ContentItem.difficulty_level == difficulty)

    if format:
        query = query.filter(ContentItem.format == format)

    if content_type:
        query = query.filter(ContentItem.content_type == content_type)

    if skills:
        # Content must have at least one of the specified skills
        # Using JSONB contains operator for PostgreSQL
        skill_filters = [ContentItem.skills.contains([skill]) for skill in skills]
        query = query.filter(or_(*skill_filters))

    # Get total count before pagination
    total_count = query.count()

    # Apply pagination
    content_items = query.offset(offset).limit(limit).all()

    logger.info(f"Found {total_count} total items, returning {len(content_items)} items")

    return content_items, total_count


def get_random_content(
    db: Session,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    format: Optional[str] = None,
    content_type: Optional[str] = None
) -> Optional[ContentItem]:
    """
    Get a random content item, optionally filtered.

    This function is useful for cold start scenarios where the system
    doesn't have enough information about the user to make recommendations.
    Uses PostgreSQL's RANDOM() function for efficient random selection.

    Args:
        db: SQLAlchemy database session
        topic: Optional filter by topic
        difficulty: Optional filter by difficulty level
        format: Optional filter by format
        content_type: Optional filter by content type

    Returns:
        ContentItem or None: Random content item, or None if no matches

    Raises:
        InvalidFilterError: If any filter values are invalid

    Example:
        >>> # Get any random content
        >>> content = get_random_content(db=db)

        >>> # Get random easy algebra exercise
        >>> content = get_random_content(
        ...     db=db,
        ...     topic="algebra",
        ...     difficulty="easy",
        ...     content_type="exercise"
        ... )
    """
    logger.info(f"Getting random content: topic={topic}, difficulty={difficulty}, "
                f"format={format}, type={content_type}")

    # Validate filter values
    validate_filter_values(difficulty, format, content_type)

    # Build query
    query = db.query(ContentItem)

    # Apply filters
    if topic:
        query = query.filter(ContentItem.topic == topic)

    if difficulty:
        query = query.filter(ContentItem.difficulty_level == difficulty)

    if format:
        query = query.filter(ContentItem.format == format)

    if content_type:
        query = query.filter(ContentItem.content_type == content_type)

    # Get random item using PostgreSQL's RANDOM()
    content_item = query.order_by(func.random()).limit(1).first()

    if content_item:
        logger.info(f"Selected random content: content_id={content_item.content_id}, "
                   f"title='{content_item.title}'")
    else:
        logger.warning("No content found matching the specified filters")

    return content_item


def get_next_in_sequence(
    user_id: int,
    current_content_id: int,
    db: Session
) -> Optional[ContentItem]:
    """
    Get the next content item in a learning sequence.

    This function determines the next content item based on:
    1. Same topic as current content
    2. Skills/prerequisites relationships
    3. Difficulty progression

    The logic follows this priority:
    - If current content has a 'next_id' in extra_data, use that
    - Otherwise, find content with same topic and next difficulty level
    - If at highest difficulty, find next topic in curriculum

    Args:
        user_id: ID of the user (for personalization in future)
        current_content_id: ID of the current content item
        db: SQLAlchemy database session

    Returns:
        ContentItem or None: Next content item, or None if end of sequence

    Raises:
        ContentNotFoundError: If current_content_id doesn't exist

    Example:
        >>> # Get next content after algebra exercise 1
        >>> next_content = get_next_in_sequence(
        ...     user_id=1,
        ...     current_content_id=42,
        ...     db=db
        ... )
        >>> if next_content:
        ...     print(f"Next: {next_content.title}")
        ... else:
        ...     print("End of sequence")
    """
    logger.info(f"Getting next content in sequence: user_id={user_id}, "
                f"current_content_id={current_content_id}")

    # Get current content
    current_content = db.query(ContentItem).filter(
        ContentItem.content_id == current_content_id
    ).first()

    if not current_content:
        raise ContentNotFoundError(f"Content with id {current_content_id} not found")

    # Strategy 1: Check if there's an explicit next_id in extra_data
    if current_content.extra_data and 'next_id' in current_content.extra_data:
        next_id = current_content.extra_data['next_id']
        next_content = db.query(ContentItem).filter(
            ContentItem.content_id == next_id
        ).first()

        if next_content:
            logger.info(f"Found next content via explicit next_id: {next_content.content_id}")
            return next_content

    # Strategy 2: Check if there's a sequence_number in extra_data
    if current_content.extra_data and 'sequence_number' in current_content.extra_data:
        current_seq = current_content.extra_data['sequence_number']
        next_content = db.query(ContentItem).filter(
            ContentItem.topic == current_content.topic,
            cast(ContentItem.extra_data['sequence_number'].astext, Integer) == current_seq + 1
        ).first()

        if next_content:
            logger.info(f"Found next content via sequence_number: {next_content.content_id}")
            return next_content

    # Strategy 3: Find content in same topic with next difficulty level
    difficulty_progression = {
        'easy': 'normal',
        'normal': 'hard',
        'hard': 'challenge',
        'challenge': None  # No next difficulty
    }

    next_difficulty = difficulty_progression.get(current_content.difficulty_level)

    if next_difficulty:
        # Look for content with same topic and next difficulty
        next_content = db.query(ContentItem).filter(
            ContentItem.topic == current_content.topic,
            ContentItem.difficulty_level == next_difficulty,
            ContentItem.content_type == current_content.content_type
        ).first()

        if next_content:
            logger.info(f"Found next content via difficulty progression: {next_content.content_id}")
            return next_content

    # Strategy 4: Find content that requires current content's skills as prerequisites
    if current_content.skills:
        # Find content where prerequisites match current skills
        for skill in current_content.skills:
            next_content = db.query(ContentItem).filter(
                ContentItem.content_id != current_content_id,
                ContentItem.prerequisites.contains([skill])
            ).first()

            if next_content:
                logger.info(f"Found next content via skill prerequisites: {next_content.content_id}")
                return next_content

    # No next content found
    logger.info("No next content found - end of sequence")
    return None


def get_content_by_id(
    content_id: int,
    db: Session,
    raise_if_missing: bool = True
) -> Optional[ContentItem]:
    """
    Get a single content item by ID.

    Args:
        content_id: ID of the content item
        db: SQLAlchemy database session
        raise_if_missing: If True, raise exception when not found

    Returns:
        ContentItem or None: The content item

    Raises:
        ContentNotFoundError: If content not found and raise_if_missing=True

    Example:
        >>> content = get_content_by_id(content_id=1, db=db)
        >>> print(content.title)
    """
    logger.debug(f"Getting content by id: {content_id}")

    content = db.query(ContentItem).filter(
        ContentItem.content_id == content_id
    ).first()

    if not content and raise_if_missing:
        raise ContentNotFoundError(f"Content with id {content_id} not found")

    return content


def get_content_by_topic_and_skills(
    db: Session,
    topic: str,
    required_skills: Optional[List[str]] = None,
    difficulty: Optional[str] = None
) -> List[ContentItem]:
    """
    Get content items by topic and skills.

    This is useful for finding related content or building learning paths.

    Args:
        db: SQLAlchemy database session
        topic: Topic to filter by
        required_skills: Skills that content should teach (optional)
        difficulty: Optional difficulty filter

    Returns:
        List[ContentItem]: Matching content items

    Example:
        >>> # Find algebra content that teaches linear equations
        >>> content = get_content_by_topic_and_skills(
        ...     db=db,
        ...     topic="algebra",
        ...     required_skills=["linear_equations"],
        ...     difficulty="normal"
        ... )
    """
    logger.info(f"Getting content by topic and skills: topic={topic}, "
                f"skills={required_skills}, difficulty={difficulty}")

    query = db.query(ContentItem).filter(ContentItem.topic == topic)

    if difficulty:
        validate_filter_values(difficulty=difficulty)
        query = query.filter(ContentItem.difficulty_level == difficulty)

    if required_skills:
        # Content must have at least one of the required skills
        skill_filters = [ContentItem.skills.contains([skill]) for skill in required_skills]
        query = query.filter(or_(*skill_filters))

    content_items = query.all()

    logger.info(f"Found {len(content_items)} items for topic={topic}")

    return content_items


def count_content_by_filters(
    db: Session,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    format: Optional[str] = None,
    content_type: Optional[str] = None
) -> int:
    """
    Count content items matching filters without retrieving them.

    Useful for pagination metadata and analytics.

    Args:
        db: SQLAlchemy database session
        topic: Optional topic filter
        difficulty: Optional difficulty filter
        format: Optional format filter
        content_type: Optional content type filter

    Returns:
        int: Count of matching items

    Example:
        >>> count = count_content_by_filters(db=db, topic="algebra", difficulty="easy")
        >>> print(f"There are {count} easy algebra items")
    """
    logger.debug(f"Counting content: topic={topic}, difficulty={difficulty}, "
                 f"format={format}, type={content_type}")

    # Validate filter values
    validate_filter_values(difficulty, format, content_type)

    query = db.query(ContentItem)

    if topic:
        query = query.filter(ContentItem.topic == topic)

    if difficulty:
        query = query.filter(ContentItem.difficulty_level == difficulty)

    if format:
        query = query.filter(ContentItem.format == format)

    if content_type:
        query = query.filter(ContentItem.content_type == content_type)

    count = query.count()

    logger.debug(f"Count result: {count}")

    return count


def get_topics_list(db: Session) -> List[str]:
    """
    Get list of all unique topics in the content database.

    Args:
        db: SQLAlchemy database session

    Returns:
        List[str]: List of unique topic names

    Example:
        >>> topics = get_topics_list(db=db)
        >>> print(topics)
        ['algebra', 'calculus', 'geometry', 'trigonometry']
    """
    logger.debug("Getting list of all topics")

    topics = db.query(ContentItem.topic).distinct().order_by(ContentItem.topic).all()

    # Extract topic strings from result tuples
    topic_list = [topic[0] for topic in topics]

    logger.debug(f"Found {len(topic_list)} unique topics")

    return topic_list
