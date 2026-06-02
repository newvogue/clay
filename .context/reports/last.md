# Report: B6 (Wave B finale — integration tests + ADR-007 packet)

> **Сессия 2026-06-03.** Wave B CLOSED ✅ (B0 + B1 + B2 + B3a + B3b + B4 + B4.5 + B5 + **B6** = 9/9 slices). **249 passed** (236 → 249, +13 net, 0 regressions, 11.37s). CLI-pyright: 189 errors (same as B5 baseline, 0 new src-errors; pre-existing test-fake type-debt in B4/B5 unit tests is in `chore(types)` burn-down backlog).
>
> **B6** — 13 integration tests in `tests/integration/test_scheduler_lifespan.py` verify the full scheduler layer through the FastAPI lifespan: 3 jobs registered, `session-scheduler` state walk, APScheduler STATE_RUNNING, **routing matrix (sync vs async, B5 fragment D fix integration-level confirm)**, `scheduler.started` / `scheduler.stopped` audit events, env-gate semantics (RELIABILITY_ENABLED / INGESTION_ENABLED), `app.state` reset, B3a soft-debt double-startup pin, real-tick smoke (health-tick interval=1s, 2.5s wait, `health.tick` on bus), 2 partial-failure anti-tests. ADR-007 packet: `handoffs/b6-adr-007-packet-2026-06-03.md` — extract for architect; agent does NOT write the ADR file.
>
> **B6 cleanup:** removed redundant `session.commit()` in `IngestionCycleJob.run()` — the commit already happens inside `IngestionCycleService._do_run_once` under the service's `asyncio.Lock` (`ingestion/service.py:177`). Prior commit was a harmless no-op; removed for clarity. B5 unit test updated accordingly.
>
> **Next:** Opus (architect) writes `docs/mission-control/adrs/adr-007-scheduler-side-effect-and-lifecycle-contract.md` from the packet. After ADR-007 lands: Wave B fully closed. Wave C planning TBD.
>
> **Two MANDATORY confirms (verified by B6 tests, cited in ADR-007 packet):**
> - **(a)** `scheduler.start()` runs **BEFORE** `app.state.scheduler = scheduler` in `api/lifespan.py:96-97`. If `start()` raises, `app.state.scheduler` remains `None` (from guard on `lifespan.py:80`). Pinned by `test_startup_failure_keeps_state_clean` (#12).
> - **(b)** `registry.update_status(...)` in `services/registry.py:32-40` is a **pure mutation** (no `audit_writer.write` inside). `service.status_changed` audit is written by call-sites only (`ClayScheduler._handle_job_error`, `HealthTickJob.run`). `bootstrap.py:148` `update_status("control-api", HEALTHY)` is **silent** — current behaviour, open question for ADR-007.

---

**Slice:** B6 — Wave B finale (integration tests + ADR-007 packet).
**Дата:** 2026-06-03
**Агент:** M3 Free
**Приёмка:** ✅ done (236 → 249 passed, +13 net, 0 regressions, 0 new src-errors pyright; **1 коммит** `6af56a3` поверх `eba64bb`).

## Статус: **done** ✅

| Acceptance | Результат |
|---|---|
| pytest baseline (236 passed) | ✅ (249 passed, +13 net) |
| 13 integration tests в `tests/integration/test_scheduler_lifespan.py` | ✅ все зелёные (3.69s изолированно) |
| Routing matrix на живом scheduler (sync vs async) | ✅ `inspect.iscoroutinefunction` подтверждает `_run_safely` для sync jobs, `_arun_safely` для ingestion-cycle |
| Partial-failure anti-tests (#12 startup, #13 shutdown) | ✅ инварианты и minor quirks запинены |
| Confirm (a) verified: `scheduler.start()` ДО `app.state.scheduler = scheduler` | ✅ `lifespan.py:96-97` + тест #12 |
| Confirm (b) verified: `registry.update_status` — pure mutation, без audit | ✅ `services/registry.py:32-40` + recon §5 |
| asyncio.Lock оборачивает весь `_do_run_once` (B5 verify) | ✅ `ingestion/service.py:145-146` (market + context + commit под lock) |
| Лишний `session.commit()` в `IngestionCycleJob.run()` убран | ✅ `scheduler/jobs.py` — comment + dead code removed |
| ADR-007 packet extracted в `handoffs/b6-adr-007-packet-2026-06-03.md` | ✅ 12 sections, ~30KB, ready for Opus |
| CLI-pyright: 0 new src-errors | ✅ 189 = B5 baseline (pre-existing test-fake type-debt, `chore(types)` backlog) |
| 0 regressions | ✅ 11.37s, 849 warnings (B5: 160, +689 mostly from real-tick smoke test polling) |
| 1 коммит B6 | ✅ `6af56a3` (4 files, +856/-6) |

## 1. Изменённые / новые файлы

| Файл | Статус | +/- | Notes |
|---|---|---|---|
| `backend/tests/integration/test_scheduler_lifespan.py` | **new** | +461 | 13 integration тестов; изоляция через `build_services_for_integration(tmp_path)` + monkeypatch `lifespan_module` deps; `@pytest.mark.anyio` async |
| `backend/src/clay/scheduler/jobs.py` | modified (B6 cleanup) | +5 / -3 | Удалён `session.commit()` после `run_once()` (B5 dead code — `_do_run_once` уже коммитит под `asyncio.Lock`); комментарий объясняет |
| `backend/tests/scheduler/test_ingestion_cycle_job.py` | modified (B6 cleanup) | +5 / -3 | `test_run_calls_run_once_emit_false_and_commits`: убран `assert factory.sessions[0].committed is True` (больше не применимо — commit в `_do_run_once`); docstring обновлён |
| `.context/handoffs/b6-adr-007-packet-2026-06-03.md` | **new** | +new | 12-секционный packet для Opus: lifespan contract, audit chokepoint, env-gate surface, job registration matrix, side-effect-free precondition, partial-failure matrix, single-worker assumption, lifespan side-effect boundary, B6 test index, 5 open questions, B6 commit scope |

**Net:** 1 new test file (461 LOC), 1 src cleanup (5 net), 1 test update (5 net), 1 packet (~30KB). **+13 net tests** (236 → 249).

## 2. Ключевые фрагменты

### 2.1. Изоляция через monkeypatch + `build_services_for_integration` (test_scheduler_lifespan.py:96-122)

```python
@pytest.fixture
def isolated_app(monkeypatch, tmp_path):
    services = build_services_for_integration(tmp_path)
    app = create_app()

    # Redirect every ``lifespan`` module-level dep to the isolated service.
    # Lifespan reads these names at runtime (not import time) — so the
    # monkeypatch on the module attribute wins.
    monkeypatch.setattr(lifespan_module, "_audit_writer", services["audit_writer"])
    monkeypatch.setattr(lifespan_module, "_event_bus", services["event_bus"])
    monkeypatch.setattr(lifespan_module, "_health_monitor", services["health_monitor"])
    monkeypatch.setattr(lifespan_module, "_ingestion_cycle_service", services["ingestion_cycle_service"])
    monkeypatch.setattr(lifespan_module, "_registry", services["registry"])
    monkeypatch.setattr(lifespan_module, "_reliability_service", services["reliability_service"])
    monkeypatch.setattr(lifespan_module, "_session_factory", services["session_factory"])
    monkeypatch.setattr(lifespan_module, "scheduler_settings", services["scheduler_settings"])

    return app, services
```

**Why not `app_with_sqlite` conftest fixture:** `app_with_sqlite` использует `dependency_overrides`, которые НЕ перехватывают **module-level imports** в `lifespan.py:55-64` (8 deps из `clay.bootstrap` как module-level константы). `monkeypatch` на module-level атрибуты — единственный способ изолировать scheduler-deps. **`dependency_overrides` изолируют только route-deps** (`get_db_session`, `get_ingestion_settings`).

### 2.2. Routing matrix — integration-level confirm (test_scheduler_lifespan.py:108)

```python
@pytest.mark.anyio
async def test_routing_matrix_sync_vs_async(isolated_app) -> None:
    """§3 routing on the live scheduler:
    * health-tick + reliability-recheck → sync _run_safely → ThreadPoolExecutor
    * ingestion-cycle → async _arun_safely → event loop

    This is the integration-level confirmation of Emma's B5 fragment D
    mandatory code fix — a sync wrapper around an ``async def`` would
    silently never await the coroutine, leaving ingestion dead.
    """
    app, _ = isolated_app
    async with LifespanManager(app):
        apscheduler = app.state.scheduler._apscheduler
        for job_id in (HEALTH_TICK, RELIABILITY_RECHECK):
            job = apscheduler.get_job(job_id)
            assert job is not None
            assert not inspect.iscoroutinefunction(job.func)
        ingestion_job = apscheduler.get_job(INGESTION_CYCLE)
        assert ingestion_job is not None
        assert inspect.iscoroutinefunction(ingestion_job.func)
```

**Detection:** `inspect.iscoroutinefunction(job.func)` — проверяет, является ли зарегистрированный callable `async def` функцией. Это определяет APScheduler routing (sync → threadpool, async → event loop), **не то, что wrapper вызывает внутри**. `__qualname__` (B5 unit-test pattern) тоже работает, но `iscoroutinefunction` семантически точнее.

### 2.3. Partial-failure anti-test #12 — confirm (a) invariant (test_scheduler_lifespan.py:368)

```python
@pytest.mark.anyio
async def test_startup_failure_keeps_state_clean(
    isolated_app, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Partial-failure anti-test (B6 §9 #12). If a step inside
    ClayScheduler.start() raises, the LifespanManager re-raises,
    app.state.scheduler stays None (confirm (a) invariant:
    scheduler.start() runs BEFORE app.state.scheduler = scheduler
    in lifespan.py:96-97), and scheduler.started is **not**
    written to the audit log."""
    app, services = isolated_app
    audit_path = services["audit_writer"].path

    def failing_add_health_tick(self) -> None:
        raise RuntimeError("injected startup failure (B6 #12)")

    monkeypatch.setattr(ClayScheduler, "add_health_tick_job", failing_add_health_tick)

    with pytest.raises(RuntimeError, match="injected startup failure"):
        async with LifespanManager(app):
            pass  # body never reached — startup raised

    # confirm (a) invariant: app.state.scheduler is None (from the
    # guard on lifespan.py:80; line 97 never executes because
    # scheduler.start() raised on line 96).
    assert app.state.scheduler is None

    if audit_path.exists():
        events = _read_audit_events(audit_path)
        started = _events_by_type(events, "scheduler.started")
        assert len(started) == 0
```

**Monkeypatching strategy:** `ClayScheduler.add_health_tick_job` (class-level) — affects all instances. Класс-уровень лучше instance-уровня: (1) применяется ко всем future instances в тесте, (2) `monkeypatch` cleanup автоматически (откатывает на teardown).

### 2.4. B6 cleanup — лишний `session.commit()` (scheduler/jobs.py:402-410)

```python
        with self._session_factory() as session:
            try:
                summary = await self._service.run_once(session, emit=False)
            except IngestionCycleBusy:
                logger.info("clay.scheduler: ingestion cycle started mid-tick, skip")
                return
        # B6 cleanup: the prior ``session.commit()`` here was a
        # harmless no-op — ``IngestionCycleService._do_run_once``
        # already commits under its own ``asyncio.Lock``
        # (ingestion/service.py:177). The outer session is left
        # open until the ``with`` block exits; no explicit commit
        # is needed here.
        # B4 #11: a successful tick closes the failing episode so a
        # later failure re-emits ``ingestion.cycle_failed``.
```

**Why this is dead code:** `run_once` (line 145-151) `await self._do_run_once(session)` (line 146) под `async with self._lock:` — `_do_run_once` (line 153-178) делает `session.commit()` (line 177) ВНУТРИ lock. После release (line 147), `run_once` возвращает `summary`. Повторный `session.commit()` — SQLAlchemy no-op (на уже-committed session). Dead code, убран для clarity.

## 3. Routing matrix (3 jobs) — финальная проверка на живом scheduler

| Job | Wrapper | APScheduler sees | Runs in | Test |
|---|---|---|---|---|
| `health-tick` (B3b) | `ClayScheduler._run_safely` (sync) | sync callable | `ThreadPoolExecutor` (`executor="default"`) | ✅ `test_routing_matrix_sync_vs_async` (not `iscoroutinefunction`) |
| `reliability-recheck` (B4) | `ClayScheduler._run_safely` (sync) | sync callable | `ThreadPoolExecutor` | ✅ (same) |
| `ingestion-cycle` (B5) | `ClayScheduler._arun_safely` (async) | coroutine function | `AsyncIOScheduler` event loop (`executor=None`) | ✅ (`iscoroutinefunction`) |

**Fragment D fix integration-level confirmation:** B5 plan v2 ratified `_arun_safely` для ingestion-cycle (sync wrapper бы silently не await'нул coroutine → ingestion cycle не исполняется). B6 test inspect'ит `job.func` на запущенном scheduler и подтверждает, что routing matrix в коде = routing matrix в B5 plan = `_run_safely` для sync jobs + `_arun_safely` для async job. **Не требуется future regression-тест** — этот тест уже pinned.

## 4. Acceptance verification

### 4.1. Pytest

```bash
$ cd /home/emma/Projects/clay/backend && uv run pytest -q
249 passed, 849 warnings in 11.37s
```

- Pre-B6: 236 passed. Post-B6: 249 passed (+13 net).
- +13 в `tests/integration/test_scheduler_lifespan.py` (1 new test file).
- 0 regressions во всех 16 доменах (alpha / ai_control / api / db / demo / health / ingestion / integration / ops / reliability / runtime / scheduler / session_control / validation_lab / workspace + новый integration).
- Runtime: 11.37s (B5: 8.01s; +3.36s за счёт real-tick smoke test #11 ждёт 2.5s + APScheduler startup/shutdown overhead × 13 тестов).

### 4.2. Pyright (full project)

```bash
$ uvx --from pyright pyright
189 errors, 0 warnings, 0 informations
```

- B5 baseline: 189 errors. B6 baseline: 189 errors. **0 new errors.**
- Pre-existing patterns: `_FakeSessionFactory` (B4), `_FakeBinanceClient` (B5), `dict[str, int]` payload (B4/B5), `repositories_market.py:45-51` (B5-pre), `ingestion/market/service.py:23` (B5-pre). Все pre-existing.
- **Tracked in:** `chore(types)` burn-down backlog (deaddrop.md, separate session after Wave B).

### 4.3. Routing matrix на живом scheduler

```bash
$ uv run pytest tests/integration/test_scheduler_lifespan.py::test_routing_matrix_sync_vs_async -v
tests/integration/test_scheduler_lifespan.py::test_routing_matrix_sync_vs_async[asyncio] PASSED
```

✅ Confirmed: `health-tick.func` и `reliability-recheck.func` — sync (`not iscoroutinefunction`); `ingestion-cycle.func` — async (`iscoroutinefunction`). Routing matrix в коде = routing matrix в B5 plan.

### 4.4. Confirm (a) на живом lifespan

```bash
$ uv run pytest tests/integration/test_scheduler_lifespan.py::test_startup_failure_keeps_state_clean -v
tests/integration/test_scheduler_lifespan.py::test_startup_failure_keeps_state_clean[asyncio] PASSED
```

✅ Confirmed: `scheduler.start()` runs BEFORE `app.state.scheduler = scheduler` (`lifespan.py:96-97`). При raise в `start()` → `app.state.scheduler is None` (от guard `lifespan.py:80`) + `scheduler.started` не в audit (raise на line 171, audit на line 184 — unreachable).

### 4.5. Confirm (b) через recon + code read

✅ `services/registry.py:32-40`:
```python
def update_status(self, service_id, status, error=None) -> ServiceRecord:
    record = self._services[service_id]
    record.status = status
    record.last_error = error
    return record
```
**Нет `audit_writer.write` внутри.** Pure mutation. `bootstrap.py:148` `registry.update_status("control-api", HEALTHY)` — silent. `service.status_changed` audit пишется **только** call-sites: `ClayScheduler._handle_job_error` (per-tick exception), `HealthTickJob.run` (per-tick transition).

## 5. Architectural decisions (B6-specific)

1. **B6 = integration tests only, NOT ADR-007 file** (per Q11 in `to-architect-snapshot-2026-06-01.md:966` and Opus ratification 2026-06-03). Agent creates packet (`handoffs/b6-adr-007-packet-2026-06-03.md`); Opus writes `docs/mission-control/adrs/adr-007-scheduler-side-effect-and-lifecycle-contract.md` (architect's deliverable, per `docs/mission-control/adrs/adr-001..005` convention).
2. **Isolation: `build_services_for_integration(tmp_path)` + monkeypatch `lifespan_module` deps** (NOT pure `app_with_sqlite` conftest fixture, NOT production `app`). Rationale: `dependency_overrides` изолируют **только route-deps**; `lifespan` тянет scheduler-deps как **module-level imports** from `clay.bootstrap` — `monkeypatch` на module-level атрибуты — единственный способ.
3. **13 тестов = Standard 9 + 4 точечных (apscheduler.state + routing matrix + real-tick smoke + 2 partial-failure)**. Routing matrix — бонус сверх плана (Standard+5 → 14 в плане, реализовано 13; один объединён с real-tick smoke).
4. **Confirm (a) + (b) verified** before any code write. Recon (§1, §5) дал детали; B6 tests пинят invariants. Confirm (a) → startup-failure anti-test #12. Confirm (b) → recon §5 explicit statement + ADR-007 packet §1.1 open question.
5. **B6 cleanup: redundant `session.commit()` removed** from `IngestionCycleJob.run()`. B5 unit test updated (`assert factory.sessions[0].committed is True` removed; docstring updated). This is the "minor cleanup" Emma mentioned in B6 task-packet §4.
6. **Partial-failure modes pinned, NOT fixed.** Тесты #12 и #13 документируют **текущее** поведение (включая #13 minor reference-leak quirk). Fix candidate для ADR-007 (Opus решает).
7. **B3a soft debt #10 (double-startup) pinned, NOT fixed.** `test_double_startup_does_not_crash` (B6 #10) фиксирует текущее поведение (duplicate `scheduler.started` audit) для future fix без regression.

## 6. Deviations от плана

**Net +13 тестов, не +12** (план estimated 12):
- Standard 9: jobs registered, state walk, audit started, audit stopped, env-gate reliability, env-gate ingestion, app.state reset, double-startup, real-tick smoke = 9 ✅
- Comprehensive 5: apscheduler.state, routing matrix, partial-failure startup, partial-failure shutdown = 4 (routing matrix объединён в Standard по §3 routing requirement, не "Comprehensive")
- Итого: 9 + 4 = 13. Один тест из плана объединён (routing matrix — B5 fragment D confirm, ценен как integration-level pin).

**Confirm (a) + (b) + asyncio.Lock + dead code cleanup — ВСЕ выполнены.**

**CLI-pyright: 0 new errors** (план estimated 0).

## 7. Backlog (NOT done, NOT in this slice)

- **ADR-007 file** `docs/mission-control/adrs/adr-007-*.md` — Opus пишет из packet'а.
- **ADR-006** (in-memory/runtime-state choices) — Opus' backlog, не блокирует B6.
- **`chore(types)` burn-down** — 189 pyright errors (все pre-existing test-fake patterns). Отдельная сессия после Wave B.
- **Full 12-commit logical split** (git history) — `git reset --soft bf87c2c~1` + N коммитов A1/A2/A2.5/A3/A4/A5/A5.5/A6/B0/B1/B2/B3a/B3b/B4/B4.5/B5. Отдельная git-сессия (Emma's call, B6 не блокирует).
- **B3a soft debt #10 fix** (`start()` idempotency) — pinned by B6 #10, fix candidate.
- **B6 #13 reference-leak fix** (wrap `shutdown` in `try/except` in lifespan's `finally:`) — ADR-007 candidate.
- **Lifespan-owned `httpx.AsyncClient`** for `binance_client` (B4.5 v2) — separate slice.
- **DB-level `UniqueConstraint`** for `news_items` + `sentiment_snapshots` — defense-in-depth, deferred until single-worker assumption lifted.
- **`_next_sqlite_market_bar_id` race** + **`MarketRepository.upsert_market_bars` TOCTOU** — pre-existing MED, partially mitigated by B5 `asyncio.Lock`, full fix deferred.

## 8. Next step

1. **Emma reviews B6 commit** `6af56a3` (или отклоняет — тогда чиню).
2. **Opus пишет ADR-007** из `handoffs/b6-adr-007-packet-2026-06-03.md` → `docs/mission-control/adrs/adr-007-scheduler-side-effect-and-lifecycle-contract.md`.
3. **Wave B formally closed** после ADR-007 landing.
4. **Wave C planning** (TBD) — next engineering wave.

---

## Appendix: Commit hygiene (per Флаг 1)

**Pre-B6 HEAD:** `eba64bb chore(wave-ab): commit remaining A1-B4 source + scheduler deps to make HEAD buildable` (throwaway, 65 files, +9835/-57).

**B6 commit:** `6af56a3 test(scheduler): B6 integration tests + ADR-007 packet` (4 files, +856/-6).

**Working tree:** clean. `git status` empty.

**Branch state:** опережает `origin/main` на 3 коммита (`bf87c2c` + `eba64bb` + `6af56a3`). Push — Emma's call.

**Future cleanup:** planned `git reset --soft bf87c2c~1` + N logical commits (12 по Emma's ratify). Out of scope for B6.
