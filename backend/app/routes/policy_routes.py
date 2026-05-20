"""Policy management API routes."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import PolicyVersion, User
from app.schemas.policy_schema import PolicyCreate, PolicyResponse, PolicyUpdate, PolicyVersionResponse
from app.services.audit_service import create_acceptance_log
from app.services.policy_service import (
    create_policy,
    delete_policy,
    get_policy,
    get_policy_versions,
    get_policies,
    publish_policy,
    update_policy,
)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.get("/policies", response_model=list[PolicyResponse])
def list_policies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    return get_policies(db, current_user.organization_id)


@router.post("/policies", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
def create_new_policy(
    policy_in: PolicyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    return create_policy(db, current_user, policy_in)


@router.get("/policies/{policy_id}/versions", response_model=list[PolicyVersionResponse])
def list_policy_versions(
    policy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    policy = get_policy(db, policy_id)
    if policy.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return get_policy_versions(db, policy_id)


@router.put("/policies/{policy_id}", response_model=PolicyResponse)
def update_existing_policy(
    policy_id: int,
    policy_in: PolicyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    policy = get_policy(db, policy_id)
    if policy.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return update_policy(db, policy_id, policy_in)


@router.delete("/policies/{policy_id}", status_code=status.HTTP_200_OK)
def delete_existing_policy(
    policy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    policy = get_policy(db, policy_id)
    if policy.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    delete_policy(db, policy_id)
    return {"message": "Policy deleted"}


@router.post("/policies/{policy_id}/publish", response_model=PolicyResponse)
def publish_existing_policy(
    policy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    policy = get_policy(db, policy_id)
    if policy.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return publish_policy(db, policy_id)


@router.post("/policies/{policy_id}/accept")
def accept_policy(
    policy_id: int,
    request: Request,
    db: Session = Depends(get_db),
) -> Any:
    policy = get_policy(db, policy_id)
    if not policy.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    latest_version = (
        db.query(PolicyVersion)
        .filter(PolicyVersion.policy_id == policy_id)
        .order_by(PolicyVersion.version_number.desc())
        .first()
    )
    if not latest_version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy version not found")

    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    create_acceptance_log(db, policy_id, latest_version.id, ip_address, user_agent)
    return {"message": "Acceptance recorded"}
