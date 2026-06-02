# Текущее Состояние

**Дата:** 2026-06-02/03
**Где остановились:** Wave A (persistence) — все 10 слайсов done ✅. **Wave B (scheduler & lifespan) — B0 + B1 + B2 + B3 + B4 + B4.5 + B5 done ✅** (7/8 слайсов). `pytest -q` → **236 passed** (216 → 236, +20 net, B5 ingestion cycle job). **B6** (integration tests + ADR-007) — **финальный slice Wave B, pending**.
**Следующий шаг:** **B6** — `LifespanManager` integration tests + ADR-007 doc.
**Активный task-packet:** [handoffs/current.md](handoffs/current.md) = **B5 done ✅** (commit `bf87c2c`), B6 pending. Полный план: [handoffs/b5-plan-2026-06-02.md](handoffs/b5-plan-2026-06-02.md) (для архитектора; **code-фаза закрыта в этом коммите**).

## 🛑 Точка остановки (session handoff)

**Сессия 2026-06-02/03.** Wave B: B0 + B1 + B2 + B3 + B4 + B4.5 + **B5 done ✅** (7/8 слайсов). **236 passed** (216 → 236, +20 net). 0 регрессий. CLI-pyright 184 → 189 (+5, все pre-existing patterns в новых test-файлах). **B5 commit** `bf87c2c feat(scheduler): ingestion cycle job, async on loop with concurrency guard`.

**B5 highlights:**
- **🔴 Fragment D mandatory code fix applied:** `add_ingestion_cycle_job()` → `func=self._arun_safely` (async), НЕ `self._run_safely` (sync). Sync wrapper НЕ заавейтит coroutine `job.run` (тихий no-op, ingestion cycle не исполняется). Routing matrix + text plan = `_arun_safely`; fragment D был typo — кодировал per matrix.
- **Two wrappers + shared `_handle_job_error`:** sync `_run_safely` UNCHANGED (B3b/B4 → ThreadPoolExecutor); NEW async `_arun_safely` (B5 → event loop); shared `_handle_job_error` (B3b default / B4-on_error / B5-isolated в одном месте, no duplication). Поправка 1 applied.
- **`upsert_freshness_status → bool` (Поправка 2):** INSERT or state-change = True, timestamp-only = False. `IngestionRunSummary.freshness_state_transitions: int` field. Steady state = 0 → no emit. Anti-flood correctness: ~10-50 audit/день.
- **Counter split:** `market_records_inserted` + `market_records_updated` (computed `market_records_written` для backward-compat с pre-B5 `assert ... == 4`).
- **`IngestionCycleService` + asyncio.Lock + is_running:** lock покрывает весь `_do_run_once` (TOCTOU mitigation explicit). Manual route → 409 (`IngestionCycleBusy`), scheduler-job → skip+log.
- **Public `emit_cycle_events(summary)`** — single source of payload (manual route + job anti-flood transition).
- **B4 #11 carry-forward:** `_failing` reset on success (Acceptance #11, `fail → success → fail` = 2 audit). Anti-flood per failing episode.
- **+20 net tests** (5 service + 10 job + 1 route + 4 scheduler). Все зелёные.
- **A6 invariant соблюдён:** `grep "import clay.bootstrap" backend/src/clay/scheduler/` = 0 matches.

**Возобновление:**
  1. **Emma** делает ревью B5 commit `bf87c2c` (или отклоняет — тогда чиню)
  2. (опц.) **Emma** делает `chore(types)` commit для 5 B5 + 2 B4 test-fake + 184 pre-existing patterns = 191 errors → единый burn-down slice
  3. **B6** — `LifespanManager` integration tests + ADR-007 (финальный slice Wave B)
  4. После B6 → Wave B closed. → Wave C: planning (TBD)

**Wave B scope (оставшийся):** B5 (IngestionCycleJob — manual route → scheduler-driven, **применить ту же ADR-007 pre-flight recon что в B4**) → B6 (integration tests + ADR-007 documentation).

