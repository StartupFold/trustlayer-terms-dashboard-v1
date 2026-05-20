"""AcceptanceLog ORM model definition for tracking user acceptances."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from ..database import Base


def utcnow():
    return datetime.utcnow()


class AcceptanceLog(Base):
    __tablename__ = "acceptance_logs"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    policy_version_id = Column(Integer, ForeignKey("policy_versions.id"), nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    accepted_at = Column(DateTime, default=utcnow, nullable=False)

    policy = relationship("Policy", back_populates="acceptance_logs")
    policy_version = relationship("PolicyVersion", back_populates="acceptance_logs")
