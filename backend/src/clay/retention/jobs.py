RETENTION_WINDOWS_DAYS = {
    "market_bars": 730,
    "orderbook_summaries": 30,
    "market_features": 180,
    "news_items": 180,
    "sentiment_snapshots": 180,
    "connector_status_history": 180,
    "source_health_events": 180,
}


def retention_cutoff_days(table_name: str) -> int:
    return RETENTION_WINDOWS_DAYS[table_name]
