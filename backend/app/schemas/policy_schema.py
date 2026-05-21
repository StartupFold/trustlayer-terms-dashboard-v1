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
    user_id: Optional[int] = None
    title: str
    policy_type: str
    is_published: bool
    created_at: datetime

    class Config:
        orm_mode = True


class PolicyVersionResponse(BaseModel):
    id: int
    policy_id: int
    version_number: int
    content: str
    created_at: datetime

    class Config:
        orm_mode = True


class AcceptanceLogResponse(BaseModel):
    id: int
    policy_id: int
    policy_version_id: int
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    accepted_at: datetime

    class Config:
        orm_mode = True
