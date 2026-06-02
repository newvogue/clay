"""Tests for ``BinanceSpotClient``.

B4.5 contract pin: this is the first direct test of the binance client
(``MarketIngestionService`` is tested in ``test_ingestion_cycle.py`` via
``FakeBinanceClient``, which short-circuits the HTTP layer). The injected-
client path is the production path (``bootstrap.py`` wires
``BinanceSpotClient`` without injecting a client, but every caller in the
ingestion stack passes through the same ``get -> raise_for_status -> json``
sequence covered here).
"""

from __future__ import annotations

import httpx
import pytest

from clay.ingestion.market.binance_client import BinanceSpotClient


@pytest.mark.anyio
async def test_fetch_klines_returns_parsed_payload() -> None:
    """``fetch_klines`` parses ``/api/v3/klines`` JSON into a list."""
    expected_kline = [
        1711954800000,
        "70250.10",
        "70420.00",
        "70180.40",
        "70390.20",
        "123.45",
        1711955699999,
        "8670000.10",
    ]

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/v3/klines"
        return httpx.Response(200, json=[expected_kline])

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as mock_client:
        client = BinanceSpotClient(
            base_url="https://test.invalid",
            client=mock_client,
        )

        result = await client.fetch_klines(symbol="BTCUSDT", interval="5m", limit=1)

    assert result == [expected_kline]
