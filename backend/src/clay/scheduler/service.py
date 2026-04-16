from dataclasses import dataclass


@dataclass(frozen=True)
class WorkWindow:
    start: str = "09:00"
    end: str = "22:00"
