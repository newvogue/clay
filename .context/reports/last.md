# Report: B5 (Wave B / scheduler & lifespan — slice 5: IngestionCycleJob, async on loop with concurrency guard)

> **Сессия 2026-06-02/03.** Wave B progress: B0 + B1 + B2 + B3 + B4 + B4.5 + **B5 done ✅** (7/8 слайсов) + B6 (integration tests + ADR-007) pending. **236 passed** (216 → 236, +20 net). 0 регрессий. CLI-pyright: 189 errors (184 → 189, +5 — все 5 в новых test-файлах, pre-existing patterns).
>
> **B5** — `IngestionCycleJob` (async coroutine, registered via `_arun_safely`), `IngestionCycleService` (asyncio.Lock + is_running + emit-gating), `upsert_freshness_status → bool` (Поправка 2), counter split `market_records_inserted/updated` + computed `market_records_written`, manual route 409 на busy. **🔴 Обязательная правка fragment D** применена: `func=self._arun_safely` в `add_ingestion_cycle_job()`.
>
> **Следующий слайс Wave B:** B6 (integration tests + ADR-007) — финал.

---

**Slice:** B5 — `IngestionCycleJob` (async, scheduler-driven ingestion with concurrency guard).
**Дата:** 2026-06-02/03
**Агент:** M3 Free
**Приёмка:** ✅ done (B5 plan v2 RATIFIED + fragment D mandatory code fix applied; см. §Acceptance verification)

> **B5 done ✅** — `IngestionCycleJob` registered via `func=self._arun_safely` (async wrapper → event loop; НЕ `self._run_safely` per fragment D mandatory fix). `IngestionCycleService` + `asyncio.Lock` + `is_running` + `emit_cycle_events` (public). Manual route → 409 на `IngestionCycleBusy`. Two wrappers + shared `_handle_job_error` (B3b default / B4-on_error / B5-isolated error policies в одном месте, no duplication). `upsert_freshness_status → bool` (Поправка 2: anti-flood correctness). Counter split `market_records_inserted/updated` + computed `market_records_written` (backward-compat с pre-B5 `assert ... == 4`).
>
> **`pytest -q` → 216 → 236** (+20 net, +3 выше плана +17: 5 service + 10 job + 1 route + 4 scheduler = 20). **B5 closed**. **0 регрессий.**
>
> **CLI-pyright:** 184 → 189 (+5, все в test-файлах — pre-existing pattern `_FakeBinanceClient` / `_FakeSessionFactory` / `dict[str, int]` payload, см. §Deviations).

## Статус: **done** ✅

