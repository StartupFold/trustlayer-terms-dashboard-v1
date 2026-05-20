"""Pydantic schemas for policy request and response payloads."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PolicyCreate(BaseModel):
    title: str
    policy_type: str


class PolicyUpdate(BaseModel):
    title: Optional[str] = None
    policy_type: Optional[str] = None
    content: Optional[str] = None


class PolicyResponse(BaseModel):
    id: int
    organization_id: int
    user_id: int
    title: str
    policy_type: str
    is_published: bool
    created_at: datetime

    class Config:
        orm_mode = True
