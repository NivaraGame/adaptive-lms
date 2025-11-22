from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, Dict, Any


class DialogBase(BaseModel):
    """Base dialog schema"""
    dialog_type: str  # educational, test, assessment, reflective
    topic: Optional[str] = None

    @field_validator('dialog_type')
    @classmethod
    def dialog_type_valid(cls, v):
        allowed_types = ['educational', 'test', 'assessment', 'reflective']
        if not v or not v.strip():
            raise ValueError('Dialog type cannot be empty')
        if v not in allowed_types:
            raise ValueError(f'Dialog type must be one of: {", ".join(allowed_types)}')
        return v


class DialogCreate(DialogBase):
    """Schema for creating a dialog"""
    user_id: int


class DialogResponse(DialogBase):
    """Schema for dialog response"""
    dialog_id: int
    user_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    extra_data: Dict[str, Any] = {}

    class Config:
        from_attributes = True
