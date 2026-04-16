from clay.preflight.service import PreflightService
from clay.services.models import ServiceCriticality, ServiceStatus
from clay.services.registry import ServiceRegistry


def test_preflight_returns_pass_when_critical_services_are_healthy() -> None:
    registry = ServiceRegistry()
    registry.register("control-api", "api", ServiceCriticality.CRITICAL, "always-on")
    registry.update_status("control-api", ServiceStatus.HEALTHY)

    result = PreflightService(registry).run()

    assert result.status == "pass"


def test_preflight_returns_hard_fail_when_critical_service_is_down() -> None:
    registry = ServiceRegistry()
    registry.register("control-api", "api", ServiceCriticality.CRITICAL, "always-on")

    result = PreflightService(registry).run()

    assert result.status == "hard_fail"
