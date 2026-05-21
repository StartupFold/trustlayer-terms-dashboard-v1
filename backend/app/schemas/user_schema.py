"""Pydantic schemas for user-related payloads.

Defines request/response models used by the authentication endpoints.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
	email: EmailStr
	password: str = Field(min_length=8)
	role: Optional[str] = "user"
	organization_id: Optional[int] = None


class UserLogin(BaseModel):
	email: EmailStr
	password: str


class UserResponse(BaseModel):
	id: int
	email: EmailStr
	role: str
	organization_id: Optional[int] = None
	created_at: datetime

	class Config:
		orm_mode = True


class TokenResponse(BaseModel):
	access_token: str
	token_type: str = "bearer"
