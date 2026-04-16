from pydantic import BaseModel


class ShortlistMetricRow(BaseModel):
    symbol: str
    rolling_volume_score: float
    rolling_volatility_score: float
    liquidity_summary: str
    availability_status: str
