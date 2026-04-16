from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum


class ServiceStatus(StrEnum):
    STOPPED = "stopped"
    STARTING = "starting"
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    STALE = "stale"
    ERROR = "error"
    STOPPING = "stopping"


class ServiceCriticality(StrEnum):
    CRITICAL = "critical"
    IMPORTANT = "important"
    OPTIONAL = "optional"


@dataclass
class ServiceRecord:
    service_id: str
    service_type: str
    criticality: ServiceCriticality
    startup_policy: str
    status: ServiceStatus = ServiceStatus.STOPPED
    last_heartbeat_at: datetime | None = field(default=None)
    last_error: str | None = field(default=None)

    def heartbeat(self) -> None:
        self.last_heartbeat_at = datetime.now(UTC)
