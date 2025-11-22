from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, Dict, Any


class MessageBase(BaseModel):
    """Base message schema"""
    content: str
    is_question: bool = False

    @field_validator('content')
    @classmethod
    def content_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Message content cannot be empty')
        return v


class MessageCreate(MessageBase):
    """Schema for creating a message"""
    dialog_id: int
    sender_type: str  # 'user' or 'system'

    @field_validator('sender_type')
    @classmethod
    def sender_type_valid(cls, v):
        if v not in ['user', 'system']:
            raise ValueError('Sender type must be either "user" or "system"')
        return v


class MessageResponse(MessageBase):
    """Schema for message response"""
    message_id: int
    dialog_id: int
    sender_type: str
    timestamp: datetime
    extra_data: Dict[str, Any] = {}

    class Config:
        from_attributes = True
