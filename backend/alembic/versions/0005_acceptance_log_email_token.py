"""add recipient_email, acceptance_token, make accepted_at nullable in acceptance_logs

Revision ID: 0005_acceptance_log_email_token
Revises: 0004_org_email_subscription
Create Date: 2026-05-27
"""

from alembic import op
import sqlalchemy as sa

revision = "0005_acceptance_log_email_token"
down_revision = "0004_org_email_subscription"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("acceptance_logs", sa.Column("recipient_email", sa.String(), nullable=True))
    op.add_column("acceptance_logs", sa.Column("acceptance_token", sa.String(), nullable=True))
    op.create_unique_constraint("uq_acceptance_logs_token", "acceptance_logs", ["acceptance_token"])
    # Make accepted_at nullable so pending rows can exist before user clicks accept
    op.alter_column("acceptance_logs", "accepted_at", existing_type=sa.DateTime(), nullable=True)


def downgrade():
    op.alter_column("acceptance_logs", "accepted_at", existing_type=sa.DateTime(), nullable=False)
    op.drop_constraint("uq_acceptance_logs_token", "acceptance_logs", type_="unique")
    op.drop_column("acceptance_logs", "acceptance_token")
    op.drop_column("acceptance_logs", "recipient_email")
