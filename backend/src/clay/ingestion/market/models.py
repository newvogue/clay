from datetime import datetime

from pydantic import BaseModel


class NormalizedMarketBar(BaseModel):
    symbol: str
    timeframe: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    quote_volume: float | None
    source: str
    bar_open_time: datetime
    bar_close_time: datetime
