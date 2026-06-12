"""Tests for ``AIAgentCycleJob`` (DEPLOY-5 / 5b-ii.2b-ii).

Coverage (6 test cases):

1. happy-path: fake runner → SQLite row with content/thinking, error NULL.
2. fail-loud: fake runner raises ModelUnavailableError → row with error, content NULL.
3. render: snapshot with mixed filled/empty fields → 7 sections, empties = "none".
4. executor-pin: ClayScheduler registers the job with executor="async".
5. flag-OFF: job NOT registered when ai_agent_enabled=False.
6. concurrency-guard: second run_once during lock = skip, no crash.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from unittest.mock import MagicMock

import pytest

from clay.ai_control.models import (
    AIControlSnapshot,
    AIControlSummary,
    FallbackSnapshot,
    ReviewCardSnapshot,
)
from clay.ai_control.runner import AgentRunResult, ModelUnavailableError
from clay.db.models_ops import AIAgentRun
from clay.scheduler.ai_agent_job import AIAgentCycleJob, _render_context
from clay.scheduler.service import ClayScheduler
from clay.settings.scheduler import SchedulerSettings

# ---------------------------------------------------------------------------
# Fake runner
# ---------------------------------------------------------------------------


@dataclass
class _FakeRunnerResult:
    content: str
    thinking: str | None = None
    model_id: str = "gemma4:e2b-it-qat"


class _FakeRunner:
    """Returns a canned result. Raise on a flag."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str]] = []
        self.result: _FakeRunnerResult = _FakeRunnerResult("hello world", "thinking...")
        self.raise_error: ModelUnavailableError | None = None

    async def run_agent(self, role_id: str, context: str) -> AgentRunResult:
        self.calls.append((role_id, context))
        if self.raise_error is not None:
            raise self.raise_error
        return AgentRunResult(
            role_id=role_id,
            model_id=self.result.model_id,
            content=self.result.content,
            thinking=self.result.thinking,
            messages=[],
        )


# ---------------------------------------------------------------------------
# Fake AIControlService for build_snapshot
# ---------------------------------------------------------------------------


class _FakeAIControlService:
    def __init__(self, snapshot: AIControlSnapshot) -> None:
        self._snapshot = snapshot

    def build_snapshot(self, session: Any = None) -> AIControlSnapshot:
        return self._snapshot


# ---------------------------------------------------------------------------
# Use existing conftest fixtures
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Snapshot builder helpers
# ---------------------------------------------------------------------------


def _empty_snapshot() -> AIControlSnapshot:
    return AIControlSnapshot(
        summary=AIControlSummary(
            overall_status="healthy",
            chief_agent_model="gemma4:e2b-it-qat",
            active_conflict_count=0,
            degraded_role_count=0,
            fallback_active=False,
            last_reviewed_at=None,
        ),
        roles=[],
        models=[],
        assignments=[],
        conflicts=[],
        fallback=FallbackSnapshot(
            fallback_active=False,
            local_fallback_ready=True,
            degraded_roles=[],
            operator_message="All systems nominal",
        ),
        pending_review=None,
    )


# ===================================================================
# TESTS
# ===================================================================


pytestmark = pytest.mark.anyio


