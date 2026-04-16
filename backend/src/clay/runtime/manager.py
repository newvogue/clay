from clay.runtime.states import RuntimeSnapshot, RuntimeState
from clay.runtime.transitions import get_allowed_transitions, validate_transition
from clay.services.models import ServiceCriticality, ServiceStatus
from clay.services.registry import ServiceRegistry


class RuntimeManager:
    """Owns the current runtime snapshot for the local control plane."""

    def __init__(
        self,
        initial_state: RuntimeState = RuntimeState.BACKGROUND_MONITORING,
        registry: ServiceRegistry | None = None,
    ) -> None:
        self._state = initial_state
        self.registry = registry or ServiceRegistry()

    def snapshot(self) -> RuntimeSnapshot:
        return RuntimeSnapshot(
            state=self._state,
            allowed_transitions=get_allowed_transitions(self._state),
        )

    @property
    def state(self) -> RuntimeState:
        return self._state

    def transition_to(self, target: RuntimeState) -> RuntimeState:
        validate_transition(self._state, target)
        if target is RuntimeState.PRE_SESSION:
            self._assert_critical_services_ready()
        self._state = target
        return self._state

    def enter_degraded(self) -> RuntimeState:
        self._state = RuntimeState.DEGRADED
        return self._state

    def _assert_critical_services_ready(self) -> None:
        for service in self.registry.list_services():
            if (
                service.criticality is ServiceCriticality.CRITICAL
                and service.status not in {ServiceStatus.HEALTHY, ServiceStatus.DEGRADED}
            ):
                raise RuntimeError(f"critical service {service.service_id} is not ready")
