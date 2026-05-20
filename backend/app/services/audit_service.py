"""Audit service for recording acceptance and activity logs."""

from sqlalchemy.orm import Session

from app.models import AcceptanceLog, Policy


def create_acceptance_log(
    db: Session,
    policy_id: int,
    policy_version_id: int,
    ip_address: str | None,
    user_agent: str | None,
) -> AcceptanceLog:
    acceptance_log = AcceptanceLog(
        policy_id=policy_id,
        policy_version_id=policy_version_id,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(acceptance_log)
    db.commit()
    db.refresh(acceptance_log)
    return acceptance_log


def get_acceptance_logs(db: Session, organization_id: int) -> list[AcceptanceLog]:
    return (
        db.query(AcceptanceLog)
        .join(Policy, AcceptanceLog.policy_id == Policy.id)
        .filter(Policy.organization_id == organization_id)
        .all()
    )