| Acceptance | Результат |
|---|---|
| pytest baseline зелёный (216 passed) | ✅ (236 passed) |
| +20 net tests (5 service + 10 job + 1 route + 4 scheduler) | ✅ все зелёные |
| `IngestionCycleService` + `asyncio.Lock` + `is_running` + emit-gating | ✅ service-level lock + emit-after-release |
| `IngestionRunSummary` + `market_records_inserted/updated` + `freshness_state_transitions` | ✅ counter split (computed `market_records_written`) |
| `IngestionCycleJob` async, B4 pattern (first-run, transition, `_failing` reset) | ✅ B4 carry-forward (Emma's #11) |
| `upsert_freshness_status` return `bool` (transition detected) | ✅ Поправка 2 — anti-flood correctness |
| **🔴 `ClayScheduler._run_safely` SYNC UNCHANGED** (B3b/B4 routing preserved) | ✅ Поправка 1 — нет regression в routing |
| **NEW `ClayScheduler._arun_safely` (async, для B5)** | ✅ mirror route 1:1 |
| **NEW shared `_handle_job_error`** (вынесен из обоих wrappers) | ✅ no duplication |
| **🔴 `add_ingestion_cycle_job()` → `func=self._arun_safely`** (НЕ `_run_safely`) | ✅ fragment D mandatory fix applied |
| Manual route → 409 при `is_running` | ✅ `HTTPException(409, "ingestion cycle already running")` |
| Scheduler job → skip+log при `is_running` | ✅ quiet (B4 #9 pattern) |
| `ClayScheduler.add_ingestion_cycle_job()` (4 deps + loud warning) | ✅ Q1 pattern apply (4 deps, имена в warning) |
| `start()` jobs (3 ids now) | ✅ Q2 pattern apply, `apscheduler.get_job()` |
| `SchedulerSettings.ingestion_enabled` (env `CLAY_SCHEDULER_INGESTION_ENABLED`) | ✅ independent flag |
| A6 invariant: `grep "import clay.bootstrap" backend/src/clay/scheduler/` | ✅ = 0 matches |
| 0 регрессий | ✅ 6.62s, 160 warnings (same as B4 baseline) |

## 1. Изменённые / новые файлы

| Файл | Статус | +/- | Notes |
|---|---|---|---|
| `backend/src/clay/db/repositories_market.py` | modified (B5) | +37 / -23 | `upsert_market_bars → (inserted, updated)` tuple; `upsert_freshness_status → bool` (Поправка 2: INSERT or state-change = True, timestamp-only = False) |
| `backend/src/clay/ingestion/market/service.py` | modified (B5) | +2 / -1 | `persist_bars → (inserted, updated)` tuple (counter split carry-through) |
| `backend/src/clay/ingestion/service.py` | modified (B5, near-rewrite) | +131 / -26 | `IngestionRunSummary` + `market_records_inserted/updated` (computed `market_records_written`); `IngestionCycleBusy` exception; `IngestionCycleService` + `asyncio.Lock` + `is_running` + `run_once(session, *, emit=True)` + `emit_cycle_events` public |
| `backend/src/clay/settings/scheduler.py` | modified (B5) | +5 / -0 | + `ingestion_enabled: bool = True` (env `CLAY_SCHEDULER_INGESTION_ENABLED`) |
| `backend/src/clay/scheduler/jobs.py` | modified (B5) | +235 / -0 | + `_IngestionCycleRunnable` Protocol + `IngestionCycleJob` (async, B4 pattern: DI + first-run seed + transition-diff на 2 полях `(incidents_present, freshness_state_transitions)` + `_failing` reset + isolated `on_error` + `is_running` short-circuit + `IngestionCycleBusy` race catch) |
| `backend/src/clay/scheduler/service.py` | modified (B5) | +260 / -100 | Sync `_run_safely` UNCHANGED (B3b/B4 routing preserved); **NEW** async `_arun_safely` (B5 ingestion routing); **NEW** shared `_handle_job_error`; `add_ingestion_cycle_job()` (3 gates + 4 deps loud warning); `start()` jobs (3 ids now); `ingestion_cycle_service` constructor kwarg |
| `backend/src/clay/scheduler/__init__.py` | modified (B5) | +8 / -2 | + re-export `IngestionCycleJob`, `ReliabilityRecheckJob` |
| `backend/src/clay/api/routes/ingestion.py` | modified (B5) | +9 / -5 | Manual route: try `service.run_once(session, emit=True)`; catch `IngestionCycleBusy` → `HTTPException(409, "ingestion cycle already running")`; drop redundant manual `audit_writer.write` / `event_bus.publish` (now owned by `service.emit_cycle_events` internal) |
| `backend/src/clay/api/lifespan.py` | modified (B5) | +2 / -0 | + pass `ingestion_cycle_service` to `ClayScheduler` |
| `backend/src/clay/bootstrap.py` | modified (B5) | +3 / -1 | + pass `audit_writer=audit_writer, event_bus=event_bus` to `IngestionCycleService` |
| `backend/tests/ingestion/test_ingestion_cycle_service.py` | **new** | +308 | 5 tests (default emit, emit=False, busy lock, freshness_state_transitions Поправка 2, counter split) |
| `backend/tests/scheduler/test_ingestion_cycle_job.py` | **new** | +485 | 10 tests (B4 pattern: run_calls_run_once, first_run, steady, transition, on_error×3, fail→success→fail, skip-when-running, race-IngestionCycleBusy) |
| `backend/tests/scheduler/test_clay_scheduler.py` | modified (B5) | +183 / -10 | + 4 tests (registered-when-enabled, not-registered-when-disabled, 3-ids payload, loud warning 4 deps); `_make_scheduler` helper extended (new `ingestion_cycle_service` kwarg) |
| `backend/tests/api/test_ingestion_route.py` | **new** | +77 | 1 test (manual route 409 when busy) |
| `backend/tests/db/test_ingestion_repositories.py` | modified (B5) | +1 / -1 | `assert written == 1` → `assert written == (1, 0)` (B5 tuple return) |

**Net:** 8 modified src, 3 new test files, 1 modified test. **+20 net tests** (216 → 236). ~+1740 LOC.

## 2. Ключевые фрагменты

### 2.1. `_arun_safely` + `_handle_job_error` (scheduler/service.py, B5 #1)

```python
def _run_safely(
    self,
    job_callable: Callable[[], None],
    *,
    on_error: Callable[[Exception], None] | None = None,
) -> None:
    """Sync exception-safe wrapper — REGISTERED AS SYNC with APScheduler → ThreadPoolExecutor.
    
    Used by B3b ``HealthTickJob`` and B4 ``ReliabilityRecheckJob``.
    Their sync DB-I/O MUST stay in the threadpool (B0 §11.1).
    """
    pre_status = self._registry.get(self._SERVICE_ID).status
    try:
        job_callable()
    except Exception as exc:
        self._handle_job_error(exc, pre_status, on_error)

async def _arun_safely(
    self,
    job_callable: Callable[[], Awaitable[None]],
    *,
    on_error: Callable[[Exception], None] | None = None,
) -> None:
    """Async exception-safe wrapper — REGISTERED AS COROUTINE with APScheduler → event loop.
    
    Used by B5 ``IngestionCycleJob``. Mirrors POST /ingestion/run
    1:1 (same sync-DB on loop that the manual route does in
    production today, per Emma's [MED-A] ratification).
    """
    pre_status = self._registry.get(self._SERVICE_ID).status
    try:
        await job_callable()
    except Exception as exc:
        self._handle_job_error(exc, pre_status, on_error)

def _handle_job_error(
    self,
    exc: Exception,
    pre_status: ServiceStatus,
    on_error: Callable[[Exception], None] | None,
) -> None:
    """Shared error-policy between sync and async wrappers."""
    if on_error is not None:
        # B4/B5: job owns its error policy (e.g. isolated ``_failing``
        # episode + dedicated audit verb; does NOT touch session-scheduler).
        on_error(exc)
        return
    # Default B3b path: session-scheduler → ERROR, audit on transition only.
    self._registry.update_status(
        self._SERVICE_ID, ServiceStatus.ERROR, error=str(exc),
    )
    if pre_status != ServiceStatus.ERROR:
        self._audit_writer.write(
            "service.status_changed",
            {
                "service_id": self._SERVICE_ID,
                "from": pre_status.value, "to": ServiceStatus.ERROR.value,
                "error": str(exc),
            },
        )
    logger.exception(
        "clay.scheduler: scheduled job raised; session-scheduler marked ERROR",
    )
```

### 2.2. `add_ingestion_cycle_job()` — 🔴 MANDATORY FRAGMENT D CODE FIX (scheduler/service.py, B5 #1)

```python
def add_ingestion_cycle_job(self) -> None:
    """Register the B5 ``IngestionCycleJob`` (flag-gated + 4-dep-checked)."""
    if not self._settings.ingestion_enabled:
        return
    missing = [
        name for name, value in (
            ("ingestion_cycle_service", self._ingestion_cycle_service),
            ("session_factory", self._session_factory),
            ("audit_writer", self._audit_writer),
            ("event_bus", self._event_bus),
        ) if value is None
    ]
    if missing:
        logger.warning(
            "clay.scheduler: ingestion_enabled=True but %s is None — "
            "ingestion-cycle job NOT registered (misconfiguration)",
            " and ".join(missing),
        )
        return
    job = IngestionCycleJob(
        ingestion_service=self._ingestion_cycle_service,  # type: ignore[arg-type]
        session_factory=self._session_factory,            # type: ignore[arg-type]
        audit_writer=self._audit_writer,
        event_bus=self._event_bus,
    )
    # 🔴 EMMA'S MANDATORY FRAGMENT D CODE FIX:
    # registered callable = ``self._arun_safely`` (async wrapper,
    # dispatches to event loop). The plan's fragment D contained
    # a stale ``self._run_safely`` (sync wrapper) which would
    # silently never await the coroutine — ingestion cycle
    # would never run. Routing matrix + text plan say
    # ``_arun_safely``; fragment D was the typo. Coding per
    # matrix, not per fragment D.
    self._apscheduler.add_job(
        func=self._arun_safely,
        trigger="interval",
        seconds=self._settings.ingestion_cycle_interval_seconds,
        id=self._INGESTION_CYCLE_JOB_ID,
        # executor=None (default = AsyncIOScheduler's own loop)
        # is the explicit B5 async-routing contract.
        max_instances=1,
        coalesce=True,
        replace_existing=True,
        args=[job.run],
        kwargs={"on_error": job.on_error},
    )
```

### 2.3. `upsert_freshness_status` → bool (repositories_market.py, B5 Поправка 2)

```python
def upsert_freshness_status(
    self,
    *,
    symbol: str,
    timeframe: str,
    freshness_state: str,
    evaluated_at: datetime,
    latest_bar_open_time: datetime | None,
    is_stale: bool,
) -> bool:
    """Upsert a freshness row; return ``True`` iff a state transition occurred.

    Semantics:
    * INSERT (no existing row) → True (first observation = transition).
    * UPDATE with same state → False (timestamp-only touch, no transition).
    * UPDATE with different state → True (real state change).
    """
    existing = self.session.scalar(
        select(MarketFreshnessStatus).where(
            MarketFreshnessStatus.symbol == symbol,
            MarketFreshnessStatus.timeframe == timeframe,
        ),
    )
    if existing is None:
        self.session.add(
            MarketFreshnessStatus(
                symbol=symbol, timeframe=timeframe,
                freshness_state=freshness_state, evaluated_at=evaluated_at,
                latest_bar_open_time=latest_bar_open_time, is_stale=is_stale,
            ),
        )
        self.session.flush()
        return True

    state_changed = existing.freshness_state != freshness_state
    existing.freshness_state = freshness_state
    existing.evaluated_at = evaluated_at
    existing.latest_bar_open_time = latest_bar_open_time
    existing.is_stale = is_stale
    self.session.flush()
    return state_changed
```

### 2.4. `IngestionCycleJob.run()` (scheduler/jobs.py, B4 pattern + B5 skip/race)

```python
async def run(self) -> None:
    """Execute one ingestion-cycle tick. See class docstring."""
    if self._service.is_running:
        logger.info("clay.scheduler: ingestion cycle already running, skip tick")
        return
    with self._session_factory() as session:
        try:
            summary = await self._service.run_once(session, emit=False)
        except IngestionCycleBusy:
            # TOCTOU race: a second caller grabbed the service's
            # lock between the ``is_running`` check and the
            # ``run_once`` call. Log and skip — do not propagate
            # to ``session-scheduler``.
            logger.info("clay.scheduler: ingestion cycle started mid-tick, skip")
            return
        session.commit()
    # B4 #11: a successful tick closes the failing episode so a
    # later failure re-emits ``ingestion.cycle_failed``.
    self._failing = False
    new_state = (
        bool(summary.incidents),
        summary.freshness_state_transitions,
    )
    if self._cache is None:
        # First run after process start — seed, do not emit.
        self._cache = new_state
        return
    if new_state == self._cache:
        # Steady state — Поправка 2 anti-flood correctness.
        return
    # Transition — emit through the public method.
    self._service.emit_cycle_events(summary)
    self._cache = new_state

def on_error(self, exc: Exception) -> None:
    """Isolated error policy — does NOT mutate session-scheduler."""
    if not self._failing:
        self._audit_writer.write(
            "ingestion.cycle_failed", {"error": str(exc)},
        )
    self._failing = True
    logger.exception(
        "clay.scheduler: ingestion cycle failed; "
        "session-scheduler NOT marked ERROR (isolated policy)",
    )
```

## 3. Routing matrix (3 jobs) — подтверждение

| Job | Wrapper registered with APScheduler | APScheduler sees | Runs in | Rationale |
|---|---|---|---|---|
| HealthTickJob (B3b) | `self._run_safely` (sync) | sync callable | ThreadPoolExecutor (`executor="default"`) | sync DB-I/O не блокирует loop (B0 §11.1) |
| ReliabilityRecheckJob (B4) | `self._run_safely` (sync) | sync callable | ThreadPoolExecutor | sync DB-I/O не блокирует loop |
| **IngestionCycleJob (B5)** | `self._arun_safely` (async) | coroutine function | event loop (default executor) | mirror `POST /ingestion/run` 1:1, sync-DB-on-loop = identical to route |

**Verification (test):** `tests/scheduler/test_clay_scheduler.py::test_ingestion_cycle_registered_when_enabled`:
```python
assert job.func.__qualname__ == scheduler._arun_safely.__qualname__
assert job.func.__name__ == "_arun_safely"
```

**Why two wrappers, not one async `inspect.isawaitable`:** the registered callable's signature (`sync def` vs `async def`) determines APScheduler's routing, NOT what the wrapper calls internally. A single `async def` wrapper would silently move B3b/B4 sync-DB onto the event loop (regression). Two wrappers + shared error-helper = correct routing + no duplication.

## 4. Acceptance verification

### 4.1. Pytest
```bash
$ cd /home/emma/Projects/clay/backend && uv run pytest -q
... 236 passed, 160 warnings in 6.62s
```
- Pre-B5: 216 passed. Post-B5: 236 passed (+20 net, +3 выше плана +17).
- +5 (test_ingestion_cycle_service.py) + +10 (test_ingestion_cycle_job.py) + +1 (test_ingestion_route.py) + +4 (test_clay_scheduler.py additions) = +20 net.
- `market_records_written` backward-compat: computed property `= inserted + updated`, все pre-B5 `assert ... == 4` тесты продолжают работать.
- 0 регрессий во всех 15 доменах (alpha / ai_control / api / db / demo / health / ingestion / integration / ops / reliability / runtime / scheduler / session_control / validation_lab / workspace).

### 4.2. Pyright (full project)
```bash
$ uvx --from pyright pyright
189 errors, 0 warnings, 0 informations
```
- B4.5 baseline: 184 errors. B5 baseline: 189 errors. **+5 new errors** — все в новых test-файлах, **pre-existing pattern** (`_FakeBinanceClient` not `BinanceSpotClient`, `_FakeSessionFactory` not `sessionmaker`, `dict[str, int]` not `dict[str, object]`). См. §Deviations.

### 4.3. A6 invariant
```bash
$ grep -r "import clay.bootstrap\|from clay.bootstrap" /home/emma/Projects/clay/backend/src/clay/scheduler/
(0 matches)
```
- Scheduler layer по-прежнему явно DI-only, без `bootstrap` import. ✅

### 4.4. Pyright на изменённых src-файлах
- `repositories_market.py` — 6 pre-existing errors (были до B5: `float(bar[...])` from `object` — не B5-изменение).
- `ingestion/market/service.py` — 1 pre-existing error.
- `ingestion/service.py` — 0 new errors.
- `scheduler/service.py` — 0 new errors (все pre-existing или унаследованные от B3a/B3b/B4).
- `scheduler/jobs.py` — 0 new errors.
- `api/routes/ingestion.py` — 0 new errors.
- `api/lifespan.py` — 0 new errors.
- `bootstrap.py` — 0 new errors.
- `settings/scheduler.py` — 0 new errors.
- `scheduler/__init__.py` — 0 new errors.

## 5. Architectural decisions (B5-specific)

1. **🔴 MANDATORY FRAGMENT D CODE FIX (Emma's ratify, applied):** `add_ingestion_cycle_job()` registers `func=self._arun_safely` (NOT `self._run_safely`). Sync wrapper would call `job.run()` → return coroutine → never await → silent no-op, ingestion cycle never runs. Routing matrix + text plan say `_arun_safely`; fragment D had a typo. **Coding per matrix.**
2. **Two wrappers + shared `_handle_job_error` (Поправка 1, applied):** sync `_run_safely` UNCHANGED (B3b/B4 → ThreadPoolExecutor); NEW async `_arun_safely` (B5 → event loop); shared `_handle_job_error` (B3b default / B4-on_error / B5-isolated в одном месте, no duplication).
3. **Freshness transition signal (Поправка 2, applied):** `upsert_freshness_status → bool` (INSERT or state-change = True, timestamp-only = False). `IngestionRunSummary.freshness_state_transitions: int` field. Steady state = 0 → no emit. ~10-50 audit/день (vs 23k/день флуда при count-based).
4. **Counter split (MED-C, applied):** `market_records_inserted` + `market_records_updated` (механическое разделение). `market_records_written` = computed property `= inserted + updated` для backward-compat с pre-B5 `assert ... == 4` тестами.
5. **asyncio.Lock + is_running (TOCTOU mitigation):** lock покрывает **весь `_do_run_once`** (market + context + commit). `is_running` property = `lock.locked()` (fast non-blocking check). Manual route → 409, scheduler-job → skip+log.
6. **`IngestionCycleBusy` exception:** raised когда lock held, caught в job (race) + route (→ 409). Job catches + logs (no re-raise, no `on_error` flip).
7. **Emit-gating:** `run_once(session, *, emit: bool = True)`. `emit=False` (scheduler) skip ТОЛЬКО audit+event, DB writes mandatory. Public `emit_cycle_events(summary)` — single source of payload (manual route + job anti-flood transition).
8. **Anti-flood signal = transition (NOT INSERT-based):** `(bool(incidents_present), freshness_state_transitions)` tuple. INSERT-based = флуд → НЕ primary signal. Steady = (0, 0) → no emit.
9. **4 deps Q1 loud warning:** `ingestion_cycle_service` + `session_factory` + `audit_writer` + `event_bus`. Pattern mirrors B4 Q1 (2 deps), wider surface.
10. **B4 #11 mandatory carry-forward:** `_failing` reset on success в `IngestionCycleJob.run()` step 3 (после `commit()`). `fail → success → fail` = 2 audit (Acceptance verified). Без reset — silent 2nd episode.

## 6. Deviations от плана (поля/типы отличаются)

**Net +20 tests, не +17** (план estimated +17):
- +5 service tests (было 4 в плане, +1 для counter split явный test)
- +10 job tests (было 8-9 в плане, +1 для race explicit + split fail-success-fail)
- +1 route test (plan ✓)
- +4 scheduler tests (plan ✓)
- Итого +20, не +17. Дополнительные тесты — explicit isolation катков сценариев, не дубликаты.

**CLI-pyright +5 new errors, не 0:**
- Все 5 в новых test-файлах (3 в `test_ingestion_cycle_job.py`, 1 в `test_ingestion_cycle_service.py`, 1 в `test_ingestion_route.py`).
- Patterns pre-existing: `_FakeBinanceClient` (no `BinanceSpotClient` inheritance) — same as `test_ingestion_api.py:189` и других test-файлов. `_FakeSessionFactory` (no `sessionmaker` type) — same as `test_reliability_recheck_job.py:204,337` (B4 backlog). `dict[str, int]` payload — same as audit_writer tests.
- **All match existing test-file patterns**; cleaned up in global `chore(types)` burn-down (separate slice per deaddrop backlog).

**`test_ingestion_repositories.py` modified (1 line):**
- `assert written == 1` → `assert written == (1, 0)`. Pre-B5 контракт на `int`; B5 — `tuple[int, int]` (counter split). Plan не упомянул явно эту правку, но она mechanical consequence от B5 (repositories_market.py change).

**`market_records_written` semantics:**
- Plan: computed property. Реализация: `@property` decorator на dataclass. Pre-B5 `assert summary.market_records_written == 4` тесты работают (computed). ✅

## 7. Backlog (NOT done, NOT in this slice)

- **B6 (integration tests + ADR-007)** — финальный slice Wave B. `LifespanManager` integration + архитектурная документация.
- **DB-level `UniqueConstraint`** для `news_items` + `sentiment_snapshots` — defense-in-depth (закроется когда single-worker assumption снимется).
- **Lifespan-owned `httpx.AsyncClient`** для `binance_client` (B4.5 v2 candidate) — кандидат на отдельный slice после B6.
- **Sync-DB → `asyncio.to_thread`** если DB-работа превысит loop budget (B0 mitigation, eventual).
- **`limit=200` wasteful fetch** в `_fetch_market_bars` (eventual: fetch только `bar_open_time > last_known`).
- **`_next_sqlite_market_bar_id` race** (pre-existing, MED) — B5 asyncio.Lock снижает вероятность, не устраняет.
- **`MarketRepository.upsert_market_bars` TOCTOU** (pre-existing, MED; asyncioLock снижает вероятность, не устраняет).
- **`ops.*` retention/rotation** (deaddrop долг, ~43k rows/месяц).
- **`chore(types)` burn-down** (184 → 184 pre-existing backlog + 5 B5 test-fake patterns = 189; одна правка для всех). Отдельный коммит после Wave B.
- **Manual `POST /ingestion/run` counter split in `as_payload()`** — `market_records_inserted` + `market_records_updated` + computed `market_records_written` (уже сделано, см. §2).
- **v2 candidate: explicit `ingestion.tick` event_bus publish** (reserved в B5 IngestionCycleJob.__init__).

## 8. Next step

1. **B5 review** (Emma diff review, `git show bf87c2c`).
2. **B6 task-packet** — `LifespanManager` integration tests + ADR-007 doc. Финальный slice Wave B.
3. (опц.) `chore(types)` commit для 5 B5 test-fake + 184 pre-existing patterns — отдельный burn-down slice.
4. После B6 → Wave B closed. → Wave C: planning (TBD).
