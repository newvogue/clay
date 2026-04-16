"""Convert market tables to TimescaleDB hypertables."""

from alembic import op


revision = "0002_e2_hypertables"
down_revision = "0001_e2_baseline"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE market.market_bars
        DROP CONSTRAINT IF EXISTS market_bars_pkey;
        """,
    )
    op.execute(
        """
        ALTER TABLE market.market_bars
        ADD CONSTRAINT market_bars_pkey PRIMARY KEY (id, bar_open_time);
        """,
    )
    op.execute(
        """
        ALTER TABLE market.orderbook_summaries
        DROP CONSTRAINT IF EXISTS orderbook_summaries_pkey;
        """,
    )
    op.execute(
        """
        ALTER TABLE market.orderbook_summaries
        ADD CONSTRAINT orderbook_summaries_pkey PRIMARY KEY (id, captured_at);
        """,
    )
    op.execute(
        """
        SELECT public.create_hypertable(
            'market.market_bars',
            'bar_open_time',
            if_not_exists => TRUE,
            migrate_data => TRUE
        );
        """,
    )
    op.execute(
        """
        SELECT public.create_hypertable(
            'market.orderbook_summaries',
            'captured_at',
            if_not_exists => TRUE,
            migrate_data => TRUE
        );
        """,
    )


def downgrade() -> None:
    # TimescaleDB does not provide a clean downgrade path back to regular tables.
    pass
