from sqlalchemy import Column, Integer, String, Text, Index
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

from app.db.session import Base


class ContentItem(Base):
    """
    Content model - learning materials and exercises
    """
    __tablename__ = "content_items"

    content_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    topic = Column(String(200), nullable=False, index=True)
    subtopic = Column(String(200), nullable=True, index=True)
    difficulty_level = Column(String(20), nullable=False, index=True)  # easy, normal, hard, challenge
    format = Column(String(20), nullable=False, index=True)  # text, visual, video, interactive
    content_type = Column(String(50), nullable=False, index=True)  # lesson, exercise, quiz, explanation

    content_data = Column(JSONB, nullable=False)  # Main content (text, images, questions, etc.)
    reference_answer = Column(JSONB, nullable=True)  # Correct answer for exercises
    hints = Column(JSONB, default=list)  # List of hints
    explanations = Column(JSONB, default=list)  # Step-by-step explanations

    skills = Column(JSONB, default=list)  # List of skills this content teaches/tests
    prerequisites = Column(JSONB, default=list)  # Required prior knowledge

    extra_data = Column(JSONB, default=dict)  # Additional metadata (author, version, etc.)

    # GIN indexes for JSONB columns
    __table_args__ = (
        Index('idx_content_skills', 'skills', postgresql_using='gin'),
        Index('idx_content_prerequisites', 'prerequisites', postgresql_using='gin'),
    )
