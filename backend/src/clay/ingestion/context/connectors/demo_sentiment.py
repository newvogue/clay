from datetime import UTC, datetime
from typing import Any

from clay.ingestion.context.contracts import ContextConnector


class DemoSentimentConnector(ContextConnector):
    connector_id = "demo-sentiment"
    connector_type = "sentiment"
    source_name = "demo_sentiment_feed"

    async def fetch(self) -> list[dict[str, Any]]:
        return [
            {
                "symbol": "BTCUSDT",
                "sentiment_label": "bullish",
                "sentiment_score": 0.68,
            },
        ]

    def normalize(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {
            "source_name": self.source_name,
            "symbol": str(payload["symbol"]),
            "sentiment_label": str(payload["sentiment_label"]),
            "sentiment_score": float(payload["sentiment_score"]),
            "captured_at": payload.get("captured_at", datetime.now(UTC)),
        }

    async def health_check(self) -> dict[str, str]:
        return {"status": "healthy"}
