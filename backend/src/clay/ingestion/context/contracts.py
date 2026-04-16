from abc import ABC, abstractmethod
from typing import Any


class ContextConnector(ABC):
    connector_id: str
    connector_type: str
    source_name: str
    enabled: bool = True
    supports_symbols: bool = True

    @abstractmethod
    async def fetch(self) -> list[dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    def normalize(self, payload: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    async def health_check(self) -> dict[str, str]:
        raise NotImplementedError
