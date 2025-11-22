from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.models.user_profile import UserProfile
from app.models.user import User
from app.schemas.user_profile import UserProfileCreate, UserProfileResponse, UserProfileUpdate

router = APIRouter()


@router.post("/", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
def create_user_profile(profile: UserProfileCreate, db: Session = Depends(get_db)):
    """
    Create a new user profile
    """
    # Check if user exists
    user = db.query(User).filter(User.user_id == profile.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {profile.user_id} not found"
        )

    # Check if profile already exists for this user
    existing_profile = db.query(UserProfile).filter(UserProfile.user_id == profile.user_id).first()
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Profile already exists for user {profile.user_id}"
        )

    db_profile = UserProfile(
        user_id=profile.user_id,
        topic_mastery=profile.topic_mastery,
        preferred_format=profile.preferred_format,
        learning_pace=profile.learning_pace,
        error_patterns=profile.error_patterns,
        avg_response_time=profile.avg_response_time,
        avg_accuracy=profile.avg_accuracy,
        total_interactions=profile.total_interactions,
        total_time_spent=profile.total_time_spent,
        current_difficulty=profile.current_difficulty,
        extra_data=profile.extra_data
    )

    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    return db_profile


@router.get("/user/{user_id}", response_model=UserProfileResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Get user profile by user ID
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user {user_id}"
        )

    return profile


@router.get("/{profile_id}", response_model=UserProfileResponse)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    """
    Get user profile by profile ID
    """
    profile = db.query(UserProfile).filter(UserProfile.profile_id == profile_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return profile


@router.patch("/user/{user_id}", response_model=UserProfileResponse)
def update_user_profile(user_id: int, profile_update: UserProfileUpdate, db: Session = Depends(get_db)):
    """
    Update user profile
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user {user_id}"
        )

    # Update only provided fields
    update_data = profile_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.delete("/user/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Delete user profile
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user {user_id}"
        )

    db.delete(profile)
    db.commit()

    return None
