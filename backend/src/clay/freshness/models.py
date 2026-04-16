from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class FreshnessResult:
    stream_name: str
    status: str
    observed_at: datetime
    blocks_active_trading: bool
    reason: str
