from collections.abc import Iterable

import httpx

from clay.db.repositories_market import MarketRepository
from clay.ingestion.market.models import NormalizedMarketBar
from clay.ingestion.market.protocol import MarketDataClient


class MarketIngestionService:
    """Coordinates market payload fetch and normalization.

    E1: depends on ``MarketDataClient`` protocol — any exchange
    adapter conforming to the protocol can be wired in.
    Normalization happens inside the adapter (not here).
    """

    def __init__(self, client: MarketDataClient) -> None:
        self.client = client

    def set_http_client(self, client: httpx.AsyncClient | None) -> None:
        """Late-binding pass-through to the underlying ``MarketDataClient``.

        C2 (Wave C pre-D hardening): this is the **real** inject path,
        not an optional helper. ``api/lifespan.py`` startup calls
        ``market_ingestion_service.set_http_client(http_client)`` to
        install the shared lifespan-owned client on the import-time
        singleton. ``ingestion_cycle_service`` (and therefore the
        scheduler-job and the ``POST /ingestion/run`` route) reach the
        same client through this single ``MarketIngestionService`` →
        ``MarketDataClient`` chain — no ``app.state.httpx_client``
        needed.
        """
        self.client.set_http_client(client)

    async def fetch_and_normalize(
        self,
        symbol: str,
        interval: str,
        limit: int = 200,
    ) -> list[NormalizedMarketBar]:
        return await self.client.fetch_klines(symbol=symbol, interval=interval, limit=limit)

    def persist_bars(
        self,
        repository: MarketRepository,
        bars: Iterable[NormalizedMarketBar],
    ) -> tuple[int, int]:
        """Persist bars; return ``(inserted, updated)`` (B5 counter split)."""
        return repository.upsert_market_bars(
            [bar.model_dump(mode="python") for bar in bars],
        )
