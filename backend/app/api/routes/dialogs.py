from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import logging

from app.db.session import get_db
from app.models.dialog import Dialog
from app.models.message import Message
from app.schemas.dialog import DialogCreate, DialogResponse
from app.schemas.message import MessageCreate, MessageResponse
from app.core.metrics import process_message_metrics, create_user_profile_if_missing

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=DialogResponse, status_code=status.HTTP_201_CREATED)
def create_dialog(dialog: DialogCreate, db: Session = Depends(get_db)):
    """
    Start a new dialog/learning session
    """
    # Validate user exists
    from app.models.user import User
    user = db.query(User).filter(User.user_id == dialog.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {dialog.user_id} not found"
        )

    db_dialog = Dialog(
        user_id=dialog.user_id,
        dialog_type=dialog.dialog_type,
        topic=dialog.topic
    )

    db.add(db_dialog)
    db.commit()
    db.refresh(db_dialog)

    return db_dialog


@router.get("/{dialog_id}", response_model=DialogResponse)
def get_dialog(dialog_id: int, db: Session = Depends(get_db)):
    """
    Get dialog by ID
    """
    dialog = db.query(Dialog).filter(Dialog.dialog_id == dialog_id).first()

    if not dialog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dialog not found"
        )

    return dialog


@router.get("/user/{user_id}", response_model=List[DialogResponse])
def list_user_dialogs(user_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """
    List all dialogs for a user
    """
    dialogs = db.query(Dialog).filter(Dialog.user_id == user_id).offset(skip).limit(limit).all()
    return dialogs


@router.post("/{dialog_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_dialog_message(dialog_id: int, message: MessageCreate, db: Session = Depends(get_db)):
    """
    Create a new message in a specific dialog (nested route).

    This is an alternative endpoint to POST /api/v1/messages that follows
    a nested RESTful structure. Both endpoints provide the same functionality.

    After message creation, triggers the metrics computation workflow
    to compute and store metrics, then update the user profile.
    """
    # Validate dialog exists
    dialog = db.query(Dialog).filter(Dialog.dialog_id == dialog_id).first()
    if not dialog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dialog with id {dialog_id} not found"
        )

    # Ensure the message's dialog_id matches the path parameter
    if message.dialog_id != dialog_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Message dialog_id ({message.dialog_id}) does not match URL path dialog_id ({dialog_id})"
        )

    # Create message
    db_message = Message(
        dialog_id=message.dialog_id,
        sender_type=message.sender_type,
        content=message.content,
        is_question=message.is_question,
        extra_data=message.extra_data
    )

    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    # Trigger metrics computation workflow (only for user messages)
    if message.sender_type == "user":
        try:
            logger.info(f"Triggering metrics workflow for message_id={db_message.message_id}")

            # Ensure user profile exists before processing metrics
            create_user_profile_if_missing(dialog.user_id, db)

            # Process metrics
            process_message_metrics(db_message.message_id, db)

            logger.info(f"Metrics workflow completed for message_id={db_message.message_id}")

        except Exception as e:
            # Log the error but don't fail the message creation
            logger.error(f"Error in metrics workflow for message_id={db_message.message_id}: {str(e)}")

    return db_message


@router.patch("/{dialog_id}/end", response_model=DialogResponse)
def end_dialog(dialog_id: int, db: Session = Depends(get_db)):
    """
    End a dialog session
    """
    dialog = db.query(Dialog).filter(Dialog.dialog_id == dialog_id).first()

    if not dialog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dialog not found"
        )

    dialog.ended_at = datetime.utcnow()
    db.commit()
    db.refresh(dialog)

    return dialog
