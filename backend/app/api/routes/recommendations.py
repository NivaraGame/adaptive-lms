"""
Recommendations API Routes

This module provides endpoints for getting personalized content recommendations:
- POST /next - Get next content recommendation
- GET /history - Get recommendation history
- GET /strategy - Get current adaptation strategy info
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import logging

from app.db.session import get_db
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    ContentSummary,
    RecommendationMetadata,
    RecommendationHistoryResponse,
    RecommendationHistoryItem
)
from app.services.recommendation_service import RecommendationService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/next",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Next Content Recommendation",
    description="Get personalized content recommendation using the adaptive learning engine",
    responses={
        200: {
            "description": "Successfully generated recommendation",
            "content": {
                "application/json": {
                    "example": {
                        "content": {
                            "content_id": 15,
                            "title": "Advanced Algebra Problem Set",
                            "difficulty_level": "hard",
                            "format": "text",
                            "content_type": "exercise",
                            "topic": "algebra",
                            "subtopic": "quadratic_equations"
                        },
                        "reasoning": "Adjusting to hard difficulty based on recent performance (avg accuracy: 0.85). Recommending text format as you have been efficient with quick responses. Based on 7 recent interactions. Selected 'Advanced Algebra Problem Set' (hard text exercise on algebra).",
                        "confidence": 0.75,
                        "recommendation_metadata": {
                            "difficulty": "hard",
                            "format": "text",
                            "topic": "algebra",
                            "tempo": "normal",
                            "remediation_topics": [],
                            "adaptation_metadata": {
                                "strategy": "rules",
                                "config_version": "1.0",
                                "difficulty_change": 1
                            }
                        },
                        "strategy_used": "rules",
                        "timestamp": "2024-12-01T12:00:00"
                    }
                }
            }
        },
        404: {
            "description": "User not found or no suitable content available",
            "content": {
                "application/json": {
                    "examples": {
                        "user_not_found": {
                            "summary": "User Not Found",
                            "value": {"detail": "User data not found: No profile exists for user_id=999"}
                        },
                        "no_content": {
                            "summary": "No Content Available",
                            "value": {"detail": "No suitable content available for recommendation"}
                        }
                    }
                }
            }
        },
        500: {
            "description": "Internal server error or adaptation engine failure",
            "content": {
                "application/json": {
                    "example": {"detail": "Failed to generate recommendation. Please try again later."}
                }
            }
        }
    }
)
def get_next_recommendation(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Get next recommended content for a user.

    This endpoint uses the adaptation engine to analyze the user's profile,
    recent metrics, and session context to recommend the most appropriate
    content based on:
    - **Current difficulty level and performance**: Adjusts difficulty based on accuracy
    - **Preferred learning format**: Adapts format based on engagement patterns
    - **Topics needing remediation**: Prioritizes weak areas (mastery < 0.4)
    - **Session fatigue and tempo**: Detects fatigue and suggests breaks

    ## How It Works

    1. Fetches user profile and recent metrics (last 10 interactions)
    2. Builds session context from dialog data
    3. Calls adaptation engine to make decisions (difficulty, format, tempo, remediation)
    4. Queries content database with recommended parameters
    5. Ranks and selects best matching content
    6. Returns content with human-readable reasoning

    ## Request Parameters

    - **user_id** (required): ID of the user requesting recommendation
    - **dialog_id** (optional): Dialog ID for session context
    - **override_difficulty** (optional): Override difficulty (for testing: easy/normal/hard/challenge)
    - **override_format** (optional): Override format (for testing: text/visual/video/interactive)

    ## Response Fields

    - **content**: Selected content item with metadata
    - **reasoning**: Human-readable explanation of why this content was recommended
    - **confidence**: Confidence score (0.0-1.0) based on available data
    - **recommendation_metadata**: Decision metadata (difficulty, format, tempo, remediation topics)
    - **strategy_used**: Adaptation strategy that made the decision (currently "rules")
    - **timestamp**: ISO timestamp of when recommendation was generated

    ## Example Usage

    ```bash
    # Get recommendation for user 1 in dialog 42
    curl -X POST "http://localhost:8000/api/v1/recommendations/next" \\
         -H "Content-Type: application/json" \\
         -d '{"user_id": 1, "dialog_id": 42}'

    # Get recommendation with difficulty override
    curl -X POST "http://localhost:8000/api/v1/recommendations/next" \\
         -H "Content-Type: application/json" \\
         -d '{"user_id": 1, "dialog_id": 42, "override_difficulty": "easy"}'
    ```

    ## Error Cases

    - **404 Not Found**: User profile doesn't exist or no suitable content available
    - **500 Internal Server Error**: Adaptation engine failure or database error
    """
    try:
        logger.info(
            f"Recommendation request: user_id={request.user_id}, "
            f"dialog_id={request.dialog_id}"
        )

        # Initialize recommendation service
        service = RecommendationService(db)

        # Get recommendation
        recommendation = service.get_next_recommendation(
            user_id=request.user_id,
            dialog_id=request.dialog_id,
            override_difficulty=request.override_difficulty,
            override_format=request.override_format
        )

        # Convert content item to ContentSummary
        content_summary = ContentSummary(
            content_id=recommendation['content'].content_id,
            title=recommendation['content'].title,
            difficulty_level=recommendation['content'].difficulty_level,
            format=recommendation['content'].format,
            content_type=recommendation['content'].content_type,
            topic=recommendation['content'].topic,
            subtopic=recommendation['content'].subtopic
        )

        # Convert metadata
        metadata = RecommendationMetadata(
            difficulty=recommendation['recommendation_metadata']['difficulty'],
            format=recommendation['recommendation_metadata']['format'],
            topic=recommendation['recommendation_metadata'].get('topic'),
            tempo=recommendation['recommendation_metadata']['tempo'],
            remediation_topics=recommendation['recommendation_metadata']['remediation_topics'],
            adaptation_metadata=recommendation['recommendation_metadata']['adaptation_metadata']
        )

        # Build response
        response = RecommendationResponse(
            content=content_summary,
            reasoning=recommendation['reasoning'],
            confidence=recommendation['confidence'],
            recommendation_metadata=metadata,
            strategy_used=recommendation['strategy_used'],
            timestamp=recommendation['timestamp']
        )

        logger.info(
            f"Recommendation generated: content_id={content_summary.content_id}, "
            f"confidence={recommendation['confidence']:.2f}"
        )

        return response

    except Exception as e:
        logger.error(f"Error generating recommendation: {e}", exc_info=True)

        # Import specific error types for better handling
        from app.core.adaptation.engine import (
            AdaptationEngineError,
            DataFetchError,
            StrategyNotFoundError
        )
        from app.services.content_service import ContentNotFoundError

        # Handle specific error types with appropriate HTTP status codes
        if isinstance(e, ContentNotFoundError):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No suitable content available for recommendation"
            )
        elif isinstance(e, DataFetchError):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User data not found: {str(e)}"
            )
        elif isinstance(e, StrategyNotFoundError):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Adaptation strategy error: {str(e)}"
            )
        elif isinstance(e, AdaptationEngineError):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Adaptation engine error: {str(e)}"
            )
        # Fallback for string-based error detection (for backwards compatibility)
        elif "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        elif "no content available" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No suitable content available for recommendation"
            )
        else:
            # Generic server error with sanitized message
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate recommendation. Please try again later."
            )


