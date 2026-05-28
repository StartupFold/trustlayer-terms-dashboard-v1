"""Super-admin API routes for platform-wide management.

Most endpoints require role == 'super_admin'. Audit logs are accessible
to both super_admin (all records) and org_admin (scoped to their org).
Mount this router under the /api/admin prefix in main.py.
"""

import re
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin, require_role
from app.models import AcceptanceLog, Organization, Policy, User
from app.schemas.organization_schema import OrgAccountCreate, OrgResponse, OrgWithAdminResponse
from app.schemas.policy_schema import AcceptanceLogResponse, PolicyResponse
from app.schemas.user_schema import UserRegister, UserResponse

router = APIRouter()

_super_admin = require_role("super_admin")
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _slug_from_name(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "org"


# ─── Organizations ─────────────────────────────────────────────────────────────

@router.post("/organizations", response_model=OrgWithAdminResponse, status_code=status.HTTP_201_CREATED)
def create_organization_account(
    org_in: OrgAccountCreate,
    current_user: User = Depends(_super_admin),
    db: Session = Depends(get_db),
) -> Any:
    """Create an org and its first org_admin user atomically."""
    # Check org name uniqueness
    if db.query(Organization).filter(Organization.name == org_in.org_name).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Organization name already exists")
    # Check admin email uniqueness
    if db.query(User).filter(User.email == org_in.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Generate a unique slug
    base_slug = _slug_from_name(org_in.org_name)
    slug = base_slug
    counter = 1
    while db.query(Organization).filter(Organization.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    org = Organization(
        name=org_in.org_name,
        slug=slug,
        email=org_in.email,
        subscription_status="active",
    )
    db.add(org)
    db.flush()

    hashed = _pwd_context.hash(org_in.password[:72])
    admin_user = User(
        email=org_in.email,
        password_hash=hashed,
        role="org_admin",
        organization_id=org.id,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(org)

    result = OrgWithAdminResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        email=org.email,
        subscription_status=org.subscription_status,
        is_active=org.is_active,
        created_at=org.created_at,
        admin_email=admin_user.email,
    )
    return result


@router.get("/organizations", response_model=list[OrgWithAdminResponse])
def list_organizations(
    current_user: User = Depends(_super_admin),
    db: Session = Depends(get_db),
) -> Any:
    orgs = db.query(Organization).all()
    results = []
    for org in orgs:
        admin = (
            db.query(User)
            .filter(User.organization_id == org.id, User.role == "org_admin")
            .first()
        )
        results.append(
            OrgWithAdminResponse(
                id=org.id,
                name=org.name,
                slug=org.slug,
                email=org.email,
                subscription_status=getattr(org, "subscription_status", "active"),
                is_active=org.is_active,
                created_at=org.created_at,
                admin_email=admin.email if admin else None,
            )
        )
    return results


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
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed = _pwd_context.hash(user_in.password[:72])
    user = User(
        email=user_in.email,
        password_hash=hashed,
        role=user_in.role or "org_admin",
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# ─── Platform-wide reads ────────────────────────────────────────────────────────

@router.get("/audit-logs", response_model=list[AcceptanceLogResponse])
def list_audit_logs(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Any:
    """super_admin sees all logs; org_admin sees only their org's logs."""
    if current_user.role == "super_admin":
        return db.query(AcceptanceLog).order_by(AcceptanceLog.accepted_at.desc()).all()
    return (
        db.query(AcceptanceLog)
        .join(Policy, AcceptanceLog.policy_id == Policy.id)
        .filter(Policy.organization_id == current_user.organization_id)
        .order_by(AcceptanceLog.accepted_at.desc())
        .all()
    )


@router.get("/policies", response_model=list[PolicyResponse])
def list_all_policies(
    current_user: User = Depends(_super_admin),
    db: Session = Depends(get_db),
) -> Any:
    return db.query(Policy).all()
