---
date: 2026-06-03
from: architect
status: ACTIVE — **Wave C: C1 ✅ C2 ✅ (code done)**. C3 (asyncio.to_thread) next — pending Emma ratify of C2 + погнали.
slice: **C2 — lifespan-owned httpx.AsyncClient (HIGH-2 + MED-3)**. Code done: commit `f10636e`. 6 source+test changed, 296 LOC net. pytest 261 (+6 net, 0 regress). Pyright 189 (0 new).
source_of_truth: Architect Working Log (Notion, owned by Emma)
---

# Active Task-packet: Wave C (hardening) — C2 code done ✅

> **Wave B formally closed ✅ (push done). Wave C:**
> - ✅ **C1 — DB UniqueConstraint** (idempotency / HIGH-1) — commit `53b649f`, 255→249
> - ✅ **C2 — lifespan-owned httpx.AsyncClient** (HIGH-2 + MED-3) — commit `f10636e`, 261→255 (0 regress)
> - ⏳ **C3 — asyncio.to_thread для sync-DB** (MED-4) — waiting on next slice
> - ⏳ **C4 — ops.* retention** (severable tail)
>
> C2: один lifespan-owned httpx.AsyncClient с explicit Limits(max_connections=20,
> keepalive=10), создаётся ДО scheduler.start(), late-binding setter на
> MarketIngestionService singleton, aclose() строго ПОСЛЕ scheduler.shutdown(wait=True)
> (MED-3). Emma's 🔴 mandatory fix (гид в finally) + 🟡 test pin via is_closed.

## B3 + B4 + B4.5 closure summary

| Slice | Что | pytest delta | Статус |
|---|---|---|---|
| B3a | `ClayScheduler` scaffold + `SchedulerSettings` + real `session-scheduler` status | 190 → 194 (+4) | ✅ |
| B3b | `HealthTickJob` (heartbeat-scope session-scheduler, transition-diff, recovery `ERROR → HEALTHY`, anti-flood pre-tick capture) + `_run_safely` + `add_health_tick_job()` | 194 → 200 (+6) | ✅ |
| **B3** | | **+10 net** | **✅ closed** |
| B4 | `ReliabilityRecheckJob` (first-run seed + transition-diff on 3 fields + `_failing` reset on success + isolated `on_error` no session-scheduler mutation) + `reliability_service.recheck(emit: bool)` + public `emit_recheck_events(snapshot)` (single source of payload) + `ClayScheduler._run_safely(on_error=...)` параметризованный (B3b by construction no-touch) + `add_reliability_recheck_job()` (3 gates: flag + deps + registration, **loud warning** при missing dep) + `start()` обновлён: `jobs` from `apscheduler.get_job()` (Q2 single source of truth) + `SchedulerSettings.reliability_enabled: bool = True` + `_ReliabilityRecheckable` Protocol + `bootstrap.py` +session_factory module-level export + `lifespan.py` pass deps | 200 → 215 (+15) | ✅ |
| **B4** | | **+15 net** | **✅ closed** |
| B4.5 | `binance_client.py:36-44` else-ветка: `response.raise_for_status()` / `response.json()` / `return list(payload)` перенесены **внутрь** `async with httpx.AsyncClient() as client:` (4 строки, mechanical dedent, +0 net LOC). Injected-client ветка (26-34) не тронута. **+1 new test** в `tests/ingestion/market/test_binance_client.py` — first direct coverage of `BinanceSpotClient` (httpx.MockTransport happy-path, `@pytest.mark.anyio`) | 215 → 216 (+1) | ✅ |
| **B4.5** | | **+1 net** | **✅ closed** |

**B3+B4+B4.5 total:** +26 net (190 → 216). 0 регрессий.

