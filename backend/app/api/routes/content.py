from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import math

from app.db.session import get_db
from app.models.content import ContentItem
from app.schemas.content import (
    ContentItemCreate, ContentItemResponse, ContentItemUpdate,
    ContentListResponse, PaginationMetadata
)
from app.services.content_service import (
    get_content_by_filters,
    get_random_content,
    get_next_in_sequence,
    get_content_by_id,
    get_topics_list,
    ContentNotFoundError,
    InvalidFilterError
)

router = APIRouter()


@router.post("/", response_model=ContentItemResponse, status_code=status.HTTP_201_CREATED)
def create_content(content: ContentItemCreate, db: Session = Depends(get_db)):
    """
    Create a new content item
    """
    db_content = ContentItem(
        title=content.title,
        topic=content.topic,
        subtopic=content.subtopic,
        difficulty_level=content.difficulty_level,
        format=content.format,
        content_type=content.content_type,
        content_data=content.content_data,
        reference_answer=content.reference_answer,
        hints=content.hints,
        explanations=content.explanations,
        skills=content.skills,
        prerequisites=content.prerequisites,
        extra_data=content.extra_data
    )

    db.add(db_content)
    db.commit()
    db.refresh(db_content)

    return db_content


@router.get("/", response_model=ContentListResponse)
def list_content(
    topic: Optional[str] = Query(None, description="Filter by topic"),
    subtopic: Optional[str] = Query(None, description="Filter by subtopic"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level (easy/normal/hard/challenge)"),
    format: Optional[str] = Query(None, description="Filter by format (text/visual/video/interactive)"),
    content_type: Optional[str] = Query(None, description="Filter by content type (lesson/exercise/quiz/explanation)"),
    skills: Optional[List[str]] = Query(None, description="Filter by skills (content must have at least one)"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    db: Session = Depends(get_db)
):
    """
    List content items with optional filters and pagination.

    Returns a paginated list of content items with metadata about the pagination state.

    Query parameters:
    - topic: Filter by topic (exact match)
    - subtopic: Filter by subtopic (exact match)
    - difficulty: Filter by difficulty level (easy/normal/hard/challenge)
    - format: Filter by format (text/visual/video/interactive)
    - content_type: Filter by type (lesson/exercise/quiz/explanation)
    - skills: Filter by skills (can specify multiple, content must have at least one)
    - limit: Maximum number of items per page (default: 10, max: 100)
    - offset: Number of items to skip for pagination (default: 0)

    Example:
    - GET /api/v1/content?topic=algebra&difficulty=easy&limit=5
    - GET /api/v1/content?format=video&limit=20&offset=20
    """
    try:
        content_items, total_count = get_content_by_filters(
            db=db,
            topic=topic,
            subtopic=subtopic,
            difficulty=difficulty,
            format=format,
            content_type=content_type,
            skills=skills,
            limit=limit,
            offset=offset
        )

        # Calculate pagination metadata
        total_pages = math.ceil(total_count / limit) if limit > 0 else 0
        current_page = (offset // limit) + 1 if limit > 0 else 1
        has_next = offset + limit < total_count
        has_prev = offset > 0

        pagination = PaginationMetadata(
            total=total_count,
            limit=limit,
            offset=offset,
            total_pages=total_pages,
            current_page=current_page,
            has_next=has_next,
            has_prev=has_prev
        )

        return ContentListResponse(
            items=content_items,
            pagination=pagination
        )

    except InvalidFilterError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@router.get("/random", response_model=ContentItemResponse)
def get_random_content_endpoint(
    topic: Optional[str] = Query(None, description="Filter by topic"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    format: Optional[str] = Query(None, description="Filter by format"),
    content_type: Optional[str] = Query(None, description="Filter by content type"),
    db: Session = Depends(get_db)
):
    """
    Get a random content item, optionally filtered.

    This endpoint is useful for cold start scenarios where the system
    doesn't have enough information about the user to make recommendations.

    Query parameters:
    - topic: Optional filter by topic
    - difficulty: Optional filter by difficulty level
    - format: Optional filter by format
    - content_type: Optional filter by content type

    Example:
    - GET /api/v1/content/random
    - GET /api/v1/content/random?topic=algebra&difficulty=easy
    """
    try:
        content = get_random_content(
            db=db,
            topic=topic,
            difficulty=difficulty,
            format=format,
            content_type=content_type
        )

        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No content found matching the specified filters"
            )

        return content

    except InvalidFilterError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@router.get("/topics", response_model=List[str])
def list_topics(db: Session = Depends(get_db)):
    """
    Get list of all unique topics in the content database.

    Returns a sorted list of topic names that can be used for filtering.

    Example:
    - GET /api/v1/content/topics
    """
    topics = get_topics_list(db=db)
    return topics


@router.get("/{content_id}", response_model=ContentItemResponse)
def get_content_endpoint(content_id: int, db: Session = Depends(get_db)):
    """
    Get a specific content item by ID.

    Path parameters:
    - content_id: ID of the content item to retrieve

    Example:
    - GET /api/v1/content/42
    """
    try:
        content = get_content_by_id(content_id=content_id, db=db, raise_if_missing=True)
        return content

    except ContentNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/{content_id}/next", response_model=ContentItemResponse)
def get_next_content_endpoint(
    content_id: int,
    user_id: int = Query(..., description="ID of the user"),
    db: Session = Depends(get_db)
):
    """
    Get the next content item in a learning sequence.

    This endpoint determines the next content based on:
    - Explicit next_id in content metadata
    - Sequence numbers in content metadata
    - Difficulty progression (easy -> normal -> hard -> challenge)
    - Skills and prerequisites relationships

    Path parameters:
    - content_id: ID of the current content item

    Query parameters:
    - user_id: ID of the user (for personalization)

    Returns:
    - The next content item in the sequence
    - 404 if current content doesn't exist
    - 204 if no next content (end of sequence)

    Example:
    - GET /api/v1/content/42/next?user_id=1
    """
    try:
        next_content = get_next_in_sequence(
            user_id=user_id,
            current_content_id=content_id,
            db=db
        )

        if not next_content:
            # No next content - end of sequence
            raise HTTPException(
                status_code=status.HTTP_204_NO_CONTENT,
                detail="End of sequence - no next content available"
            )

        return next_content

    except ContentNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.patch("/{content_id}", response_model=ContentItemResponse)
def update_content(content_id: int, content_update: ContentItemUpdate, db: Session = Depends(get_db)):
    """
    Update a content item
    """
    content = db.query(ContentItem).filter(ContentItem.content_id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    # Update only provided fields
    update_data = content_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)

    return content


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(content_id: int, db: Session = Depends(get_db)):
    """
    Delete a content item
    """
    content = db.query(ContentItem).filter(ContentItem.content_id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    db.delete(content)
    db.commit()

    return None