@router.get("/history", response_model=RecommendationHistoryResponse)
def get_recommendation_history(
    user_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get recommendation history for a user.

    Returns the list of content items that have been recommended/shown
    to the user recently, along with timestamps and context.

    **Query Parameters:**
    - user_id: ID of the user
    - limit: Maximum number of history items to return (default: 10, max: 50)

    **Returns:**
    - List of recent recommendations with content details
    - Total count of recommendations

    **Error Cases:**
    - 400: Invalid parameters
    - 500: Internal server error
    """
    try:
        if limit > 50:
            limit = 50

        logger.info(f"Getting recommendation history: user_id={user_id}, limit={limit}")

        service = RecommendationService(db)
        history = service.get_recommendation_history(user_id=user_id, limit=limit)

        # Convert to schema
        history_items = [
            RecommendationHistoryItem(**item) for item in history
        ]

        response = RecommendationHistoryResponse(
            user_id=user_id,
            history=history_items,
            total_count=len(history_items)
        )

        return response

    except Exception as e:
        logger.error(f"Error getting recommendation history: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve recommendation history"
        )


@router.get("/strategy")
def get_current_strategy(db: Session = Depends(get_db)):
    """
    Get information about the current adaptation strategy.

    Returns metadata about the active adaptation strategy including:
    - Strategy type (rules/bandit/policy)
    - Configuration version
    - Available strategies
    - Threshold configuration summary

    **Returns:**
    - Strategy metadata dict

    **Error Cases:**
    - 500: Internal server error
    """
    try:
        from app.core.adaptation.engine import AdaptationEngine

        engine = AdaptationEngine(db)
        strategy_info = engine.get_current_strategy()

        logger.info(f"Current strategy: {strategy_info['strategy_type']}")

        return strategy_info

    except Exception as e:
        logger.error(f"Error getting strategy info: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve strategy information"
        )
