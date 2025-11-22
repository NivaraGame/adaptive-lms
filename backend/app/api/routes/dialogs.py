from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.models.dialog import Dialog
from app.schemas.dialog import DialogCreate, DialogResponse

router = APIRouter()


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
