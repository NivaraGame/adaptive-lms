from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.session import Base


class UserProfile(Base):
    """
    User profile model - aggregated user learning data
    """
    __tablename__ = "user_profiles"

    profile_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False, index=True)

    # Aggregated metrics
    topic_mastery = Column(JSONB, default=dict)  # {"topic1": 0.75, "topic2": 0.60, ...}
    preferred_format = Column(String(20), nullable=True)  # text, visual, video, interactive
    learning_pace = Column(String(20), default="medium")  # slow, medium, fast
    error_patterns = Column(JSONB, default=list)  # Common error patterns

    avg_response_time = Column(Float, nullable=True)  # Average time to respond (seconds)
    avg_accuracy = Column(Float, nullable=True)  # Overall accuracy (0-1)
    total_interactions = Column(Integer, default=0)
    total_time_spent = Column(Float, default=0.0)  # Total learning time (minutes)

    current_difficulty = Column(String(20), default="normal")  # Current difficulty level

    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    extra_data = Column(JSONB, default=dict)  # Additional profile data

    # Relationships
    user = relationship("User", back_populates="profile")

    # GIN index for topic mastery queries
    __table_args__ = (
        Index('idx_user_profiles_mastery', 'topic_mastery', postgresql_using='gin'),
    )
