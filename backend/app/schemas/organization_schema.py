"""Pydantic schemas for organization request and response payloads."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class OrgCreate(BaseModel):
    name: str
    slug: str


class OrgResponse(BaseModel):
    id: int
    name: str
    slug: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True
