"""Authentication-related API routes.

Provides user registration and login endpoints using JWT for authentication.
"""

from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt

from app.database import get_db
from app.models import User
from app.config import settings
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse, TokenResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


def verify_password(plain_password: str, hashed_password: str) -> bool:
	return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
	truncated = password[:72]
	return pwd_context.hash(truncated)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)) -> Any:
	existing = db.query(User).filter(User.email == user_in.email).first()
	if existing:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

	hashed = get_password_hash(user_in.password)
	user = User(
		organization_id=user_in.organization_id,
		email=user_in.email,
		password_hash=hashed,
		role=user_in.role or "org_admin",
	)
	db.add(user)
	db.commit()
	db.refresh(user)

	return user


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)) -> Any:
	user = db.query(User).filter(User.email == credentials.email).first()
	# truncate incoming password to the same length used at registration
	incoming_password = credentials.password[:72]
	if not user or not verify_password(incoming_password, user.password_hash):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

	expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
	payload = {
		"sub": user.email,
		"role": user.role,
		"org_id": user.organization_id,
		"exp": expire,
	}
	token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

	return {"access_token": token, "token_type": "bearer"}

@router.post("/token", response_model=TokenResponse)
def login_for_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    incoming_password = form_data.password[:72]
    if not user or not verify_password(incoming_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user.email,
        "role": user.role,
        "org_id": user.organization_id,
        "exp": expire,
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return {"access_token": token, "token_type": "bearer"}