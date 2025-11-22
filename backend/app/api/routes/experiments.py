from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.models.experiment import Experiment
from app.models.user import User
from app.schemas.experiment import ExperimentCreate, ExperimentResponse, ExperimentUpdate

router = APIRouter()


@router.post("/", response_model=ExperimentResponse, status_code=status.HTTP_201_CREATED)
def create_experiment(experiment: ExperimentCreate, db: Session = Depends(get_db)):
    """
    Start a new experiment for a user
    """
    # Validate user exists
    user = db.query(User).filter(User.user_id == experiment.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {experiment.user_id} not found"
        )

    db_experiment = Experiment(
        user_id=experiment.user_id,
        experiment_name=experiment.experiment_name,
        variant_name=experiment.variant_name,
        extra_data=experiment.extra_data
    )

    db.add(db_experiment)
    db.commit()
    db.refresh(db_experiment)

    return db_experiment


@router.get("/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(experiment_id: int, db: Session = Depends(get_db)):
    """
    Get experiment by ID
    """
    experiment = db.query(Experiment).filter(Experiment.experiment_id == experiment_id).first()

    if not experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )

    return experiment


@router.get("/user/{user_id}", response_model=List[ExperimentResponse])
def list_user_experiments(
    user_id: int,
    experiment_name: Optional[str] = None,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    List all experiments for a user
    """
    query = db.query(Experiment).filter(Experiment.user_id == user_id)

    if experiment_name:
        query = query.filter(Experiment.experiment_name == experiment_name)

    if active_only:
        query = query.filter(Experiment.ended_at == None)

    experiments = query.order_by(Experiment.started_at.desc()).all()
    return experiments


@router.get("/", response_model=List[ExperimentResponse])
def list_experiments(
    experiment_name: Optional[str] = None,
    variant_name: Optional[str] = None,
    active_only: bool = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List all experiments with optional filters
    """
    query = db.query(Experiment)

    if experiment_name:
        query = query.filter(Experiment.experiment_name == experiment_name)

    if variant_name:
        query = query.filter(Experiment.variant_name == variant_name)

    if active_only:
        query = query.filter(Experiment.ended_at == None)

    experiments = query.order_by(Experiment.started_at.desc()).offset(skip).limit(limit).all()
    return experiments


@router.patch("/{experiment_id}/end", response_model=ExperimentResponse)
def end_experiment(experiment_id: int, db: Session = Depends(get_db)):
    """
    End an experiment
    """
    experiment = db.query(Experiment).filter(Experiment.experiment_id == experiment_id).first()

    if not experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )

    if experiment.ended_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Experiment already ended"
        )

    experiment.ended_at = datetime.utcnow()
    db.commit()
    db.refresh(experiment)

    return experiment


@router.patch("/{experiment_id}", response_model=ExperimentResponse)
def update_experiment(experiment_id: int, experiment_update: ExperimentUpdate, db: Session = Depends(get_db)):
    """
    Update experiment extra data or end date
    """
    experiment = db.query(Experiment).filter(Experiment.experiment_id == experiment_id).first()

    if not experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )

    # Update only provided fields
    update_data = experiment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(experiment, field, value)

    db.commit()
    db.refresh(experiment)

    return experiment


@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experiment(experiment_id: int, db: Session = Depends(get_db)):
    """
    Delete an experiment
    """
    experiment = db.query(Experiment).filter(Experiment.experiment_id == experiment_id).first()

    if not experiment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )

    db.delete(experiment)
    db.commit()

    return None
