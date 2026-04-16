from datetime import UTC, datetime
from typing import Any

from clay.ingestion.context.contracts import ContextConnector


class DemoNewsConnector(ContextConnector):
    connector_id = "demo-news"
    connector_type = "news"
    source_name = "demo_news_feed"

    async def fetch(self) -> list[dict[str, Any]]:
        return [
            {
                "headline": "BTC holds breakout",
                "summary": "Market structure remains constructive in the short term.",
                "symbol": "BTCUSDT",
                "source_url": "https://example.invalid/news/btc-breakout",
            },
        ]

    def normalize(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {
            "source_name": self.source_name,
            "headline": str(payload["headline"]),
            "summary": payload.get("summary"),
            "published_at": payload.get("published_at", datetime.now(UTC)),
            "symbol": payload.get("symbol"),
            "source_url": payload.get("source_url"),
        }

    async def health_check(self) -> dict[str, str]:
        return {"status": "healthy"}
