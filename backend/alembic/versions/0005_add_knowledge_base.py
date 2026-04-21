"""Add knowledge base tables."""

from alembic import op
import sqlalchemy as sa


revision = "0005_e10_knowledge"
down_revision = "0004_e9_review_feedback"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS knowledge")
    op.create_table(
        "knowledge_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False),
        sa.Column("priority", sa.String(length=16), nullable=False),
        sa.Column("tags_csv", sa.Text(), nullable=False),
        sa.Column("source_type", sa.String(length=32), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        schema="knowledge",
    )
    op.create_table(
        "knowledge_chunks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("chunk_text", sa.Text(), nullable=False),
        sa.Column("chunk_type", sa.String(length=24), nullable=False),
        sa.Column("token_estimate", sa.Float(), nullable=False),
        schema="knowledge",
    )


def downgrade() -> None:
    op.drop_table("knowledge_chunks", schema="knowledge")
    op.drop_table("knowledge_items", schema="knowledge")
