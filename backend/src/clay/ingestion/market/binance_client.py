from collections.abc import Sequence
from typing import Any

import httpx


class BinanceSpotClient:
    """Minimal REST client contract for Binance Spot market data."""

    def __init__(
        self,
        base_url: str = "https://api.binance.com",
        timeout: float = 10.0,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client = client

    async def fetch_klines(
        self,
        symbol: str,
        interval: str,
        limit: int = 200,
    ) -> Sequence[dict[str, Any]]:
        if self._client is not None:
            response = await self._client.get(
                f"{self.base_url}/api/v3/klines",
                params={"symbol": symbol, "interval": interval, "limit": limit},
                timeout=self.timeout,
            )
            response.raise_for_status()
            payload = response.json()
            return list(payload)

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/api/v3/klines",
                params={"symbol": symbol, "interval": interval, "limit": limit},
                timeout=self.timeout,
            )
            response.raise_for_status()
            payload = response.json()
            return list(payload)
