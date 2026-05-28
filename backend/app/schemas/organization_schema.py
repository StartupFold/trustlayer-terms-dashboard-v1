"""Pydantic schemas for organization request and response payloads."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class OrgCreate(BaseModel):
    """Legacy: create org by name + slug (no admin user)."""
    name: str
    slug: str


class OrgAccountCreate(BaseModel):
    """Create an org account and its first admin user in one call."""
    org_name: str
    email: EmailStr
    password: str


class OrgResponse(BaseModel):
    id: int
    name: str
    slug: Optional[str] = None
    email: Optional[str] = None
    subscription_status: str = "active"
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True


class OrgWithAdminResponse(BaseModel):
    id: int
    name: str
    slug: Optional[str] = None
    email: Optional[str] = None
    subscription_status: str = "active"
    is_active: bool
    created_at: datetime
    admin_email: Optional[str] = None

    class Config:
        orm_mode = True
