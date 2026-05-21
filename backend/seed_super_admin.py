"""Seed script: creates the platform super admin account.

Run from inside the backend/ folder with the venv active:
  python seed_super_admin.py

Creates admin@trustlayer.com / SuperAdmin123! with role=super_admin.
Safe to run multiple times — skips creation if the account already exists.
"""

import sys
import os
from pathlib import Path

# Make sure app.* imports resolve when running from backend/
sys.path.insert(0, str(Path(__file__).resolve().parent))

from dotenv import load_dotenv
load_dotenv(dotenv_path=str(Path(__file__).resolve().parent / ".env"))

from passlib.context import CryptContext
from app.database import SessionLocal
from app.models import User

SUPER_ADMIN_EMAIL = "admin@trustlayer.com"
SUPER_ADMIN_PASSWORD = "SuperAdmin123!"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def main() -> None:
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == SUPER_ADMIN_EMAIL).first()
        if existing:
            print("Super admin already exists — skipping.")
            return

        hashed = pwd_context.hash(SUPER_ADMIN_PASSWORD[:72])
        super_admin = User(
            email=SUPER_ADMIN_EMAIL,
            password_hash=hashed,
            role="super_admin",
            organization_id=None,
        )
        db.add(super_admin)
        db.commit()
        print("Super admin created successfully.")
        print(f"  Email:    {SUPER_ADMIN_EMAIL}")
        print(f"  Password: {SUPER_ADMIN_PASSWORD}")
        print(f"  Role:     super_admin")
    finally:
        db.close()


if __name__ == "__main__":
    main()