**B4 highlights:**
- 🔴 **Emma's #11 mandatory fix** (финализировано): `_failing` reset в `ReliabilityRecheckJob.run()` step 3 (после `commit()`). `fail → success → fail` = 2 audit `reliability.recheck_failed` (Acceptance #11 verified). Без reset — silent 2nd episode.
- **Q1 (Emma) loud warning** финализирован: оба dep (`reliability_service` + `session_factory`) optional; gate `reliability_enabled=True` + `missing=[…]` → `logger.warning` с именами отсутствующих (`"reliability_enabled=True but session_factory is None — reliability-recheck job NOT registered (misconfiguration)"`).
- **Q2 (Emma) single source of truth** финализирован: `scheduler.started.jobs` строится из `apscheduler.get_job(id) is not None` (не из флагов). Misconfiguration path не врёт audit log.
- **Public `emit_recheck_events(snapshot)`** — manual route (`emit=True` default) и job (`emit=False` + diff) используют **один** payload shape. Anti-drift.
- **`_ReliabilityRecheckable` Protocol** в `jobs.py` — duck-typed, production `ReliabilityService` и test fake оба соответствуют.
- **A6 invariant соблюдён:** `grep "import clay.bootstrap\|from clay.bootstrap" backend/src/clay/scheduler/` = 0 matches.

**Отчёт:** [reports/last.md](../reports/last.md) — B4.5 (mechanical fix + framing analysis).

**Recon findings (B4 lesson carry-forward на B5):** [obs-2026-06-02-002-b4-recon-side-effect-concern.md](../observations/2026-06/obs-2026-06-02-002-b4-recon-side-effect-concern.md).

**B3b pattern reference (B4 carry-forward):** [obs-2026-06-02-001-b3b-pre-tick-capture.md](../observations/2026-06/obs-2026-06-02-001-b3b-pre-tick-capture.md).

---

## 📦 B4 — `ReliabilityRecheckJob` (done ✅)

**Слайс:** B4 · **Тип:** gated · **Фаза 1: recon ✅ · Фаза 2: plan ✅ ratified · Фаза 3: code ✅ done**

### Решение Emma (финализировано + 4 поправки применены)

**Option B** + (a) error-policy isolation + (b) first-run seed + (c) `emit_recheck_events` публичный метод + (d) `_run_safely(..., on_error=None)` параметризованный.

### Финальные поправки Emma (применены в коде)

