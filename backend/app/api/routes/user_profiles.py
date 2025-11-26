from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.schemas.user_profile import UserProfileCreate, UserProfileResponse, UserProfileUpdate
from app.services import user_service

router = APIRouter()


@router.post("/", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
def create_user_profile_endpoint(profile: UserProfileCreate, db: Session = Depends(get_db)):
    """
    Create a new user profile with custom initial values.

    Note: User profiles are automatically created on user registration with defaults.
    This endpoint is for creating profiles with custom initial values or recreating deleted profiles.
    """
    try:
        # Convert Pydantic model to dict for initial_data
        initial_data = profile.model_dump(exclude={'user_id'})

        db_profile = user_service.create_user_profile(
            user_id=profile.user_id,
            db=db,
            initial_data=initial_data
        )
        return db_profile

    except user_service.UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/user/{user_id}", response_model=UserProfileResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Get user profile by user ID.

    Returns the user's learning profile including topic mastery, preferences, and statistics.
    """
    try:
        profile = user_service.get_profile(user_id, db, raise_if_missing=True)
        return profile

    except user_service.UserProfileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/{profile_id}", response_model=UserProfileResponse)
def get_profile_by_id(profile_id: int, db: Session = Depends(get_db)):
    """
    Get user profile by profile ID (alternative to getting by user_id).
    """
    try:
        profile = user_service.get_profile_by_id(profile_id, db, raise_if_missing=True)
        return profile

    except user_service.UserProfileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.patch("/user/{user_id}", response_model=UserProfileResponse)
def update_user_profile(user_id: int, profile_update: UserProfileUpdate, db: Session = Depends(get_db)):
    """
    Update user profile fields directly (not metrics-based).

    Use this endpoint to update profile preferences like:
    - preferred_format (text/visual/video/interactive)
    - learning_pace (slow/medium/fast)
    - current_difficulty (easy/normal/hard/challenge)

    Note: Metrics like topic_mastery and avg_response_time are updated automatically
    through the metrics workflow, not through this endpoint.
    """
    try:
        # Get only the fields that were actually set in the request
        update_data = profile_update.model_dump(exclude_unset=True)

        profile = user_service.update_profile_fields(
            user_id=user_id,
            update_data=update_data,
            db=db
        )
        return profile

    except user_service.UserProfileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete("/user/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Delete user profile.

    Warning: This will permanently delete all learning progress for the user.
    The profile will be recreated automatically on the user's next interaction.
    """
    deleted = user_service.delete_profile(user_id, db)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user {user_id}"
        )

    return None
