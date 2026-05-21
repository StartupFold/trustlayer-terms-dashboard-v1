"""Policy ORM model definition for terms and conditions."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship

from ..database import Base


def utcnow():
    return datetime.utcnow()


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    policy_type = Column(String, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    organization = relationship("Organization", back_populates="policies")
    user = relationship("User", back_populates="policies")
    versions = relationship("PolicyVersion", back_populates="policy", cascade="all, delete-orphan")
    acceptance_logs = relationship("AcceptanceLog", back_populates="policy", cascade="all, delete-orphan")
