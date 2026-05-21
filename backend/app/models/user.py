"""User ORM model definition including roles and organization association."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship

from ..database import Base


def utcnow():
    return datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")
    created_at = Column(DateTime, default=utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("role IN ('super_admin', 'org_admin', 'user')", name="user_role_check"),
    )

    organization = relationship("Organization", back_populates="users")
    policies = relationship("Policy", back_populates="user", cascade="all, delete-orphan")
