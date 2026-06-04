"""Add time-based indexes for ops retention pruning

Adds indexes on time columns for the three ops tables that grow
unboundedly so that ``DELETE WHERE <time_col> < cutoff`` is efficient:

* ``ops.ingest_runs(started_at)`` — new index (model lacked it)
* ``ops.connector_status_history(observed_at)`` — model declared
  ``index=True`` but Alembic never created it (divergence fix)
* ``ops.source_health_events(recorded_at)`` — same divergence fix

Revision ID: 0011_ops_retention_indexes
Revises: 0010_e2_source_in_identity
Create Date: 2026-06-04 12:45:00.000000
"""

from collections.abc import Sequence

from alembic import op


revision: str = "0011_ops_retention_indexes"
down_revision: str | None = "0010_e2_source_in_identity"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(
        "ix_ops_ingest_runs_started_at",
        "ingest_runs",
        ["started_at"],
        unique=False,
        schema="ops",
        postgresql_using="btree",
    )
    op.create_index(
        "ix_ops_connector_status_history_observed_at",
        "connector_status_history",
        ["observed_at"],
        unique=False,
        schema="ops",
        postgresql_using="btree",
    )
    op.create_index(
        "ix_ops_source_health_events_recorded_at",
        "source_health_events",
        ["recorded_at"],
        unique=False,
        schema="ops",
        postgresql_using="btree",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_ops_ingest_runs_started_at",
        table_name="ingest_runs",
        schema="ops",
    )
    op.drop_index(
        "ix_ops_connector_status_history_observed_at",
        table_name="connector_status_history",
        schema="ops",
    )
    op.drop_index(
        "ix_ops_source_health_events_recorded_at",
        table_name="source_health_events",
        schema="ops",
    )
