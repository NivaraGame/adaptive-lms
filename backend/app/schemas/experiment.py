from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, Dict, Any


class ExperimentBase(BaseModel):
    """Base experiment schema"""
    experiment_name: str
    variant_name: str
    extra_data: Dict[str, Any] = {}

    @field_validator('experiment_name', 'variant_name')
    @classmethod
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v


class ExperimentCreate(ExperimentBase):
    """Schema for creating an experiment"""
    user_id: int


class ExperimentUpdate(BaseModel):
    """Schema for updating an experiment (mainly for ending it)"""
    ended_at: Optional[datetime] = None
    extra_data: Optional[Dict[str, Any]] = None


class ExperimentResponse(ExperimentBase):
    """Schema for experiment response"""
    experiment_id: int
    user_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True
