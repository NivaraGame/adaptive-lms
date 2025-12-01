from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any, List, Optional


class RecommendationRequest(BaseModel):
    """
    Request for content recommendation.

    This schema defines the input parameters for getting a personalized
    content recommendation from the adaptation engine.
    """
    user_id: int = Field(..., description="ID of the user requesting recommendation")
    dialog_id: Optional[int] = Field(None, description="Optional dialog ID for session context")
    override_difficulty: Optional[str] = Field(
        None,
        description="Optional difficulty override (easy/normal/hard/challenge)"
    )
    override_format: Optional[str] = Field(
        None,
        description="Optional format override (text/visual/video/interactive)"
    )

    @field_validator('override_difficulty')
    @classmethod
    def validate_difficulty(cls, v):
        """Validate that override_difficulty is one of the allowed values."""
        if v is not None:
            allowed_difficulties = ['easy', 'normal', 'hard', 'challenge']
            if v not in allowed_difficulties:
                raise ValueError(
                    f"override_difficulty must be one of {allowed_difficulties}, got '{v}'"
                )
        return v

    @field_validator('override_format')
    @classmethod
    def validate_format(cls, v):
        """Validate that override_format is one of the allowed values."""
        if v is not None:
            allowed_formats = ['text', 'visual', 'video', 'interactive']
            if v not in allowed_formats:
                raise ValueError(
                    f"override_format must be one of {allowed_formats}, got '{v}'"
                )
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "dialog_id": 42,
                "override_difficulty": None,
                "override_format": None
            }
        }


class ContentSummary(BaseModel):
    """
    Summary of content item for recommendation response.
    """
    content_id: int
    title: str
    difficulty_level: str
    format: str
    content_type: str
    topic: str
    subtopic: Optional[str] = None

    class Config:
        from_attributes = True


class RecommendationMetadata(BaseModel):
    """
    Metadata about the recommendation decision.
    """
    difficulty: str = Field(..., description="Recommended difficulty level")
    format: str = Field(..., description="Recommended format")
    topic: Optional[str] = Field(None, description="Topic focus (if any)")
    tempo: str = Field(..., description="Recommended learning tempo")
    remediation_topics: List[str] = Field(
        default_factory=list,
        description="Topics needing remediation"
    )
    adaptation_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional adapter metadata"
    )


class RecommendationResponse(BaseModel):
    """
    Response with recommended content and reasoning.

    This schema contains the complete recommendation package including
    the selected content, reasoning, and metadata about the decision.
    """
    content: ContentSummary = Field(..., description="Selected content item")
    reasoning: str = Field(..., description="Human-readable explanation for recommendation")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0-1)")
    recommendation_metadata: RecommendationMetadata = Field(
        ...,
        description="Metadata about the recommendation decision"
    )
    strategy_used: str = Field(..., description="Strategy that made the decision (rules/bandit/policy)")
    timestamp: str = Field(..., description="ISO timestamp of recommendation")

    class Config:
        json_schema_extra = {
            "example": {
                "content": {
                    "content_id": 1,
                    "title": "Introduction to Algebra",
                    "difficulty_level": "normal",
                    "format": "text",
                    "content_type": "lesson",
                    "topic": "algebra",
                    "subtopic": "linear_equations"
                },
                "reasoning": "Adjusting to normal difficulty based on recent performance. Recommending text format. Based on 5 recent interactions. Selected 'Introduction to Algebra' (normal text lesson on algebra).",
                "confidence": 0.7,
                "recommendation_metadata": {
                    "difficulty": "normal",
                    "format": "text",
                    "topic": "algebra",
                    "tempo": "normal",
                    "remediation_topics": [],
                    "adaptation_metadata": {
                        "strategy": "rules",
                        "config_version": "1.0"
                    }
                },
                "strategy_used": "rules",
                "timestamp": "2024-01-01T12:00:00"
            }
        }


class RecommendationHistoryItem(BaseModel):
    """
    Single item in recommendation history.
    """
    content_id: int
    content_title: str
    difficulty: str
    format: str
    topic: str
    timestamp: str
    dialog_id: Optional[int] = None


class RecommendationHistoryResponse(BaseModel):
    """
    Response containing recommendation history.
    """
    user_id: int
    history: List[RecommendationHistoryItem]
    total_count: int
