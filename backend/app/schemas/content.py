from pydantic import BaseModel, field_validator
from typing import Optional, Dict, List, Any


class ContentItemBase(BaseModel):
    """Base content item schema"""
    title: str
    topic: str
    subtopic: Optional[str] = None
    difficulty_level: str  # easy, normal, hard, challenge
    format: str  # text, visual, video, interactive
    content_type: str  # lesson, exercise, quiz, explanation
    content_data: Dict[str, Any]
    reference_answer: Optional[Dict[str, Any]] = None
    hints: List[Any] = []
    explanations: List[Any] = []
    skills: List[str] = []
    prerequisites: List[str] = []
    extra_data: Dict[str, Any] = {}

    @field_validator('difficulty_level')
    @classmethod
    def difficulty_level_valid(cls, v):
        allowed_levels = ['easy', 'normal', 'hard', 'challenge']
        if v not in allowed_levels:
            raise ValueError(f'Difficulty level must be one of: {", ".join(allowed_levels)}')
        return v

    @field_validator('format')
    @classmethod
    def format_valid(cls, v):
        allowed_formats = ['text', 'visual', 'video', 'interactive']
        if v not in allowed_formats:
            raise ValueError(f'Format must be one of: {", ".join(allowed_formats)}')
        return v

    @field_validator('content_type')
    @classmethod
    def content_type_valid(cls, v):
        allowed_types = ['lesson', 'exercise', 'quiz', 'explanation']
        if v not in allowed_types:
            raise ValueError(f'Content type must be one of: {", ".join(allowed_types)}')
        return v

    @field_validator('title', 'topic')
    @classmethod
    def text_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Field cannot be empty')
        return v


class ContentItemCreate(ContentItemBase):
    """Schema for creating a content item"""
    pass


class ContentItemUpdate(BaseModel):
    """Schema for updating a content item"""
    title: Optional[str] = None
    topic: Optional[str] = None
    subtopic: Optional[str] = None
    difficulty_level: Optional[str] = None
    format: Optional[str] = None
    content_type: Optional[str] = None
    content_data: Optional[Dict[str, Any]] = None
    reference_answer: Optional[Dict[str, Any]] = None
    hints: Optional[List[Any]] = None
    explanations: Optional[List[Any]] = None
    skills: Optional[List[str]] = None
    prerequisites: Optional[List[str]] = None
    extra_data: Optional[Dict[str, Any]] = None

    @field_validator('difficulty_level')
    @classmethod
    def difficulty_level_valid(cls, v):
        if v is not None:
            allowed_levels = ['easy', 'normal', 'hard', 'challenge']
            if v not in allowed_levels:
                raise ValueError(f'Difficulty level must be one of: {", ".join(allowed_levels)}')
        return v

    @field_validator('format')
    @classmethod
    def format_valid(cls, v):
        if v is not None:
            allowed_formats = ['text', 'visual', 'video', 'interactive']
            if v not in allowed_formats:
                raise ValueError(f'Format must be one of: {", ".join(allowed_formats)}')
        return v

    @field_validator('content_type')
    @classmethod
    def content_type_valid(cls, v):
        if v is not None:
            allowed_types = ['lesson', 'exercise', 'quiz', 'explanation']
            if v not in allowed_types:
                raise ValueError(f'Content type must be one of: {", ".join(allowed_types)}')
        return v


class ContentItemResponse(ContentItemBase):
    """Schema for content item response"""
    content_id: int

    class Config:
        from_attributes = True


class PaginationMetadata(BaseModel):
    """Pagination metadata schema"""
    total: int
    limit: int
    offset: int
    total_pages: int
    current_page: int
    has_next: bool
    has_prev: bool


class ContentListResponse(BaseModel):
    """Response schema for paginated content list"""
    items: List[ContentItemResponse]
    pagination: PaginationMetadata