## Что сделано за последнюю сессию
- 2026-06-01: развёрнута vendor-agnostic система памяти `.context/` в проекте Clay
- 2026-06-01: **Wave A / persistence (10 слайсов done ✅)** (A0→A5.5+A6, pytest 188)
- 2026-06-02: **Wave B / scheduler & lifespan — B0 + B1 + B2 + B3 + B4 + B4.5 done ✅** (6/8 слайсов)
  1. **B0 recon** — карта по 8 пунктам + декомпозиция B1-B6
  2. **B1 lifespan skeleton** — `apscheduler`+`asgi-lifespan`, `lifespan.py` boot-order. 189 passed
  3. **B2 HealthMonitor factory wiring** — factory wires `HealthMonitor(stale_after_seconds=settings)`. 190 passed
  4. **B3a ClayScheduler scaffold** — `SchedulerSettings`, `ClayScheduler` (sync facade), lifespan-wiring. 194 passed
  5. **B3b HealthTickJob + transition-audit** — heartbeat-scope, recovery, anti-flood. 200 passed
  6. **B4 ReliabilityRecheckJob** (финал предыдущего handoff)
     - `reliability_service.recheck(emit: bool = True)` + публичный `emit_recheck_events(snapshot)` (single source of payload)
     - `settings/scheduler.py` + `reliability_enabled: bool = True` (env `CLAY_SCHEDULER_RELIABILITY_ENABLED`)
     - `ReliabilityRecheckJob` (DI через `_ReliabilityRecheckable` Protocol, first-run seed, transition-diff на 3 полях, `_failing` reset на success, isolated `on_error` — НЕ мутирует `session-scheduler`, НЕ re-raise)
     - `ClayScheduler._run_safely(..., on_error=None)` параметризован (B3b by construction no-touch, B4 (a) error-policy isolation)
     - `ClayScheduler.add_reliability_recheck_job()` (3 gates: flag, deps, registration; **loud warning** при missing deps с названием отсутствующего)
     - `ClayScheduler.start()` обновлён: `jobs` from `apscheduler.get_job()` (Q2 Emma, single source of truth)
     - `bootstrap.py` +module-level `session_factory` export (нужен для `lifespan.py`)
     - `api/lifespan.py` pass `reliability_service` + `session_factory` в `ClayScheduler`
     - **15 новых тестов** (8 в `test_reliability_recheck_job.py` + 5 в `test_clay_scheduler.py` + 2 в `test_reliability_service.py`)
     - **200 → 215 passed**. 0 регрессий.
  7. **B4.5 binance_client response-after-async-with fix** (текущий handoff)
     - `binance_client.py:36-44` else-ветка: `response.raise_for_status()` / `response.json()` / `return list(payload)` перенесены **внутрь** `async with httpx.AsyncClient() as client:` (4 строки, mechanical dedent, +0 net LOC)
     - Injected-client ветка (26-34) не тронута (structurally identical contract)
     - **+1 new test:** `tests/ingestion/market/test_binance_client.py::test_fetch_klines_returns_parsed_payload` (httpx.MockTransport happy-path, first direct coverage of `BinanceSpotClient`)
     - **215 → 216 passed**. 0 регрессий. CLI-pyright 0 new errors (184 → 184)
     - **Framing:** smell-fix (httpx non-streaming body buffer guarantees), не live data-corruption. Test ценен как contract pin + first coverage, не как regression guard

### B4 highlights (финальный slice сессии)

- **🔴 Emma's #11 mandatory fix:** `_failing` reset в `ReliabilityRecheckJob.run()` step 3 (после `commit()`). Без reset — `fail → fail → success → fail` дал бы только 1 audit (молчаливое проглатывание эпизода). С reset — каждый эпизод имеет ровно 1 audit (B3b anti-flood pattern, B4-применение).
- **Q1 loud warning:** `add_reliability_recheck_job()` проверяет **оба** dep (`reliability_service` + `session_factory`) и пишет `logger.warning` с **именами** отсутствующих (`"reliability_enabled=True but session_factory is None — reliability-recheck job NOT registered (misconfiguration)"`). Production `lifespan.py` всегда передаёт оба → путь dev/test-only.
- **Q2 single source of truth:** `scheduler.started.jobs` строится из `apscheduler.get_job(id) is not None` для каждого known id. Если флаг `True`, но dep missing → `add_reliability_recheck_job` skip → `get_job` → None → **не** в `jobs` (нет лживого payload).
- **(c) Public `emit_recheck_events(snapshot)`:** manual route (`emit=True` default) и job (`emit=False` + diff detection) используют **один** payload shape. Anti-drift.
- **`_ReliabilityRecheckable` Protocol** в `jobs.py`: duck-typed, production `ReliabilityService` и test `FakeReliabilityService` оба соответствуют. Чистый DI без inheritance.
- **A6 invariant соблюдён:** `grep "import clay.bootstrap\|from clay.bootstrap" backend/src/clay/scheduler/` = **0 matches**.

