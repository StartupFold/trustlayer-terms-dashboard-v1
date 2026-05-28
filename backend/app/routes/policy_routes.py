"""Policy management API routes."""

import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import require_admin
from app.models import AcceptanceLog, PolicyVersion, User
from app.schemas.policy_schema import (
    PolicyCreate,
    PolicyResponse,
    PolicyUpdate,
    PolicyVersionResponse,
    SendPolicyRequest,
)
from app.services.audit_service import create_acceptance_log, create_pending_acceptance_log
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


@router.post("/policies/{policy_id}/send", status_code=status.HTTP_200_OK)
async def send_policy_to_emails(
    policy_id: int,
    body: SendPolicyRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Any:
    """Send a policy acceptance request email to one or more recipients."""
    from app.services.email_service import send_policy_email

    policy = get_policy(db, policy_id)
    if current_user.role == "org_admin" and policy.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    latest_version = (
        db.query(PolicyVersion)
        .filter(PolicyVersion.policy_id == policy_id)
        .order_by(PolicyVersion.version_number.desc())
        .first()
    )
    if not latest_version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy version not found")

    sent = []
    for email in body.emails:
        token = str(uuid.uuid4())
        create_pending_acceptance_log(db, policy_id, latest_version.id, email, token)
        await send_policy_email(email, policy_id, token, policy.title)
        sent.append(email)

    return {"message": f"Policy sent to {len(sent)} recipient(s)", "recipients": sent}


@router.post("/policies/{policy_id}/accept")
def accept_policy(
    policy_id: int,
    request: Request,
    token: Optional[str] = None,
    db: Session = Depends(get_db),
) -> Any:
    policy = get_policy(db, policy_id)
    if not policy.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    if token:
        # Find the pending log row matching this token
        log = (
            db.query(AcceptanceLog)
            .filter(
                AcceptanceLog.acceptance_token == token,
                AcceptanceLog.policy_id == policy_id,
                AcceptanceLog.accepted_at.is_(None),
            )
            .first()
        )
        if not log:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or already used token")
        from datetime import datetime
        log.accepted_at = datetime.utcnow()
        log.ip_address = ip_address
        log.user_agent = user_agent
        db.commit()
        return {"message": "Acceptance recorded"}

    # Anonymous acceptance (no token)
    latest_version = (
        db.query(PolicyVersion)
        .filter(PolicyVersion.policy_id == policy_id)
        .order_by(PolicyVersion.version_number.desc())
        .first()
    )
    if not latest_version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy version not found")

    create_acceptance_log(db, policy_id, latest_version.id, ip_address, user_agent)
    return {"message": "Acceptance recorded"}
