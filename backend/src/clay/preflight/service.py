from clay.preflight.models import PreflightCheck, PreflightResult
from clay.services.models import ServiceCriticality, ServiceStatus
from clay.services.registry import ServiceRegistry


class PreflightService:
    """Evaluates whether the runtime can safely enter the next active phase."""

    def __init__(self, registry: ServiceRegistry) -> None:
        self.registry = registry

    def run(self) -> PreflightResult:
        checks: list[PreflightCheck] = []
        hard_fail = False

        for service in self.registry.list_services():
            if service.criticality is ServiceCriticality.CRITICAL:
                status = (
                    "ok"
                    if service.status in {ServiceStatus.HEALTHY, ServiceStatus.DEGRADED}
                    else "hard_fail"
                )
                checks.append(
                    PreflightCheck(service_id=service.service_id, status=status),
                )
                hard_fail = hard_fail or status == "hard_fail"

        return PreflightResult(
            status="hard_fail" if hard_fail else "pass",
            checks=checks,
        )
