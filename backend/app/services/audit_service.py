"""Audit service for recording acceptance and activity logs."""

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models import AcceptanceLog, Policy


def create_acceptance_log(
    db: Session,
    policy_id: int,
    policy_version_id: int,
    ip_address: Optional[str],
    user_agent: Optional[str],
) -> AcceptanceLog:
    log = AcceptanceLog(
        policy_id=policy_id,
        policy_version_id=policy_version_id,
        ip_address=ip_address,
        user_agent=user_agent,
        accepted_at=datetime.utcnow(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def create_pending_acceptance_log(
    db: Session,
    policy_id: int,
    policy_version_id: int,
    recipient_email: str,
    acceptance_token: str,
) -> AcceptanceLog:
    """Create a pending log when an email is sent (not yet accepted)."""
    log = AcceptanceLog(
        policy_id=policy_id,
        policy_version_id=policy_version_id,
        recipient_email=recipient_email,
        acceptance_token=acceptance_token,
        accepted_at=None,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_acceptance_logs(db: Session, organization_id: int) -> list[AcceptanceLog]:
    return (
        db.query(AcceptanceLog)
        .join(Policy, AcceptanceLog.policy_id == Policy.id)
        .filter(Policy.organization_id == organization_id)
        .all()
    )
