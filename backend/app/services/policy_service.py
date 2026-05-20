"""Policy service for encapsulating business logic around policy operations."""

from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Policy, PolicyVersion, User
from app.schemas.policy_schema import PolicyCreate, PolicyUpdate


def get_policies(db: Session, organization_id: int) -> list[Policy]:
    return db.query(Policy).filter(Policy.organization_id == organization_id).all()


def get_policy(db: Session, policy_id: int) -> Policy:
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
    return policy


def create_policy(db: Session, user: User, policy_in: PolicyCreate) -> Policy:
    policy = Policy(
        organization_id=user.organization_id,
        user_id=user.id,
        title=policy_in.title,
        policy_type=policy_in.policy_type,
    )
    db.add(policy)
    db.flush()

    first_version = PolicyVersion(
        policy_id=policy.id,
        version_number=1,
        content="",
    )
    db.add(first_version)
    db.commit()
    db.refresh(policy)
    return policy


def update_policy(db: Session, policy_id: int, policy_in: PolicyUpdate) -> Policy:
    policy = get_policy(db, policy_id)
    if policy_in.title is not None:
        policy.title = policy_in.title
    if policy_in.policy_type is not None:
        policy.policy_type = policy_in.policy_type

    if policy_in.content is not None:
        latest_version = (
            db.query(PolicyVersion)
            .filter(PolicyVersion.policy_id == policy.id)
            .order_by(PolicyVersion.version_number.desc())
            .first()
        )
        next_version = latest_version.version_number + 1 if latest_version else 1
        new_version = PolicyVersion(
            policy_id=policy.id,
            version_number=next_version,
            content=policy_in.content,
        )
        db.add(new_version)

    db.commit()
    db.refresh(policy)
    return policy


def delete_policy(db: Session, policy_id: int) -> None:
    policy = get_policy(db, policy_id)
    db.delete(policy)
    db.commit()


def publish_policy(db: Session, policy_id: int) -> Policy:
    policy = get_policy(db, policy_id)
    policy.is_published = True
    db.commit()
    db.refresh(policy)
    return policy