## Что в работе

- **A6 done ✅ (Wave A закрыта)**
- **B4.5 done ✅ (Wave B B0+B1+B2+B3+B4+B4.5 closed, 6/8 слайсов)**
- Изменения **не закоммичены** — `git status` показывает (нарастающий итог с A1 + A6 + B1+B2+B3a+B3b+B4 + B4.5):
  - `M backend/src/clay/runtime/manager.py` (+reconcile_to)  ← A6
  - `M backend/src/clay/session_control/service.py` (+A4+A5+A6 reconcile_runtime_state)
  - `M backend/src/clay/bootstrap.py` (+factory rewrite + B2/B3a scheduler wiring + session_factory module-level)  ← A6 + B2 + B3a + **B4**
  - `M backend/src/clay/ai_control/service.py` (+A3+A5.5)
  - `M backend/src/clay/api/routes/ai_control.py` (+A3)
  - `M backend/src/clay/api/routes/workspace.py` (+A5)
  - `M backend/src/clay/api/main.py` (+lifespan=lifespan)  ← B1
  - `M backend/src/clay/api/lifespan.py` (B1 + B3a + B4 reliability_service/session_factory pass)  ← B1 + B3a + **B4**
  - `M backend/src/clay/db/models_ops.py` (+A1+A2.5)
  - `M backend/src/clay/reliability/service.py` (+A5 + B4 emit param + emit_recheck_events)  ← B4
  - `M backend/src/clay/validation_lab/service.py` (+A5+A5.5)
  - `M backend/src/clay/workspace/service.py` (+A5+D1 guard)
  - `M backend/src/clay/scheduler/service.py` (+B3a + add_health_tick_job + _run_safely on_error + add_reliability_recheck_job + start() jobs from get_jobs)  ← B3a + B3b + B4
  - `M backend/src/clay/scheduler/jobs.py` (+B3b HealthTickJob + B4 ReliabilityRecheckJob + _ReliabilityRecheckable Protocol)  ← B3b + B4
  - `M backend/src/clay/settings/scheduler.py` (+B3a fields + B4 reliability_enabled)  ← B3a + B4
  - `M backend/src/clay/scheduler/__init__.py` (re-export)  ← B3b
  - `M backend/src/clay/ingestion/market/binance_client.py` (4 строки moved inside async with)  ← **B4.5**
  - `M backend/pyproject.toml` (+apscheduler, +asgi-lifespan)  ← B1
  - `M backend/tests/...` (A1-A6 + B1+B2+B3a+B3b + B4 + **B4.5** tests)
  - `?? backend/src/clay/scheduler/jobs.py` (B3b+B4)  ← B3b new + B4 add
  - `?? backend/tests/scheduler/test_health_tick_job.py` (B3b)  ← B3b new
  - `?? backend/tests/scheduler/test_reliability_recheck_job.py` (B4)  ← B4 new
  - `?? backend/alembic/versions/0008_ops_runtime_state.py` (A1)
  - `?? backend/src/clay/api/lifespan.py` (B1)  ← B1 new
  - `?? backend/src/clay/db/repositories_runtime_state.py` (A2)
  - `?? backend/src/clay/db/types.py` (A2.5)
  - `?? backend/src/clay/settings/scheduler.py` (B3a + B4)  ← B3a new + B4 add
  - `?? backend/tests/api/test_lifespan.py` (B1 + B3a)
  - `?? backend/tests/health/test_health_monitor_factory_wiring.py` (B2)  ← B2 new
  - `?? backend/tests/scheduler/test_clay_scheduler.py` (B3a + B3b + B4 registration + loud warning + jobs payload)  ← B3a + B3b + B4
  - `?? backend/tests/reliability/test_reliability_service.py` (B4 +2 emit tests)  ← B4
  - `?? backend/tests/ingestion/market/test_binance_client.py` (B4.5, +1 test)  ← **B4.5 new**
  - `?? backend/tests/integration/` (A6)
- **Коммиты — за Emma** (5-6 логических для Wave A; **5+1 для Wave B**: B1 / B2 / B3a / B3b / B4 / **B4.5**)