class TestAIAgentCycleJob:
    """Tests for ``AIAgentCycleJob.run_once()``."""

    async def test_happy_path(
        self,
        sqlite_session_factory: Any,
    ) -> None:
        """Happy path: fake runner → row in ai_agent_runs with content/thinking, error NULL."""
        fake_runner = _FakeRunner()
        snapshot = _empty_snapshot()
        svc = _FakeAIControlService(snapshot)
        job = AIAgentCycleJob(
            runner=fake_runner,  # type: ignore[arg-type]
            session_factory=sqlite_session_factory,
            role_ids=["chief-agent"],
            ai_control_service=svc,  # type: ignore[arg-type]
        )
        await job.run_once()

        assert len(fake_runner.calls) == 1
        _, context = fake_runner.calls[0]
        assert "=== summary ===" in context

        session = sqlite_session_factory()
        try:
            rows = session.query(AIAgentRun).all()
            assert len(rows) == 1
            row = rows[0]
            assert row.role_id == "chief-agent"
            assert row.model_id == "gemma4:e2b-it-qat"
            assert row.content == "hello world"
            assert row.thinking == "thinking..."
            assert row.error is None
            assert row.created_at.tzinfo is not None
        finally:
            session.close()

    async def test_fail_loud(
        self,
        sqlite_session_factory: Any,
    ) -> None:
        """ModelUnavailableError → row with error string, content IS NULL."""
        fake_runner = _FakeRunner()
        fake_runner.raise_error = ModelUnavailableError("ollama down")
        snapshot = _empty_snapshot()
        svc = _FakeAIControlService(snapshot)
        job = AIAgentCycleJob(
            runner=fake_runner,  # type: ignore[arg-type]
            session_factory=sqlite_session_factory,
            role_ids=["chief-agent"],
            ai_control_service=svc,  # type: ignore[arg-type]
        )
        await job.run_once()

        session = sqlite_session_factory()
        try:
            rows = session.query(AIAgentRun).all()
            assert len(rows) == 1
            row = rows[0]
            assert row.error == "ollama down"
            assert row.content is None
            assert row.thinking is None
            assert row.model_id == "unresolved"
        finally:
            session.close()

    async def test_concurrency_guard(
        self,
        sqlite_session_factory: Any,
    ) -> None:
        """Second run_once while lock held → skip, no crash."""
        snapshot = _empty_snapshot()
        svc = _FakeAIControlService(snapshot)
        runner = _FakeRunner()
        job = AIAgentCycleJob(
            runner=runner,  # type: ignore[arg-type]
            session_factory=sqlite_session_factory,
            role_ids=["chief-agent"],
            ai_control_service=svc,  # type: ignore[arg-type]
        )
        # Acquire the lock, then try to run — should skip.
        await job._lock.acquire()
        await job.run_once()
        job._lock.release()

        assert len(runner.calls) == 0


class TestRenderContext:
    """Tests for ``_render_context()``."""

    def test_all_sections_present_empty_fields(self) -> None:
        """Empty lists and None pending_review render as ``none``."""
        ctx = _render_context(_empty_snapshot())
        assert ctx.startswith("=== summary ===")
        assert "=== roles ===" in ctx
        assert "=== models ===" in ctx
        assert "=== assignments ===" in ctx
        assert "=== conflicts ===" in ctx
        assert "=== fallback ===" in ctx
        assert "=== pending_review ===" in ctx
        # empty sections
        assert "  none" in ctx

    def test_pending_review_rendered(self) -> None:
        """pending_review not None renders details, not 'none'."""
        snap = _empty_snapshot()
        snap.pending_review = ReviewCardSnapshot(
            review_id="rev-1",
            role_id="chief-agent",
            role_name="Chief Agent",
            current_model_id="gemma4:e2b-it-qat",
            proposed_model_id="gemini-2.5-pro",
            proposed_model_name="Gemini 2.5 Pro",
            severity="warning",
            approval_required=True,
            blocks_apply=False,
            summary="Upgrade to Gemini",
            risks=["cost"],
            expected_effects=["better reasoning"],
            resulting_confidence_penalty=0.1,
            resulting_conflicts=[],
        )
        ctx = _render_context(snap)
        assert "review_id=rev-1" in ctx
        assert "current=gemma4:e2b-it-qat" in ctx


