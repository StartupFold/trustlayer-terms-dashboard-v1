"""Super-admin API routes for platform-wide management.

All endpoints require role == 'super_admin'. Any other role receives HTTP 403.
Mount this router under the /api/admin prefix in main.py.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models import AcceptanceLog, Organization, Policy, User
from app.schemas.organization_schema import OrgCreate, OrgResponse
from app.schemas.policy_schema import AcceptanceLogResponse, PolicyResponse
from app.schemas.user_schema import UserRegister, UserResponse

router = APIRouter()

# Reusable guard — all routes in this file require super_admin
_super_admin = require_role("super_admin")


# ─── Organizations ─────────────────────────────────────────────────────────────

@router.post("/organizations", response_model=OrgResponse, status_code=status.HTTP_201_CREATED)
def create_organization(
    org_in: OrgCreate,
    current_user: User = Depends(_super_admin),
    db: Session = Depends(get_db),
) -> Any:
    existing = db.query(Organization).filter(Organization.slug == org_in.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization slug already exists",
        )
    org = Organization(name=org_in.name, slug=org_in.slug)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@router.get("/organizations", response_model=list[OrgResponse])
def list_organizations(
    current_user: User = Depends(_super_admin),
    db: Session = Depends(get_db),
) -> Any:
    return db.query(Organization).all()


@router.delete("/organizations/{org_id}", response_model=OrgResponse)
def deactivate_organization(
    org_id: int,
    current_user: User = Depends(_super_admin),
    db: Session = Depends(get_db),
) -> Any:
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    org.is_active = False
    db.commit()
    db.refresh(org)
    return org


# ─── Users ─────────────────────────────────────────────────────────────────────

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserRegister,
    current_user: User = Depends(_super_admin),
    db: Session = Depends(get_db),
) -> Any:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed = pwd_context.hash(user_in.password[:72])
    user = User(
        email=user_in.email,
        password_hash=hashed,
        role=user_in.role or "user",
        organization_id=user_in.organization_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users", response_model=list[UserResponse])
def list_users(
    current_user: User = Depends(_super_admin),
    db: Session = Depends(get_db),
) -> Any:
    return db.query(User).all()


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    current_user: User = Depends(_super_admin),
    db: Session = Depends(get_db),
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# ─── Platform-wide reads ────────────────────────────────────────────────────────

@router.get("/audit-logs", response_model=list[AcceptanceLogResponse])
def list_all_audit_logs(
    current_user: User = Depends(_super_admin),
    db: Session = Depends(get_db),
) -> Any:
    return db.query(AcceptanceLog).order_by(AcceptanceLog.accepted_at.desc()).all()


@router.get("/policies", response_model=list[PolicyResponse])
def list_all_policies(
    current_user: User = Depends(_super_admin),
    db: Session = Depends(get_db),
) -> Any:
    return db.query(Policy).all()
