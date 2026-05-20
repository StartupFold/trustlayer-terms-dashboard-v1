"""PolicyVersion ORM model definition for version history."""

from datetime import datetime
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from ..database import Base


def utcnow():
    return datetime.utcnow()


class PolicyVersion(Base):
    __tablename__ = "policy_versions"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    policy = relationship("Policy", back_populates="versions")
    acceptance_logs = relationship("AcceptanceLog", back_populates="policy_version", cascade="all, delete-orphan")
