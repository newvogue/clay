from clay.services.models import ServiceRecord, ServiceStatus
from clay.services.registry import ServiceRegistry


class ServiceActionNotAllowedError(RuntimeError):
    """Raised when an operator attempts an unsafe lifecycle action."""


class ProcessSupervisor:
    """Minimal process lifecycle contract for managed Clay services."""

    def __init__(self, registry: ServiceRegistry) -> None:
        self.registry = registry

    def allowed_actions(self, service_id: str) -> tuple[str, ...]:
        record = self.registry.get(service_id)
        if record.service_id == "control-api":
            return tuple()

        actions: list[str] = ["restart"]
        if record.status is ServiceStatus.STOPPED:
            actions.insert(0, "start")
        else:
            actions.insert(0, "stop")
        return tuple(actions)

    def start(self, service_id: str) -> ServiceRecord:
        self.registry.update_status(service_id, ServiceStatus.STARTING)
        return self.registry.update_status(service_id, ServiceStatus.HEALTHY)

    def stop(self, service_id: str) -> ServiceRecord:
        self._assert_action_allowed(service_id, "stop")
        self.registry.update_status(service_id, ServiceStatus.STOPPING)
        return self.registry.update_status(service_id, ServiceStatus.STOPPED)

    def restart(self, service_id: str) -> ServiceRecord:
        self._assert_action_allowed(service_id, "restart")
        self.stop(service_id)
        return self.start(service_id)

    def _assert_action_allowed(self, service_id: str, action: str) -> None:
        record = self.registry.get(service_id)
        if record.service_id == "control-api":
            raise ServiceActionNotAllowedError(
                f"{action} is not allowed for the control-api service",
            )
