from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.session import Base


class Message(Base):
    """
    Message model - individual messages within a dialog
    """
    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True, index=True)
    dialog_id = Column(Integer, ForeignKey("dialogs.dialog_id"), nullable=False, index=True)
    sender_type = Column(String(20), nullable=False, index=True)  # 'user' or 'system'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    is_question = Column(Boolean, default=False)  # Is this message a question?
    extra_data = Column(JSONB, default=dict)  # Additional message-specific data

    # Relationships
    dialog = relationship("Dialog", back_populates="messages")
    metrics = relationship("Metric", back_populates="message")
