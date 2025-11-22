from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, Dict, Any


class MetricBase(BaseModel):
    """Base metric schema"""
    metric_name: str
    metric_value_f: Optional[float] = None
    metric_value_s: Optional[str] = None
    metric_value_j: Optional[Dict[str, Any]] = None
    context: Dict[str, Any] = {}

    @field_validator('metric_name')
    @classmethod
    def metric_name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Metric name cannot be empty')
        return v


class MetricCreate(MetricBase):
    """Schema for creating a metric"""
    user_id: int
    dialog_id: Optional[int] = None
    message_id: Optional[int] = None


class MetricResponse(MetricBase):
    """Schema for metric response"""
    metric_id: int
    user_id: int
    dialog_id: Optional[int] = None
    message_id: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True
