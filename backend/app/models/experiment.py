from sqlalchemy import (
    Column, Integer, String, TIMESTAMP, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB

from app.db.session import Base


class Experiment(Base):
    __tablename__ = "experiments"

    experiment_id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    experiment_name = Column(String(100), nullable=False)
    variant_name = Column(String(100), nullable=False)

    started_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    ended_at = Column(TIMESTAMP, nullable=True)

    extra_data = Column(JSONB, server_default='{}')

    # Relationship (optional)
    user = relationship("User", back_populates="experiments")

    # Indexes
    __table_args__ = (
        Index("idx_experiments_user_id", "user_id"),
        Index("idx_experiments_name", "experiment_name"),
        Index("idx_experiments_variant", "variant_name"),
    )
