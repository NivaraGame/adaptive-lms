from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.session import Base


class Metric(Base):
    """
    Metric model - stores computed metrics from user interactions
    """
    __tablename__ = "metrics"

    metric_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    dialog_id = Column(Integer, ForeignKey("dialogs.dialog_id"), nullable=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.message_id"), nullable=True, index=True)

    metric_name = Column(String(100), nullable=False, index=True)  # e.g., 'accuracy', 'response_time'
    metric_value_f = Column(Float, nullable=True)  # Numeric value
    metric_value_s = Column(String(255), nullable=True)  # String value
    metric_value_j = Column(JSONB, nullable=True)  # JSON value for complex data

    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    context = Column(JSONB, default=dict)  # Additional context for the metric

    # Relationships
    user = relationship("User", back_populates="metrics")
    dialog = relationship("Dialog", back_populates="metrics")
    message = relationship("Message", back_populates="metrics")

    # Composite index for efficient user-metric queries
    __table_args__ = (
        Index('idx_metrics_user_name', 'user_id', 'metric_name'),
    )
