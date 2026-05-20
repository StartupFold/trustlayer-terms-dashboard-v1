"""Admin-specific API routes for organization management."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.routes.policy_routes import get_current_user
from app.schemas.policy_schema import AcceptanceLogResponse
from app.services.audit_service import get_acceptance_logs

router = APIRouter()


@router.get("/audit-logs", response_model=list[AcceptanceLogResponse])
def list_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return get_acceptance_logs(db, current_user.organization_id)
