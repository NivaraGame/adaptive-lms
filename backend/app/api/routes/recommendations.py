from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import get_recommendation

router = APIRouter()


@router.post("/next", response_model=RecommendationResponse)
def recommend_next_content(request: RecommendationRequest, db: Session = Depends(get_db)):
    """
    Get next recommended content for user based on adaptation engine
    """
    recommendation = get_recommendation(
        user_id=request.user_id,
        current_topic=request.current_topic,
        session_context=request.session_context,
        db=db
    )

    return recommendation
