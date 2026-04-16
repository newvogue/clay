from clay.services.models import ServiceCriticality, ServiceRecord, ServiceStatus


class ServiceRegistry:
    """Tracks service metadata and current runtime status."""

    def __init__(self) -> None:
        self._services: dict[str, ServiceRecord] = {}

    def register(
        self,
        service_id: str,
        service_type: str,
        criticality: ServiceCriticality,
        startup_policy: str,
    ) -> ServiceRecord:
        record = ServiceRecord(
            service_id=service_id,
            service_type=service_type,
            criticality=criticality,
            startup_policy=startup_policy,
        )
        self._services[service_id] = record
        return record

    def get(self, service_id: str) -> ServiceRecord:
        return self._services[service_id]

    def list_services(self) -> list[ServiceRecord]:
        return sorted(self._services.values(), key=lambda item: item.service_id)

    def update_status(
        self,
        service_id: str,
        status: ServiceStatus,
        error: str | None = None,
    ) -> ServiceRecord:
        record = self._services[service_id]
        record.status = status
        record.last_error = error
        return record
