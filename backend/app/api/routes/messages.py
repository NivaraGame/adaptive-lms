from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.db.session import get_db
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageResponse
from app.core.metrics import process_message_metrics, create_user_profile_if_missing

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    """
    Create a new message in a dialog.

    After message creation, triggers the metrics computation workflow
    to compute and store metrics, then update the user profile.
    """
    # Validate dialog exists
    from app.models.dialog import Dialog
    dialog = db.query(Dialog).filter(Dialog.dialog_id == message.dialog_id).first()
    if not dialog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dialog with id {message.dialog_id} not found"
        )

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

            # Process metrics asynchronously (in background)
            # Note: For now we run synchronously. In production, consider using
            # background tasks (FastAPI BackgroundTasks) or a task queue (Celery)
            process_message_metrics(db_message.message_id, db)

            logger.info(f"Metrics workflow completed for message_id={db_message.message_id}")

        except Exception as e:
            # Log the error but don't fail the message creation
            # Metrics processing should not block user interaction
            logger.error(f"Error in metrics workflow for message_id={db_message.message_id}: {str(e)}")
            # In production, you might want to queue this for retry

    return db_message


@router.get("/dialog/{dialog_id}", response_model=List[MessageResponse])
def list_dialog_messages(dialog_id: int, db: Session = Depends(get_db)):
    """
    Get all messages in a dialog
    """
    messages = db.query(Message).filter(Message.dialog_id == dialog_id).order_by(Message.timestamp).all()
    return messages
