from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.content import ContentItem
from app.schemas.content import ContentItemCreate, ContentItemResponse, ContentItemUpdate

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


@router.get("/", response_model=List[ContentItemResponse])
def list_content(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    format: Optional[str] = None,
    content_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    List content items with optional filters
    """
    query = db.query(ContentItem)

    if topic:
        query = query.filter(ContentItem.topic == topic)
    if difficulty:
        query = query.filter(ContentItem.difficulty_level == difficulty)
    if format:
        query = query.filter(ContentItem.format == format)
    if content_type:
        query = query.filter(ContentItem.content_type == content_type)

    content_items = query.offset(skip).limit(limit).all()
    return content_items


@router.get("/{content_id}", response_model=ContentItemResponse)
def get_content(content_id: int, db: Session = Depends(get_db)):
    """
    Get specific content item
    """
    content = db.query(ContentItem).filter(ContentItem.content_id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    return content


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
