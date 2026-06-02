"""Tests for the HealthMonitor factory wiring (B2)."""

from __future__ import annotations

from pathlib import Path

from clay.bootstrap import build_services
from clay.config.loader import ConfigLoader
from clay.config.paths import XdgPaths
from clay.health.monitor import HealthMonitor


def test_health_monitor_in_build_services(tmp_path: Path) -> None:
    """``HealthMonitor`` is built inside ``build_services`` and shares
    the production ``ServiceRegistry`` instance.

    Asserts the A6 single-factory contract: the health monitor
    constructed by the factory holds a reference to the **same**
    ``registry`` object that the rest of the service graph is built
    on top of — not a parallel bundle. ``session_factory=None`` keeps
    the test in-memory (the 5 A3-A5 services fall back to defaults;
    B2 only cares about the registry / HealthMonitor wiring).

    ``XdgPaths(tmp_path)`` isolates ``AuditWriter`` and config files
    from the developer's home directory.
    """
    paths = XdgPaths(
        config_dir=tmp_path,
        data_dir=tmp_path,
        state_dir=tmp_path,
        cache_dir=tmp_path,
    )
    config_loader = ConfigLoader(paths=paths)

    services = build_services(config_loader=config_loader, session_factory=None)

    assert "health_monitor" in services
    health_monitor = services["health_monitor"]
    assert isinstance(health_monitor, HealthMonitor)
    assert health_monitor.registry is services["registry"]
