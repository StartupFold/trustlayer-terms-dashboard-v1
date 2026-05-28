"""add email and subscription_status to organizations

Revision ID: 0004_org_email_subscription
Revises: 0003_remove_user_role
Create Date: 2026-05-27
"""

from alembic import op
import sqlalchemy as sa

revision = "0004_org_email_subscription"
down_revision = "0003_remove_user_role"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("organizations", sa.Column("email", sa.String(), nullable=True))
    op.add_column(
        "organizations",
        sa.Column(
            "subscription_status",
            sa.String(),
            nullable=False,
            server_default="active",
        ),
    )


def downgrade():
    op.drop_column("organizations", "subscription_status")
    op.drop_column("organizations", "email")
