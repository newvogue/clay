"""Tests for the FastAPI lifespan context (B1 + B3a)."""

from __future__ import annotations

import pytest
from asgi_lifespan import LifespanManager

import clay.api.lifespan as lifespan_module
from clay.api.main import app
from clay.scheduler.service import ClayScheduler
from clay.settings.scheduler import SchedulerSettings


@pytest.mark.anyio
async def test_lifespan_starts_scheduler_by_default() -> None:
    """Boot order: startup → yield → shutdown без ошибок, scheduler started.

    Default (``CLAY_SCHEDULER_ENABLED`` unset → ``True``): the
    ``ClayScheduler`` is constructed and its ``start()`` is called.
    ``app.state.scheduler`` is the live scheduler instance; on
    LifespanManager exit, ``shutdown(wait=True)`` runs and the
    scheduler walks to ``STOPPED``.

    Использует module-level ``app`` (``clay.api.main:app``) и **не**
    пересобирает service graph — A6 rule: один factory call, никаких
    параллельных hand-rolled bundle'ов. LifespanManager вызывает
    startup до ``async with`` и shutdown после ``__aexit__``;
    exception'ы из lifespan тела re-raise'ятся, поэтому «shutdown
    выполнилась» проверяется самим фактом прохождения теста.
    """
    async with LifespanManager(app):
        assert app.state.started_at is not None
        assert isinstance(app.state.scheduler, ClayScheduler)


@pytest.mark.anyio
async def test_lifespan_skips_scheduler_when_disabled(monkeypatch: pytest.MonkeyPatch) -> None:
    """``CLAY_SCHEDULER_ENABLED=false`` → ``app.state.scheduler is None``.

    B0 / B3a dev-mode path: uvicorn ``--reload``, multi-worker
    guards, etc. The scheduler is **not** constructed; no
    ``AsyncIOScheduler`` is started. ``app.state.started_at`` is
    still stamped (it's a lifespan marker, not a scheduler marker).
    """
    monkeypatch.setattr(
        lifespan_module,
        "scheduler_settings",
        SchedulerSettings(enabled=False),
    )
    async with LifespanManager(app):
        assert app.state.scheduler is None
        assert app.state.started_at is not None
