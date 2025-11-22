from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, Dict, List, Any


class UserProfileBase(BaseModel):
    """Base user profile schema"""
    topic_mastery: Dict[str, float] = {}
    preferred_format: Optional[str] = None  # text, visual, video, interactive
    learning_pace: str = "medium"  # slow, medium, fast
    error_patterns: List[Any] = []
    avg_response_time: Optional[float] = None
    avg_accuracy: Optional[float] = None
    total_interactions: int = 0
    total_time_spent: float = 0.0
    current_difficulty: str = "normal"  # easy, normal, hard, challenge
    extra_data: Dict[str, Any] = {}

    @field_validator('preferred_format')
    @classmethod
    def preferred_format_valid(cls, v):
        if v is not None:
            allowed_formats = ['text', 'visual', 'video', 'interactive']
            if v not in allowed_formats:
                raise ValueError(f'Preferred format must be one of: {", ".join(allowed_formats)}')
        return v

    @field_validator('learning_pace')
    @classmethod
    def learning_pace_valid(cls, v):
        allowed_paces = ['slow', 'medium', 'fast']
        if v not in allowed_paces:
            raise ValueError(f'Learning pace must be one of: {", ".join(allowed_paces)}')
        return v

    @field_validator('current_difficulty')
    @classmethod
    def current_difficulty_valid(cls, v):
        allowed_levels = ['easy', 'normal', 'hard', 'challenge']
        if v not in allowed_levels:
            raise ValueError(f'Current difficulty must be one of: {", ".join(allowed_levels)}')
        return v

    @field_validator('avg_accuracy')
    @classmethod
    def avg_accuracy_range(cls, v):
        if v is not None and (v < 0 or v > 1):
            raise ValueError('Average accuracy must be between 0 and 1')
        return v

    @field_validator('total_interactions')
    @classmethod
    def total_interactions_positive(cls, v):
        if v < 0:
            raise ValueError('Total interactions must be non-negative')
        return v

    @field_validator('total_time_spent', 'avg_response_time')
    @classmethod
    def time_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Time values must be non-negative')
        return v


class UserProfileCreate(UserProfileBase):
    """Schema for creating a user profile"""
    user_id: int


class UserProfileUpdate(BaseModel):
    """Schema for updating a user profile"""
    topic_mastery: Optional[Dict[str, float]] = None
    preferred_format: Optional[str] = None
    learning_pace: Optional[str] = None
    error_patterns: Optional[List[Any]] = None
    avg_response_time: Optional[float] = None
    avg_accuracy: Optional[float] = None
    total_interactions: Optional[int] = None
    total_time_spent: Optional[float] = None
    current_difficulty: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None

    @field_validator('preferred_format')
    @classmethod
    def preferred_format_valid(cls, v):
        if v is not None:
            allowed_formats = ['text', 'visual', 'video', 'interactive']
            if v not in allowed_formats:
                raise ValueError(f'Preferred format must be one of: {", ".join(allowed_formats)}')
        return v

    @field_validator('learning_pace')
    @classmethod
    def learning_pace_valid(cls, v):
        if v is not None:
            allowed_paces = ['slow', 'medium', 'fast']
            if v not in allowed_paces:
                raise ValueError(f'Learning pace must be one of: {", ".join(allowed_paces)}')
        return v

    @field_validator('current_difficulty')
    @classmethod
    def current_difficulty_valid(cls, v):
        if v is not None:
            allowed_levels = ['easy', 'normal', 'hard', 'challenge']
            if v not in allowed_levels:
                raise ValueError(f'Current difficulty must be one of: {", ".join(allowed_levels)}')
        return v

    @field_validator('avg_accuracy')
    @classmethod
    def avg_accuracy_range(cls, v):
        if v is not None and (v < 0 or v > 1):
            raise ValueError('Average accuracy must be between 0 and 1')
        return v


class UserProfileResponse(UserProfileBase):
    """Schema for user profile response"""
    profile_id: int
    user_id: int
    last_updated: datetime

    class Config:
        from_attributes = True
