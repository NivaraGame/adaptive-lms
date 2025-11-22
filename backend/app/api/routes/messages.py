from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageResponse

router = APIRouter()


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    """
    Create a new message in a dialog
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
        is_question=message.is_question
    )

    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    return db_message


@router.get("/dialog/{dialog_id}", response_model=List[MessageResponse])
def list_dialog_messages(dialog_id: int, db: Session = Depends(get_db)):
    """
    Get all messages in a dialog
    """
    messages = db.query(Message).filter(Message.dialog_id == dialog_id).order_by(Message.timestamp).all()
    return messages