class TestClaySchedulerIntegration:
    """Flag-gating + executor-pin tests via ``ClayScheduler``."""

    def test_flag_off_does_not_register(self) -> None:
        """ai_agent_enabled=False → job NOT registered."""
        settings = SchedulerSettings(
            enabled=True,
            ai_agent_enabled=False,
            ops_retention_enabled=False,
        )
        scheduler = ClayScheduler(
            settings=settings,
            registry=MagicMock(),
            health_monitor=MagicMock(),
            audit_writer=MagicMock(),
            event_bus=MagicMock(),
        )
        scheduler._apscheduler = MagicMock()
        scheduler.add_ai_agent_cycle_job()
        scheduler._apscheduler.add_job.assert_not_called()

    def test_executor_is_async(self) -> None:
        """Registered with executor='async'."""
        settings = SchedulerSettings(
            enabled=True,
            ai_agent_enabled=True,
            ops_retention_enabled=False,
        )
        mock_job = MagicMock(spec=AIAgentCycleJob)
        scheduler = ClayScheduler(
            settings=settings,
            registry=MagicMock(),
            health_monitor=MagicMock(),
            audit_writer=MagicMock(),
            event_bus=MagicMock(),
            ai_agent_cycle_job=mock_job,
        )
        scheduler._apscheduler = MagicMock()
        scheduler.add_ai_agent_cycle_job()
        scheduler._apscheduler.add_job.assert_called_once()
        _kwargs = scheduler._apscheduler.add_job.call_args.kwargs
        assert _kwargs["executor"] == "async"
        assert _kwargs["id"] == "ai-agent-cycle"


class TestMultiRole:
    async def test_two_roles_produce_two_rows(
        self,
        sqlite_session_factory: Any,
    ) -> None:
        fake_runner = _FakeRunner()
        snapshot = _empty_snapshot()
        svc = _FakeAIControlService(snapshot)
        job = AIAgentCycleJob(
            runner=fake_runner,  # type: ignore[arg-type]
            session_factory=sqlite_session_factory,
            role_ids=["chief-agent", "forecast-model"],
            ai_control_service=svc,  # type: ignore[arg-type]
        )
        await job.run_once()

        assert len(fake_runner.calls) == 2
        assert fake_runner.calls[0][0] == "chief-agent"
        assert fake_runner.calls[1][0] == "forecast-model"

        session = sqlite_session_factory()
        try:
            rows = session.query(AIAgentRun).all()
            assert len(rows) == 2
            assert rows[0].role_id == "chief-agent"
            assert rows[1].role_id == "forecast-model"
            assert rows[0].error is None
            assert rows[1].error is None
        finally:
            session.close()

    async def test_isolation_role1_error_role2_persists(
        self,
        sqlite_session_factory: Any,
    ) -> None:
        fake_runner = _FakeRunner()
        # Simulate: role 1 fails, role 2 succeeds.
        call_count = 0

        original_run = fake_runner.run_agent

        async def patched_run(role_id: str, context: str) -> AgentRunResult:
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise ModelUnavailableError("role1 down")
            return await original_run(role_id, context)

        fake_runner.run_agent = patched_run  # type: ignore[method-assign]
        snapshot = _empty_snapshot()
        svc = _FakeAIControlService(snapshot)
        job = AIAgentCycleJob(
            runner=fake_runner,  # type: ignore[arg-type]
            session_factory=sqlite_session_factory,
            role_ids=["market-scanner", "forecast-model"],
            ai_control_service=svc,  # type: ignore[arg-type]
        )
        await job.run_once()

        assert call_count == 2
        session = sqlite_session_factory()
        try:
            rows = session.query(AIAgentRun).order_by(AIAgentRun.created_at).all()
            assert len(rows) == 2
            assert rows[0].role_id == "market-scanner"
            assert rows[0].error == "role1 down"
            assert rows[0].content is None
            assert rows[1].role_id == "forecast-model"
            assert rows[1].error is None
            assert rows[1].content == "hello world"
        finally:
            session.close()


class TestAIAgentRoleIdsParsing:
    def test_default_single_chief(self) -> None:
        settings = SchedulerSettings()
        assert settings.ai_agent_role_ids == ["chief-agent"]

    def test_json_env(self, monkeypatch) -> None:
        monkeypatch.setenv(
            "CLAY_SCHEDULER_AI_AGENT_ROLE_IDS",
            '["chief-agent","market-scanner","news-sentiment-agent"]',
        )
        settings = SchedulerSettings()
        assert settings.ai_agent_role_ids == [
            "chief-agent",
            "market-scanner",
            "news-sentiment-agent",
        ]

    def test_single_item_json(self, monkeypatch) -> None:
        monkeypatch.setenv("CLAY_SCHEDULER_AI_AGENT_ROLE_IDS", '["chief-agent"]')
        settings = SchedulerSettings()
        assert settings.ai_agent_role_ids == ["chief-agent"]
