"""remove user role — only super_admin and org_admin are valid

Revision ID: 0003_remove_user_role
Revises: 129ed05f1b8b
Create Date: 2026-05-27
"""

from alembic import op
import sqlalchemy as sa

revision = "0003_remove_user_role"
down_revision = "129ed05f1b8b"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint("user_role_check", "users", type_="check")
    op.execute("UPDATE users SET role = 'org_admin' WHERE role = 'user'")
    op.create_check_constraint(
        "user_role_check",
        "users",
        "role IN ('super_admin', 'org_admin')",
    )
    # Change default to org_admin
    op.alter_column(
        "users",
        "role",
        existing_type=sa.String(),
        server_default="org_admin",
        nullable=False,
    )


def downgrade():
    op.drop_constraint("user_role_check", "users", type_="check")
    op.create_check_constraint(
        "user_role_check",
        "users",
        "role IN ('super_admin', 'org_admin', 'user')",
    )
    op.alter_column(
        "users",
        "role",
        existing_type=sa.String(),
        server_default="user",
        nullable=False,
    )
