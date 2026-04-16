from clay.services.models import ServiceCriticality, ServiceStatus
from clay.services.registry import ServiceRegistry


def test_registry_exposes_registered_services() -> None:
    registry = ServiceRegistry()
    registry.register(
        service_id="market-data-service",
        service_type="worker",
        criticality=ServiceCriticality.CRITICAL,
        startup_policy="background-critical",
    )

    services = registry.list_services()

    assert len(services) == 1
    assert services[0].status == ServiceStatus.STOPPED


def test_registry_can_mark_service_degraded() -> None:
    registry = ServiceRegistry()
    registry.register(
        service_id="control-api",
        service_type="api",
        criticality=ServiceCriticality.CRITICAL,
        startup_policy="always-on",
    )

    registry.update_status("control-api", ServiceStatus.DEGRADED)

    assert registry.get("control-api").status == ServiceStatus.DEGRADED
