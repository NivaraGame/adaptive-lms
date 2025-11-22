from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class RecommendationRequest(BaseModel):
    """Request for content recommendation"""
    user_id: int
    current_topic: Optional[str] = None
    session_context: Dict[str, Any] = {}


class RecommendationResponse(BaseModel):
    """Response with recommended content"""
    content_id: int
    title: str
    difficulty_level: str
    format: str
    reasoning: str  # Why this content was recommended
    confidence: float  # 0-1, how confident the system is
    adaptation_details: Dict[str, Any] = {}
