from datetime import UTC, datetime
from typing import Any

from clay.ingestion.market.models import NormalizedMarketBar


def normalize_kline_payload(payload: dict[str, Any]) -> NormalizedMarketBar:
    kline = payload["kline"]
    return NormalizedMarketBar(
        symbol=str(payload["symbol"]),
        timeframe=str(payload["interval"]),
        open=float(kline["o"]),
        high=float(kline["h"]),
        low=float(kline["l"]),
        close=float(kline["c"]),
        volume=float(kline["v"]),
        quote_volume=float(kline["q"]) if kline.get("q") is not None else None,
        source="binance_spot",
        bar_open_time=datetime.fromtimestamp(kline["t"] / 1000, tz=UTC),
        bar_close_time=datetime.fromtimestamp(kline["T"] / 1000, tz=UTC),
    )
