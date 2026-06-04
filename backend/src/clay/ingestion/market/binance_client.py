from collections.abc import Sequence
from typing import Any

import httpx

from clay.ingestion.market.models import NormalizedMarketBar
from clay.ingestion.market.normalizer import normalize_kline_payload


class BinanceSpotClient:
    """Minimal REST client contract for Binance Spot market data.

    E1: conforms to ``MarketDataClient`` protocol — normalizes raw
    Binance kline arrays into ``NormalizedMarketBar`` internally.
    """

    def __init__(
        self,
        base_url: str = "https://api.binance.com",
        timeout: float = 10.0,
        client: httpx.AsyncClient | None = None,
        source: str = "binance_spot",
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client = client
        self.source = source

    def set_http_client(self, client: httpx.AsyncClient | None) -> None:
        """Late-binding setter for the shared lifespan-owned client.

        C2 (Wave C pre-D hardening): production wires one shared
        ``httpx.AsyncClient`` from the FastAPI lifespan
        (``api/lifespan.py`` startup) and injects it into the
        import-time ``BinanceSpotClient`` singleton via this method.
        Unit tests / scripts can still construct ``BinanceSpotClient()``
        with no injected client and rely on the per-call else-branch
        below for fallback (B4.5 contract pin).
        """
        self._client = client

    async def fetch_klines(
        self,
        symbol: str,
        interval: str,
        limit: int = 200,
    ) -> list[NormalizedMarketBar]:
        raw = await self._fetch_raw(symbol=symbol, interval=interval, limit=limit)
        return [self._normalize_row(symbol, interval, row) for row in raw]

    async def _fetch_raw(
        self,
        symbol: str,
        interval: str,
        limit: int = 200,
    ) -> list[list[Any]]:
        """Raw HTTP fetch — returns unparsed Binance kline arrays."""
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

    def _normalize_row(
        self,
        symbol: str,
        interval: str,
        row: Sequence[Any],
    ) -> NormalizedMarketBar:
        return normalize_kline_payload(
            {
                "symbol": symbol,
                "interval": interval,
                "kline": {
                    "t": row[0],
                    "o": row[1],
                    "h": row[2],
                    "l": row[3],
                    "c": row[4],
                    "v": row[5],
                    "T": row[6],
                    "q": row[7] if len(row) > 7 else None,
                },
            },
            source=self.source,
        )
