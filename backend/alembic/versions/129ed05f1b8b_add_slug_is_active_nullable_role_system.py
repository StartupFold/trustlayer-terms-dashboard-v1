"""add organizations slug/is_active, nullable org/user FKs, expand role constraint

Revision ID: 129ed05f1b8b
Revises: 0001_initial_tables
Create Date: 2026-05-21
"""

from alembic import op
import sqlalchemy as sa


revision = "129ed05f1b8b"
down_revision = "0001_initial_tables"
branch_labels = None
depends_on = None


def upgrade():
    # --- organizations: add slug (nullable, unique) and is_active (default True) ---
    op.add_column("organizations", sa.Column("slug", sa.String(), nullable=True))
    op.add_column(
        "organizations",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    op.create_index(op.f("ix_organizations_id"), "organizations", ["id"], unique=False)
    op.create_unique_constraint("uq_organizations_slug", "organizations", ["slug"])

    # --- users: make organization_id nullable ---
    op.alter_column("users", "organization_id", existing_type=sa.INTEGER(), nullable=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    # --- users: expand role constraint to include super_admin and org_admin ---
    # Drop old constraint first so the UPDATE can proceed without violation
    op.drop_constraint("user_role_check", "users", type_="check")
    # Migrate any legacy 'admin' values to 'org_admin'
    op.execute("UPDATE users SET role = 'org_admin' WHERE role = 'admin'")
    op.create_check_constraint(
        "user_role_check",
        "users",
        "role IN ('super_admin', 'org_admin', 'user')",
    )

    # --- policies: make user_id nullable ---
    op.alter_column("policies", "user_id", existing_type=sa.INTEGER(), nullable=True)
    op.create_index(op.f("ix_policies_id"), "policies", ["id"], unique=False)

    # --- misc indexes ---
    op.create_index(op.f("ix_acceptance_logs_id"), "acceptance_logs", ["id"], unique=False)
    op.create_index(op.f("ix_policy_versions_id"), "policy_versions", ["id"], unique=False)


def downgrade():
    op.drop_index(op.f("ix_policy_versions_id"), table_name="policy_versions")
    op.drop_index(op.f("ix_acceptance_logs_id"), table_name="acceptance_logs")

    op.alter_column("policies", "user_id", existing_type=sa.INTEGER(), nullable=False)
    op.drop_index(op.f("ix_policies_id"), table_name="policies")

    op.drop_constraint("user_role_check", "users", type_="check")
    op.execute("UPDATE users SET role = 'user' WHERE role IN ('super_admin', 'org_admin')")
    op.create_check_constraint("user_role_check", "users", "role IN ('admin', 'user')")
    op.alter_column("users", "organization_id", existing_type=sa.INTEGER(), nullable=False)
    op.drop_index(op.f("ix_users_id"), table_name="users")

    op.drop_constraint("uq_organizations_slug", "organizations", type_="unique")
    op.drop_index(op.f("ix_organizations_id"), table_name="organizations")
    op.drop_column("organizations", "is_active")
    op.drop_column("organizations", "slug")
