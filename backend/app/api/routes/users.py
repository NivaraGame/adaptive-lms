from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from passlib.context import CryptContext
from app.core.metrics import create_user_profile_if_missing

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user.

    Automatically creates a user profile after user registration.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )

    # Hash password
    hashed_password = pwd_context.hash(user.password[:72])

    # Create user
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Auto-create user profile
    try:
        logger.info(f"Creating user profile for new user_id={db_user.user_id}")
        create_user_profile_if_missing(db_user.user_id, db)
        logger.info(f"User profile created successfully for user_id={db_user.user_id}")
    except Exception as e:
        logger.error(f"Error creating user profile for user_id={db_user.user_id}: {str(e)}")
        # Don't fail user creation if profile creation fails
        # Profile will be created later when first message is sent

    return db_user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get user by ID
    """
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.get("/", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List all users
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users
