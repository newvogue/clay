# Текущее Состояние

**Дата:** 2026-06-03
**Где остановились:** Wave A (persistence) — все 10 слайсов done ✅. **Wave B (scheduler & lifespan) — FORMALLY CLOSED ✅** (9/9 slices: B0 + B1 + B2 + B3a + B3b + B4 + B4.5 + B5 + B6) + **ADR-007 accepted** (commit `f0cbb7d`, 192 LOC). `pytest -q` → **249 passed** (236 → 249, +13 net, 0 regressions). CLI-pyright: 189 errors (same as B5 baseline, 0 new src-errors). Branch ahead of `origin/main` на 5 коммитов (`bf87c2c` + `eba64bb` + `6af56a3` + `c3a6484` + `f0cbb7d`).
**Следующий шаг:** **Wave C planning (TBD)** от архитектора. Push (5 локальных коммитов) — Emma's call.
**Активный task-packet:** [handoffs/current.md](handoffs/current.md) = **Wave B formally closed ✅** (B0..B6 + ADR-007).

## 🛑 Точка остановки (session handoff)

**Сессия 2026-06-03.** **Wave B FORMALLY CLOSED ✅:** 9/9 slices (B0..B6, 249 passed, 0 regressions) + **ADR-007 accepted** (`f0cbb7d`, 192 LOC, `docs/mission-control/adrs/adr-007-scheduler-side-effect-and-lifecycle-contract.md`). Документ закрепляет lifecycle-инварианты (start/stop), env-gate surface, sync/async routing matrix, **audit topology (Ruling 1, refined by confirm (b))** — `registry.update_status` = pure mutation, `status_changed` пишется только call-sites'ами, control-api bootstrap transition — silent. **Partial-failure stance (Ruling 2):** startup-fail = fail-fast, shutdown-fail = documented known-limit (test #13 pins).

**B6 highlights:**
- **13 integration тестов** в `backend/tests/integration/test_scheduler_lifespan.py` (NEW, 461 LOC). Изоляция: `build_services_for_integration(tmp_path)` + monkeypatch `lifespan_module` deps. Покрывают: 3 jobs registered, session-scheduler state walk, APScheduler STATE_RUNNING, **routing matrix (sync `_run_safely` vs async `_arun_safely` — B5 fragment D fix integration-level confirmation)**, audit events scheduler.started/stopped, env-gates (RELIABILITY_ENABLED, INGESTION_ENABLED), app.state reset, B3a soft-debt double-startup pin, real-tick smoke, 2 partial-failure anti-tests (startup-fail, shutdown-fail).
- **🔴 Confirm (a) verified + pinned by test #12:** `scheduler.start()` (lifespan.py:96) ДО `app.state.scheduler = scheduler` (lifespan.py:97). При raise в start() → `app.state.scheduler` остаётся `None` (от guard lifespan.py:80). Тест #12 инжектит fail в `add_health_tick_job` (scheduler/service.py:171) → `LifespanManager` re-raises + `app.state.scheduler is None` + audit пуст.
- **🔴 Confirm (b) verified:** `registry.update_status` (services/registry.py:32-40) — pure mutation, БЕЗ `audit_writer.write` внутри. `service.status_changed` пишется ТОЛЬКО call-sites: `ClayScheduler._handle_job_error` (scheduler/service.py:456-464, per-tick exception) + `HealthTickJob.run` (scheduler/jobs.py:179, per-tick transition). `bootstrap.py:148` `update_status("control-api", HEALTHY)` — **silent** (current behaviour, open question для ADR-007).
- **B6 cleanup:** удалён redundant `session.commit()` в `IngestionCycleJob.run()` (B5 dead code — `_do_run_once` уже коммитит под `asyncio.Lock`, ingestion/service.py:177). B5 unit test `test_run_calls_run_once_emit_false_and_commits` обновлён (assert убран, docstring обновлён).
- **ADR-007 packet:** `.context/handoffs/b6-adr-007-packet-2026-06-03.md` (~30KB, 12 sections) — extract для Opus. **Агент НЕ пишет** `docs/mission-control/adrs/adr-007-*.md` (это deliverable архитектора per `docs/mission-control/adrs/adr-001..005` convention).
- **Routing matrix на живом scheduler (verify):** `inspect.iscoroutinefunction` подтверждает — `health-tick.func` + `reliability-recheck.func` = sync, `ingestion-cycle.func` = async. B5 fragment D fix = ✅ на integration уровне.
- **Commit hygiene Флаг 1 closed:** HEAD `eba64bb` (chore-commit "throwaway" для make HEAD buildable, ratified Emma 2026-06-03). Future full 12-split вынесен в отдельную git-сессию (B6 не блокирует).

**Возобновление:**
  1. **Push** 5 локальных коммитов (`bf87c2c` + `eba64bb` + `6af56a3` + `c3a6484` + `f0cbb7d`) в `origin/main` — Emma's call.
  2. **Отдельная git-сессия** для `git reset --soft bf87c2c~1` + N logical commits (12 по Emma's ratify). Out of Wave B scope.
  3. **Отдельная `chore(types)` сессия** для 189 pyright errors (pre-existing test-fake type-debt). Out of Wave B scope.
  4. **Wave C planning** (TBD) — next engineering wave от архитектора.

## Что сделано за последнюю сессию
- 2026-06-01: развёрнута vendor-agnostic система памяти `.context/` в проекте Clay
- 2026-06-01: **Wave A / persistence (10 слайсов done ✅)** (A0→A5.5+A6, pytest 188)
- 2026-06-02: **Wave B / scheduler & lifespan — B0 + B1 + B2 + B3 + B4 + B4.5 + B5 done ✅** (7/8 слайсов, 236 passed, commit `bf87c2c`)
- 2026-06-03: **B6 done ✅** (финальный slice, 13 integration тестов, confirm (a)/(b) verified, commit `6af56a3`, +13 net, 0 regressions)
- 2026-06-03: **Wave B FORMALLY CLOSED ✅** — Emma review B6 принят + **ADR-007 accepted** (commit `f0cbb7d`, 192 LOC, `docs/mission-control/adrs/adr-007-scheduler-side-effect-and-lifecycle-contract.md`)
  - **Emma ratify B6:** все критерии зелёные, оба confirm разрешены, routing подтверждён на живом scheduler. Зафиксировано в её логе.
  - **ADR-007 ключевое:**
    - **Ruling 1 (audit topology, refined by confirm (b)):** lifecycle-глаголы (scheduler.started/stopped) vs `service.status_changed` — разные классы, не гармонизируются. `registry.update_status` = pure mutation. `status_changed` пишется ТОЛЬКО call-sites'ами (`_handle_job_error`, `HealthTickJob.run`). control-api `STOPPED→HEALTHY` на bootstrap — **silent** (orchestrated, не наблюдаемый health-transition).
    - **Ruling 2 (partial-failure stance):** startup-fail = fail-fast (test #12 pins). shutdown-fail = documented known-limit (test #13 pins). double-startup = pinned soft-debt.
    - **Routing matrix (B5 fragment D fix пин'нут integration-level):** `inspect.iscoroutinefunction` подтверждает sync jobs → `_run_safely` → ThreadPoolExecutor, ingestion-cycle → `_arun_safely` → event loop.
    - **Single-worker assumption** зафиксирована явно.
  - **Backlog (6 items):** shutdown-fail hardening, UniqueConstraint idempotency, lifespan-owned httpx.AsyncClient, asyncio.to_thread для sync-DB, ops.* retention, chore(types) burn-down.

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
