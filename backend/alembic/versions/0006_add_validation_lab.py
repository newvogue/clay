"""Add validation and activation review tables."""

from alembic import op
import sqlalchemy as sa


revision = "0006_e11_validation"
down_revision = "0005_e10_knowledge"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS validation")
    op.create_table(
        "validation_runs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("run_type", sa.String(length=32), nullable=False),
        sa.Column("label", sa.String(length=160), nullable=False),
        sa.Column("strategy_mode", sa.String(length=32), nullable=False),
        sa.Column("model_version", sa.String(length=64), nullable=False),
        sa.Column("period_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("period_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("trades_simulated", sa.Integer(), nullable=False),
        sa.Column("win_rate", sa.Float(), nullable=False),
        sa.Column("net_pnl_pct", sa.Float(), nullable=False),
        sa.Column("max_drawdown_pct", sa.Float(), nullable=False),
        sa.Column("decision_quality_score", sa.Float(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        schema="validation",
    )
    op.create_table(
        "activation_reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("review_id", sa.String(length=64), nullable=False, unique=True),
        sa.Column("target_type", sa.String(length=32), nullable=False),
        sa.Column("target_id", sa.String(length=64), nullable=False),
        sa.Column("proposed_value", sa.String(length=64), nullable=False),
        sa.Column("current_value", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("severity", sa.String(length=24), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("evidence_json", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("applied_at", sa.DateTime(timezone=True), nullable=True),
        schema="validation",
    )


def downgrade() -> None:
    op.drop_table("activation_reviews", schema="validation")
    op.drop_table("validation_runs", schema="validation")
