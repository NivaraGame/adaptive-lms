from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.metric import Metric
from app.schemas.metric import MetricCreate, MetricResponse

router = APIRouter()


@router.post("/", response_model=MetricResponse, status_code=status.HTTP_201_CREATED)
def create_metric(metric: MetricCreate, db: Session = Depends(get_db)):
    """
    Create a new metric
    """
    # Validate user exists
    from app.models.user import User
    user = db.query(User).filter(User.user_id == metric.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {metric.user_id} not found"
        )

    # Validate dialog exists if provided
    if metric.dialog_id:
        from app.models.dialog import Dialog
        dialog = db.query(Dialog).filter(Dialog.dialog_id == metric.dialog_id).first()
        if not dialog:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dialog with id {metric.dialog_id} not found"
            )

    # Validate message exists if provided
    if metric.message_id:
        from app.models.message import Message
        message = db.query(Message).filter(Message.message_id == metric.message_id).first()
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Message with id {metric.message_id} not found"
            )

    db_metric = Metric(
        user_id=metric.user_id,
        dialog_id=metric.dialog_id,
        message_id=metric.message_id,
        metric_name=metric.metric_name,
        metric_value_f=metric.metric_value_f,
        metric_value_s=metric.metric_value_s,
        metric_value_j=metric.metric_value_j,
        context=metric.context
    )

    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)

    return db_metric


@router.get("/user/{user_id}", response_model=List[MetricResponse])
def get_user_metrics(
    user_id: int,
    metric_name: Optional[str] = None,
    dialog_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get metrics for a user with optional filters
    """
    query = db.query(Metric).filter(Metric.user_id == user_id)

    if metric_name:
        query = query.filter(Metric.metric_name == metric_name)

    if dialog_id:
        query = query.filter(Metric.dialog_id == dialog_id)

    metrics = query.order_by(Metric.timestamp.desc()).limit(limit).all()
    return metrics


@router.get("/dialog/{dialog_id}", response_model=List[MetricResponse])
def get_dialog_metrics(
    dialog_id: int,
    metric_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all metrics for a specific dialog
    """
    query = db.query(Metric).filter(Metric.dialog_id == dialog_id)

    if metric_name:
        query = query.filter(Metric.metric_name == metric_name)

    metrics = query.order_by(Metric.timestamp.desc()).all()
    return metrics


@router.get("/{metric_id}", response_model=MetricResponse)
def get_metric(metric_id: int, db: Session = Depends(get_db)):
    """
    Get specific metric by ID
    """
    metric = db.query(Metric).filter(Metric.metric_id == metric_id).first()

    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metric not found"
        )

    return metric
