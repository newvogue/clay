from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Any, ClassVar

import httpx

from clay.ingestion.market.models import NormalizedMarketBar


class BybitApiError(Exception):
    """Bybit API returned ``retCode != 0`` in a successful HTTP response."""

    def __init__(self, ret_code: int, ret_msg: str) -> None:
        self.ret_code = ret_code
        self.ret_msg = ret_msg
        super().__init__(f"Bybit API error [{ret_code}]: {ret_msg}")


class BybitClient:
    """REST client for Bybit Spot market klines — E4 isolated adapter.

    Conforms structurally to ``MarketDataClient`` protocol.
    Zero wiring into bootstrap/ingestion until E5.
    """

    _INTERVAL_MAP: ClassVar[dict[str, str]] = {
        "1m": "1",
        "3m": "3",
        "5m": "5",
        "15m": "15",
        "30m": "30",
        "1h": "60",
        "2h": "120",
        "4h": "240",
        "6h": "360",
        "12h": "720",
        "1d": "D",
        "1w": "W",
        "1M": "M",
    }

    _INTERVAL_DURATION_MS: ClassVar[dict[str, int]] = {
        "1m": 60_000,
        "3m": 180_000,
        "5m": 300_000,
        "15m": 900_000,
        "30m": 1_800_000,
        "1h": 3_600_000,
        "2h": 7_200_000,
        "4h": 14_400_000,
        "6h": 21_600_000,
        "12h": 43_200_000,
        "1d": 86_400_000,
        "1w": 604_800_000,
    }

    def __init__(
        self,
        base_url: str = "https://api.bybit.com",
        timeout: float = 10.0,
        client: httpx.AsyncClient | None = None,
        source: str = "bybit_spot",
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client = client
        self.source = source

    def set_http_client(self, client: httpx.AsyncClient | None) -> None:
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
        mapped = self._map_interval(interval)

        if self._client is not None:
            return await self._do_fetch(self._client, symbol, mapped, limit)

        async with httpx.AsyncClient() as client:
            return await self._do_fetch(client, symbol, mapped, limit)

    async def _do_fetch(
        self,
        client: httpx.AsyncClient,
        symbol: str,
        interval: str,
        limit: int,
    ) -> list[list[Any]]:
        response = await client.get(
            f"{self.base_url}/v5/market/kline",
            params={
                "category": "spot",
                "symbol": symbol,
                "interval": interval,
                "limit": limit,
            },
            timeout=self.timeout,
        )
        response.raise_for_status()
        data = response.json()

        ret_code = data.get("retCode")
        if ret_code != 0:
            raise BybitApiError(
                ret_code=ret_code,
                ret_msg=data.get("retMsg", ""),
            )

        raw = data.get("result", {}).get("list", [])
        if raw:
            raw.reverse()
        return raw

    def _normalize_row(
        self,
        symbol: str,
        interval: str,
        row: Sequence[Any],
    ) -> NormalizedMarketBar:
        open_time_ms = int(row[0])
        duration_ms = self._interval_to_ms(interval)
        return NormalizedMarketBar(
            symbol=symbol,
            timeframe=interval,
            open=float(row[1]),
            high=float(row[2]),
            low=float(row[3]),
            close=float(row[4]),
            volume=float(row[5]),
            quote_volume=float(row[6]) if len(row) > 6 else None,
            source=self.source,
            bar_open_time=datetime.fromtimestamp(open_time_ms / 1000, tz=UTC),
            bar_close_time=datetime.fromtimestamp(
                (open_time_ms + duration_ms - 1) / 1000,
                tz=UTC,
            ),
        )

    @classmethod
    def _map_interval(cls, interval: str) -> str:
        mapped = cls._INTERVAL_MAP.get(interval)
        if mapped is None:
            msg = f"unknown interval: {interval!r}"
            raise ValueError(msg)
        return mapped

    @classmethod
    def _interval_to_ms(cls, interval: str) -> int:
        try:
            return cls._INTERVAL_DURATION_MS[interval]
        except KeyError:
            msg = (
                f"interval {interval!r} has variable duration — "
                f"cannot compute close_time"
            )
            raise ValueError(msg)