1. **(b) `_failing` reset на success** — `ReliabilityRecheckJob.run()` step 3, `self._failing = False` после `commit()`. `fail → success → fail` = 2 audit (Acceptance #11 verified). Без reset — silent 2nd episode.
2. **(Q1) loud warning для обоих dep** — `add_reliability_recheck_job()` собирает `missing = [name for name, value in (("reliability_service", ...), ("session_factory", ...)) if value is None]`. Если `missing` непустой + `reliability_enabled=True` → `logger.warning("...but %s is None — reliability-recheck job NOT registered (misconfiguration)", " and ".join(missing))`.
3. **(Q2) jobs from actual registration** — `start()` строит `jobs = [job_id for job_id in (HEALTH_TICK_JOB_ID, RELIABILITY_RECHECK_JOB_ID) if apscheduler.get_job(job_id) is not None]`. Не из флагов. Misconfiguration path → `get_job` → None → не в `jobs`.
4. **(e) `event_bus` reserved** — `# reserved (v2: reliability.tick)` комментарий в `ReliabilityRecheckJob.__init__` на `event_bus: EventBus` параметре. Unused в v1 (emit идёт через `reliability_service.emit_recheck_events`).

### Файлы (8 в плане — все изменены/созданы)

| # | Файл | Изменение | LOC net |
|---|---|---|---|
| 1 | `reliability/service.py` | +`emit: bool = True` param в `recheck`, +`emit_recheck_events(snapshot)` **публичный** метод | +53 |
| 2 | `settings/scheduler.py` | +`reliability_enabled: bool = True` (env `CLAY_SCHEDULER_RELIABILITY_ENABLED`) | +5 |
| 3 | `scheduler/jobs.py` | +`_ReliabilityRecheckable` Protocol + `ReliabilityRecheckJob` (DI, first-run seed, transition-diff, `_failing` reset, custom error policy via `_failing` guard) | +192 |
| 4 | `scheduler/service.py` | +`reliability_service` + `session_factory` optional kwargs в `__init__`; `_run_safely(..., on_error=None)` параметризованный; +`add_reliability_recheck_job()` (3 gates); `start()` обновить | +116 |
| 5 | `api/lifespan.py` | +import `reliability_service` + `session_factory`; pass в `ClayScheduler` | +2 |
| 6 | `tests/scheduler/test_reliability_recheck_job.py` | **new**: 8 тестов (Acceptance #1, #3, #4, #5, #9×3, #10, #11) | +383 |
| 7 | `tests/scheduler/test_clay_scheduler.py` | +5 тестов (enabled / disabled / jobs_payload×2 / loud_warning) + `_make_scheduler` 7-tuple helper (backward-compat через `*_` unpack) | +120 |
| 8 | `tests/reliability/test_reliability_service.py` | +2 теста (default emit=True / `emit=False` + persist `last_rechecked_at`) + `_build_fake_reliability_service` helper | +147 |

**Acceptance:** pytest 200 → **215** (+15 net). Все 11 acceptance verified (см. [reports/last.md §Acceptance](../reports/last.md)).

### Ключевые решения (финализировано)

**(c) `emit_recheck_events(snapshot)` — публичный метод, не голый boolean:**

```python
def recheck(self, session, *, emit: bool = True) -> ReliabilitySnapshot:
    self._last_rechecked_at = datetime.now(UTC)
    if self.session_factory is not None:
        ReliabilityStateRepository(session).save(last_rechecked_at=self._last_rechecked_at)
    snapshot = self.build_snapshot(session)
    if emit:
        self.emit_recheck_events(snapshot)
    return snapshot

def emit_recheck_events(self, snapshot: ReliabilitySnapshot) -> None:  # public
    self.audit_writer.write("reliability.rechecked", {
        "release_readiness_status": snapshot.summary.release_readiness_status,
        "blocking_gate_count": snapshot.summary.blocking_gate_count,
        "warning_gate_count": snapshot.summary.warning_gate_count,
    })
    self.event_bus.publish("reliability.updated", {
        "event_type": "reliability.rechecked",
        "release_readiness_status": snapshot.summary.release_readiness_status,
    })
```

- Manual route + job используют **один источник payload** (нет дрейфа форматов)
- `last_rechecked_at` (in-memory + DB) пишется **всегда** — нужно для restart-survival (A5)

**(a) Error-policy: параметризованный `_run_safely(..., on_error=None)`** (не отдельный wrapper):

```python
def _run_safely(
    self,
    job_callable: Callable[[], None],
    *,
    on_error: Callable[[Exception], None] | None = None,
) -> None:
    pre_status = self._registry.get(self._SERVICE_ID).status
    try:
        job_callable()
    except Exception as exc:
        if on_error is not None:
            on_error(exc)
            return  # custom policy takes over
        # default: B3b behavior (session-scheduler ERROR + audit)
        self._registry.update_status(self._SERVICE_ID, ServiceStatus.ERROR, error=str(exc))
        if pre_status != ServiceStatus.ERROR:
            self._audit_writer.write("service.status_changed", {
                "service_id": self._SERVICE_ID,
                "from": pre_status.value, "to": ServiceStatus.ERROR.value, "error": str(exc),
            })
        logger.exception(...)
```

Reliability-job регистрируется через `apscheduler.add_job(..., kwargs={"on_error": job.on_error})`. **B3b код нетронут by construction** (default `on_error=None` → B3b path), reliability-job изолирован.

**(b) First-run = seed no emit + anti-flood через `_failing` guard + 🔴 Emma's #11 reset:**

```python
class ReliabilityRecheckJob:
    def __init__(self, reliability_service, session_factory, audit_writer, event_bus):
        self._reliability_service = reliability_service
        self._session_factory = session_factory
        self._audit_writer = audit_writer
        self._event_bus = event_bus  # reserved (v2: reliability.tick)
        self._cache: tuple[str, int, int] | None = None  # first-run seed
        self._failing: bool = False  # anti-flood episode guard

    def run(self) -> None:
        with self._session_factory() as session:
            snapshot = self._reliability_service.recheck(session, emit=False)
            session.commit()
        # 🔴 Emma's #11 mandatory reset: successful tick closes
        # the failing episode so a new failure re-emits the audit.
        self._failing = False
        new_state = (
            snapshot.summary.release_readiness_status,
            snapshot.summary.blocking_gate_count,
            snapshot.summary.warning_gate_count,
        )
        if self._cache is None:                # first run: seed, no emit
            self._cache = new_state
            return
        if new_state == self._cache:           # steady: no emit
            return
        # transition: emit через публичный метод
        self._reliability_service.emit_recheck_events(snapshot)
        self._cache = new_state

    def on_error(self, exc: Exception) -> None:
        if not self._failing:                  # once-on-transition (anti-flood)
            self._audit_writer.write("reliability.recheck_failed", {"error": str(exc)})
        self._failing = True
        logger.exception("clay.scheduler: reliability recheck failed; "
                         "session-scheduler NOT marked ERROR (isolated policy)")
        # НЕ re-raise, НЕ mutate registry — session-scheduler НЕ трогаем
```

- 288 подряд провалов = 1 audit `reliability.recheck_failed` (аналогия с B3b pre-tick pattern)
- `fail → success → fail` = 2 audit (Acceptance #11, Emma's #11 verified)
- Successful tick после провала — НЕ эмитит `reliability.recheck_recovered` (per Emma: "OK для v1")
- `_failing` reset на success (Emma's #11 fix, mandatory)

**Q1 (loud warning) — в `add_reliability_recheck_job`:**

```python
def add_reliability_recheck_job(self) -> None:
    if not self._settings.reliability_enabled:
        return
    missing = [
        name
        for name, value in (
            ("reliability_service", self._reliability_service),
            ("session_factory", self._session_factory),
        )
        if value is None
    ]
    if missing:
        logger.warning(
            "clay.scheduler: reliability_enabled=True but %s is None — "
            "reliability-recheck job NOT registered (misconfiguration)",
            " and ".join(missing),
        )
        return
    job = ReliabilityRecheckJob(...)
    self._apscheduler.add_job(...)
```

**Q2 (jobs from actual registration) — в `start()`:**

```python
def start(self) -> None:
    self._apscheduler.start()
    self.add_health_tick_job()
    self.add_reliability_recheck_job()
    self._registry.update_status(self._SERVICE_ID, ServiceStatus.HEALTHY)
    jobs = [
        job_id
        for job_id in (self._HEALTH_TICK_JOB_ID, self._RELIABILITY_RECHECK_JOB_ID)
        if self._apscheduler.get_job(job_id) is not None  # ← single source of truth
    ]
    self._audit_writer.write("scheduler.started", {"version": "3.11.2", "jobs": jobs})
```

### Acceptance (11 пунктов — все verified)

1. ✅ `recheck(emit=False)` пишет `last_rechecked_at` (in-memory + DB), НЕ пишет audit/bus
2. ✅ Manual `POST /reliability/recheck` route **backward-compat** (default `emit=True`, audit+bus как раньше)
3. ✅ Job в steady state: 0 audit, 0 bus
4. ✅ Job на transition: 1 audit `reliability.rechecked` + 1 bus `reliability.updated`
5. ✅ First-run: seed cache, 0 audit, 0 bus
6. ✅ `reliability_enabled=False`: reliability-recheck НЕ registered, health-tick всё ещё registered
7. ✅ `reliability_enabled=True`: reliability-recheck registered
8. ✅ Два флага (`enabled` + `reliability_enabled`) независимы (покрыто 6+7 + jobs_payload тестами)
9. ✅ Exception в reliability-job: 1 audit `reliability.recheck_failed` once + session-scheduler НЕ ERROR + не re-raise
10. ✅ Anti-flood: 2 подряд провала = 1 audit
11. ✅ **Emma's #11** `fail → success → fail` = 2 audit (reset episode)

Plus Q1 (loud warning) + Q2 (jobs from registration) — 2 extra теста.

### Carry-forward (финализировано)

- Явный DI, **no `import bootstrap`** в `scheduler/` (A6 invariant: grep = 0)
- ThreadPoolExecutor, `coalesce + max_instances=1 + replace_existing=True`
- Pre-tick pattern (B3b [obs-2026-06-02-001](../observations/2026-06/obs-2026-06-02-001-b3b-pre-tick-capture.md))
- Audit verb reuse: `reliability.rechecked` (A6 verb, exists), `reliability.updated` (SSE exists)
- Известный лимит v1 (per Emma): manual-route emit не обновляет job-cache → 1 повторный emit на следующем тике job'а возможен. Задокументировано в `ReliabilityRecheckJob` docstring.
- **🔴 Emma's #11 mandatory:** `_failing` reset на success — обязателен для всех future B4-pattern jobs (B5, future).

---

## 📦 B5 — `IngestionCycleJob` (plan: pending re-ratification after Emma's Поправка 1+2)

> **📄 Полный B5 plan извлечён в отдельный файл для архитектора:** [b5-plan-2026-06-02.md](b5-plan-2026-06-02.md) (~458 строк, для передачи).
>
> **TL;DR:** `IngestionCycleJob` — async coroutine на `AsyncIOScheduler` (mirror `POST /ingestion/run` 1:1). **TWO wrappers** (sync `_run_safely` UNCHANGED для B3b/B4 → ThreadPoolExecutor; **NEW async `_arun_safely`** для B5 → event loop; **shared `_handle_job_error`** — no duplication). `asyncio.Lock` + `is_running` в `IngestionCycleService` (TOCTOU mitigation explicit). Manual route → 409, scheduler → skip+log. Anti-flood signal = `(incidents_present, freshness_state_transitions)`. `upsert_freshness_status` refactor → returns `bool`. 4 deps Q1 loud warning. **+17 net tests** (216 → 233).
>
> **Поправка 1 (Emma caught):** одно общее `_run_safely` с `inspect.isawaitable` — HIDDEN REGRESSION (B3b/B4 sync jobs уехали бы на event loop). Two wrappers фиксят routing.
>
> **Поправка 2 (Emma caught):** `freshness_updates_written` (счётчик upsert'ов) ≠ transition signal. Refactor: bool + `freshness_state_transitions` field — steady state не emit'ит.
>
> **Recon:** [obs-2026-06-02-005](../observations/2026-06/obs-2026-06-02-005-b5-recon-ingestion-cycle.md), [obs-2026-06-02-006](../observations/2026-06/obs-2026-06-02-006-b5-micro-recon-context-repos-dedup.md).

---

## 🛑 Wave B scope (всё ещё остаётся после B4.5)

| Slice | Что | pytest delta (preliminary) | Статус |
|---|---|---|---|
| B4 | ReliabilityRecheckJob + isolated error policy | +15 | ✅ done |
| B4.5 | `binance_client.py:36-44` fix (response-after-async-with smell) | +1 | ✅ done |
| B5 | IngestionCycleJob (async on loop, asyncio.Lock, emit-on-transition, B4 pattern + recon) | +17 | ⏳ plan v2 pending re-ratification (Поправка 1+2 applied) → [b5-plan-2026-06-02.md](b5-plan-2026-06-02.md) |
| B6 | Integration tests через `LifespanManager` + ADR-007 doc | +6+ | ⏳ pending |

---

## 📦 B4.5 — `binance_client.py:36-44` response lifecycle fix (done ✅)

**Слайс:** B4.5 · **Тип:** mechanical · **Фаза 1: recon ✅ · Фаза 2: plan ✅ ratified · Фаза 3: code ✅ done**

### Финальное решение Emma (с framing nuance)

- **Smell, не live data-corruption.** httpx non-streaming `await client.get(...)` буферизует `.content` полностью до возврата. `aclose()` закрывает connection pool/transport, **но не** body buffer. `response.json()` / `raise_for_status()` после `async with` работают по **контракту httpx**, не "по счастливой случайности". ReadError/ResponseNotRead ловятся только при `client.stream()`, которого здесь нет.
- **Fix всё равно делаем:** дёшев, корректен, future-proof (защита от `stream()` миграции), и **чистит HTTP-путь перед B5** (IngestionCycleJob на 60s interval будет дёргать `fetch_klines` в hot loop).
- **Test ценен не как regression guard, а как contract pin + first coverage.** Честного regression-теста для "response used after async with" в non-streaming контексте **не существует** (не упадёт на багнутом коде). Monkey-patch option отклонён Emma (brittle + доказательно бесполезен).
- **1 happy-path test** (injected `httpx.MockTransport`) — покрывает контракт парсинга для обеих веток (injected + else, structurally identical `get → raise_for_status → json → list`).

### Файлы (2 в плане — все изменены/созданы)

| # | Файл | Изменение | LOC net |
|---|---|---|---|
| 1 | `ingestion/market/binance_client.py` | 4 строки moved inside `async with` (mechanical dedent) | +0 / −0 (net 0) |
| 2 | `tests/ingestion/market/test_binance_client.py` | **new**: 1 test (`test_fetch_klines_returns_parsed_payload`, `httpx.MockTransport`, `@pytest.mark.anyio`) | +44 |

### Acceptance

| | |
|---|---|
| pytest baseline (215) | ✅ 216 |
| +1 test в `test_binance_client.py` | ✅ |
| Mechanical 4-line fix | ✅ 4 строки moved inside `async with`, сигнатура/поведение идентичны |
| Injected-client ветка (26-34) не тронута | ✅ structurally identical, covered by same contract |
| CLI-pyright: 0 new errors | ✅ 184 → 184 (no change) |
| 0 регрессий | ✅ 6.83s |

### Backlog (NOT done, NOT in B4.5)

- **v2 candidate: lifespan-owned `httpx.AsyncClient`** — else-ветка создаёт новый `AsyncClient()` на каждый вызов (new connection pool per request). Под scheduler-job B5 (60s = 1440 calls/day) расточительно. Кандидат на отдельный slice после B6.
- **`chore(types)` опц. (Emma's "твоё решение"):** 2 B4 test-fake type-hygiene issues. Отдельный коммит, не в `fix(market)`. **Не сделано** в B4.5 (single-commit discipline).

---

## Жду от Emma

1. **B5 plan RATIFIED** ✅ (Поправка 1+2 applied, +1 mandatory code fix для fragment D зафиксирована)
2. **Коммиты** по утверждённой схеме (5-6 Wave A + 5+1 Wave B: B1 / B2 / B3a / B3b / B4 / B4.5) — **отдельно** от B5
3. (опц.) **`chore(types)` commit** для 2 B4 test-fake type-hygiene issues (отдельно, в общий burn-down после Wave B)
4. **В новой сессии:** B5 code-фаза (red→green→diff) per plan `b5-plan-2026-06-02.md` → отчёт в чат по форме (Шаблон отчёта агента) + commit (1 шт) → **B6** (integration tests + ADR-007) — финальный slice Wave B.
