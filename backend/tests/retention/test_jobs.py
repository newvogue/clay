from clay.retention.jobs import retention_cutoff_days


def test_orderbook_retention_window_is_thirty_days() -> None:
    assert retention_cutoff_days("orderbook_summaries") == 30