## Блокеры
- Нет (B4.5 done, B5 plan ratified, code pending в новой сессии)

## Ключевые файлы
- `backend/` — Python 3.14 + FastAPI + SQLAlchemy 2.0 Async + uv
- `frontend/` — React 19 + TS 5.x + Vite + Tailwind 4 + Zustand
- `docs/mission-control/runbooks/` — операционные runbook'и
- `docs/planning/` — planning source
- `Makefile`

## Маршруты (Backend API)
| Домен | Endpoint |
|---|---|
| E1 runtime | `GET /health` |
| E2 ingestion | `GET /ingestion/health`, `POST /ingestion/run` |
| E3 workspace | `GET /workspace/trading`, `GET/POST /workspace/trading/focus`, `GET /workspace/trading/stream` |
| E4 control | `GET /control-center/overview`, `GET /control-center/stream` |
| E5 AI | `GET /ai-control/overview`, `POST /ai-control/assignments/{review,apply}`, `GET /ai-control/stream` |
| E6 signals | `GET /signals/overview` |
| E7 session | `GET /session/overview`, `POST /session/{start,pause,resume,complete}`, `POST /session/replacement/{review,apply}` |
| E8 demo | `GET /demo-trading/overview`, `POST /demo-trading/{log-current,results/ingest}` |
| E9 review | `GET /session-review/overview`, `POST /session-review/feedback` |
| E10 knowledge | `GET /knowledge/overview`, `POST /knowledge/items` |
| E11 validation | `GET /validation-lab/overview`, `POST /validation-lab/runs`, `POST /validation-lab/activation/{review,apply}` |
| E12 reliability | `GET /reliability/overview`, `POST /reliability/recheck` |
| **Alpha** | **`GET /alpha/overview`** — aggregate readiness snapshot (Runbook-002) |

## AI Rules (STRICT, не нарушать)
1. **Backend-only AI** — никаких прямых вызовов AI-провайдеров из Frontend.
2. **Stream Normalization** — все AI-стримы через internal SSE event format.
3. **No WebSockets by default** — SSE для live updates и signals.
4. **Data Integrity** — AI = synthesis layer, Market Data и Risk Rules = ground truth.

## Связанные записи
- Roadmap: [roadmap.md](roadmap.md)
- Архитектура: [architecture.md](architecture.md)
- Memory index: [memory/MEMORY.md](memory/MEMORY.md)
- ADR: [decisions/](decisions/)
- Handoff: [handoffs/current.md](handoffs/current.md) (B4.5 done ✅, B5 plan needed)
- Report: [reports/last.md](reports/last.md) (последний = **B4.5**)
- Observation: [observations/2026-06/obs-2026-06-02-001-b3b-pre-tick-capture.md](observations/2026-06/obs-2026-06-02-001-b3b-pre-tick-capture.md) (B3b pattern, B4 carry-forward)
- Observation: [observations/2026-06/obs-2026-06-02-002-b4-recon-side-effect-concern.md](observations/2026-06/obs-2026-06-02-002-b4-recon-side-effect-concern.md) (B4 recon, ADR-007 pattern)
- Observation: [observations/2026-06/obs-2026-06-02-003-pyright-venv-config.md](observations/2026-06/obs-2026-06-02-003-pyright-venv-config.md) (Pyright env-fix: `backend/pyrightconfig.json` + CLI-pyright = source of truth)
- Observation: [observations/2026-06/obs-2026-06-02-004-httpx-response-after-async-with-smell-not-bug.md](observations/2026-06/obs-2026-06-02-004-httpx-response-after-async-with-smell-not-bug.md) (B4.5 framing: httpx non-streaming body buffer, smell vs. live bug, regression test не существует)
- Observation: [observations/2026-06/obs-2026-06-02-005-b5-recon-ingestion-cycle.md](observations/2026-06/obs-2026-06-02-005-b5-recon-ingestion-cycle.md) (B5 recon: run_once side-effect profile, 2 [HIGH] flags, 3 architect decision points)
- Observation: [observations/2026-06/obs-2026-06-02-006-b5-micro-recon-context-repos-dedup.md](observations/2026-06/obs-2026-06-02-006-b5-micro-recon-context-repos-dedup.md) (B5 micro-recon: app-level dedup IS in place, [HIGH-1] NOT a block, DB-level UniqueConstraint = backlog)
