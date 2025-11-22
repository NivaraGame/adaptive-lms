from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.session import Base


class Dialog(Base):
    """
    Dialog model - represents a learning session/conversation
    """
    __tablename__ = "dialogs"

    dialog_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    dialog_type = Column(String(50), nullable=False, index=True)  # educational, test, assessment, reflective
    topic = Column(String(200), index=True)
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    ended_at = Column(DateTime, nullable=True)
    extra_data = Column(JSONB, default=dict)  # Additional dialog-specific data

    # Relationships
    user = relationship("User", back_populates="dialogs")
    messages = relationship("Message", back_populates="dialog", cascade="all, delete-orphan")
    metrics = relationship("Metric", back_populates="dialog", cascade="all, delete-orphan")
