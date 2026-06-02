# ADR-007 — Scheduler Side-Effect & Lifecycle Contract

Дата: 2026-06-03
Статус: accepted
Связанный эпик: Wave B (in-process scheduler)
Авторы: architect (Opus); recon + packet — engineering agent (`handoffs/b6-adr-007-packet-2026-06-03.md`)
Связанные ADR: ADR-001 (runtime state model & control plane), ADR-005 (audit topology)

## Контекст

Wave B добавил **in-process APScheduler** (`AsyncIOScheduler`, UTC, `ThreadPoolExecutor(max_workers=4)`), запускаемый из FastAPI-`lifespan` (`backend/src/clay/api/lifespan.py`). Три периодических job'а — `health-tick` (B3b), `reliability-recheck` (B4), `ingestion-cycle` (B5) — выполняют побочные эффекты (запись в БД, audit, публикация на event bus) и делят рантайм-состояние с HTTP-слоем через `build_services()` singletons.

До этого ADR контракт планировщика жил неявно в коде и в recon-отчётах. Нужно зафиксировать:

1. lifecycle-инварианты (startup/shutdown, fail-mode);
2. topology аудита (lifecycle-глаголы vs `status_changed`);
3. sync/async routing между job'ами и threadpool/event loop;
4. границу side-effect'ов (что job делает в момент регистрации vs тика);
5. поведение при частичных отказах;
6. предположения о деплое (single-worker).

Документ опирается на 13 integration-тестов (`backend/tests/integration/test_scheduler_lifespan.py`), которые пинят это поведение, и на два verified confirm из B6: (a) `start()` до `app.state.scheduler = scheduler`, (b) `registry.update_status` — pure mutation, `status_changed` пишется только call-sites'ами.

## Решение

### 1. Lifecycle: владелец и порядок

Планировщик владеется `lifespan`. Startup: guards → log → `started_at = now()` → `if scheduler_settings.enabled:` сконструировать `ClayScheduler` → **`scheduler.start()` → затем `app.state.scheduler = scheduler`**. Shutdown: `scheduler.shutdown()` → сброс `app.state.scheduler = None`, `started_at = None`.

**Инвариант 2a (confirmed, test #12 `test_startup_failure_keeps_state_clean`):** `start()` стоит **до** присваивания `app.state.scheduler`. При упавшем `start()` `app.state.scheduler` **остаётся `None`** — non-running instance в state не попадает никогда. Это контракт, а не случайность.

**Инвариант 2b (pinned, test #9 `test_app_state_reset_on_shutdown`):** после выхода из lifespan `app.state.scheduler is None` и `started_at is None` всегда, в т.ч. при штатном shutdown.

### 2. Env-gate surface

`SchedulerSettings`, env_prefix `CLAY_SCHEDULER_`, validator `stale_after ≥ 2 × health_tick_interval`:

| Env | Default | Назначение |
|---|---|---|
| `CLAY_SCHEDULER_ENABLED` | — | master-switch планировщика (выкл → scheduler не строится, app живёт) |
| `CLAY_SCHEDULER_HEALTH_TICK_INTERVAL_SECONDS` | 30 | период health-tick |
| `CLAY_SCHEDULER_HEALTH_STALE_AFTER_SECONDS` | 60 (≥ 2×tick) | порог STALE |
| `CLAY_SCHEDULER_RELIABILITY_ENABLED` | true | gate reliability-recheck job |
| `CLAY_SCHEDULER_RELIABILITY_RECHECK_INTERVAL_SECONDS` | 300 | период reliability-recheck |
| `CLAY_SCHEDULER_INGESTION_ENABLED` | true | gate ingestion-cycle job |
| `CLAY_SCHEDULER_INGESTION_CYCLE_INTERVAL_SECONDS` | 60 | период ingestion-cycle |

Per-job gate выключает **только** свой job; master `ENABLED` гасит весь scheduler. `scheduler.started.jobs` отражает **фактически зарегистрированные** job'ы, а не intent (см. §4).

### 3. Job registration matrix + sync/async routing

| Job | Wrapper | coroutine? | Routing | id | guards |
|---|---|---|---|---|---|
| `health-tick` (B3b) | `_run_safely` | нет | ThreadPoolExecutor | `health-tick` | `max_instances=1`, `coalesce=True`, `replace_existing=True` |
| `reliability-recheck` (B4) | `_run_safely` | нет | ThreadPoolExecutor | `reliability-recheck` | то же |
| `ingestion-cycle` (B5) | `_arun_safely` | да | event loop (`executor=None`) | `ingestion-cycle` | то же |

**Контракт routing (verified live, test #4 `test_routing_matrix_sync_vs_async`):** sync job'ы оборачиваются `_run_safely` и уходят в threadpool; async job (`ingestion-cycle`) оборачивается `_arun_safely` и крутится **на event loop** (`inspect.iscoroutinefunction(job.func) is True`). Это фиксация fix'а fragment-D из B5 — регрессия «`func=_run_safely` для async» исключена на integration-уровне.

`ingestion-cycle` сериализуется `asyncio.Lock` на полном `_do_run_once` (market + context + commit) — защита от TOCTOU и наложения тиков; ручной `POST /ingestion/run` отвечает `409 IngestionCycleBusy` при занятости.

### 4. Audit topology (Ruling 1 — закреплено, уточнено confirm (b))

Два **разных класса глаголов**, они НЕ гармонизируются в один:

- **Lifecycle-глаголы планировщика:** `scheduler.started` (payload `jobs` = список фактически зарегистрированных id), `scheduler.stopped`. Пишутся в lifespan-слое (tests #5/#6).
- **`service.status_changed`** — **только** health-переходы сервисов, и пишется **исключительно call-sites'ами** (`ClayScheduler._handle_job_error` per-tick exception, `HealthTickJob.run` per-tick transition). `registry.update_status(...)` — **pure mutation без audit**.

**Confirm (b), уточнение recon §4/§5:** начальный переход `control-api STOPPED→HEALTHY` в `bootstrap.py` — **silent (не аудитится)**, и recon ошибочно называл его «первым `service.status_changed`». Это намеренно: orchestrated/bootstrap-lifecycle не порождает `status_changed`; аудитятся только наблюдаемые health-переходы во время работы. Транзиент `STOPPING` также не аудитится.

**Следствие для consumers:** подписчики должны слушать **оба** класса (lifecycle-глаголы + `status_changed`) и не ожидать `status_changed` на boot контрол-API.

### 5. Side-effect-free precondition + emit-gating

**Precondition:** до планирования job'а граф сервисов должен быть построен и согласован (`build_services()` + reconcile). Job'ы не выполняют тяжёлых сайд-эффектов в момент регистрации — только в момент тика.

**Emit-on-transition:** периодические job'ы публикуют события/audit **только на смене состояния** (anti-flood). `reliability.recheck(...)` параметризован `emit=True`; health-tick аудитит health только on-change. Это предотвращает заливание шины при стабильном состоянии на коротких интервалах.

### 6. Deploy assumption: single-worker

Контракт v1 — **один процесс / один worker**, без `--reload`. `CLAY_SCHEDULER_ENABLED` рассчитан на единственный инстанс; multi-worker без leader-election привёл бы к N-кратному дублированию тиков.

Запуск нескольких worker'ов с включённым планировщиком — **вне контракта** (см. Альтернативы / Последствия).

### 7. Partial-failure stance (Ruling 2 — закреплено)

- **Startup-fail = fail-fast.** Падение `start()` или регистрации job'а → исключение пробрасывается, boot прерывается; `app.state.scheduler` остаётся `None`, audit пуст (инвариант 2a, test #12). Приемлемо для v1: лучше не подняться, чем подняться с полу-инициализированным планировщиком.
- **Shutdown-fail = documented known-limit.** При исключении в `scheduler.shutdown()` исключение пробрасывается, `app.state` сбрасывается, но `scheduler.stopped` НЕ пишется, и возможен minor reference-leak (test #13 `test_shutdown_failure_pins_state` пинит текущее поведение). Это **задокументированный предел**, не чинится в Wave B → backlog.
- **Double-startup** (test #10) не падает — soft debt B3a, поведение запинено, не «фича».

## Канонические компоненты

- `ClayScheduler` — sync facade (B3a), owns `apscheduler` + `registry` + `audit_writer`
- `HealthTickJob` (B3b) — session-scheduler heartbeat, transition-diff
- `ReliabilityRecheckJob` (B4) — reliability snapshot, first-run seed, isolated error policy
- `IngestionCycleJob` (B5) — async, `asyncio.Lock` + `emit-on-transition`
- `SchedulerSettings` — env-gates + intervals
- `LifespanManager` integration point (`api/lifespan.py`)

## Обоснование

- Разделение lifecycle-глаголов и `status_changed` отражает разную семантику: первое — оркестрация (детерминирована, видна в логах/через свои события), второе — наблюдаемое здоровье сервисов. Слияние размыло бы оба сигнала и усложнило consumers.
- `start()`-before-assign — единственный порядок, гарантирующий, что в `app.state` не утечёт non-running scheduler; проверяется анти-тестом #12.
- Emit-on-transition + `max_instances=1` / `coalesce` — стандартный APScheduler-паттерн против flood и наложения при коротких интервалах.
- Fail-fast на старте дешевле и безопаснее для торгового рантайма, чем «подняться частично».

## Рассмотренные альтернативы

### A. Гармонизировать весь lifecycle в `service.status_changed`

Отклонено.

Причины:

- смешивает классы глаголов;
- ломает фильтрацию у consumers (SSE-стрим разделяет типы);
- размывает сигнал «здоровье сервиса» и сигнал «оркестрация прошла».

### B. Внешний планировщик (cron / Celery beat)

Отклонено для v1.

Причины:

- лишняя инфраструктура для локального web-first инструмента;
- in-process проще и достаточно при single-worker;
- усложняет local-dev (отдельный процесс для тиков).

### C. Multi-worker + leader-election сразу

Отклонено для v1, вынесено в будущее (см. Последствия).

Причины:

- вводит распределённый coordination поверх single-PC проекта;
- требует хранилища для лидерства (Redis/etcd) — overkill;
- усложняет тестирование и observability.

### D. Изоляция тестов через `app_with_sqlite` + `dependency_overrides`

Отклонено как единственный подход.

Причины:

- `dependency_overrides` перехватывают только route-deps (`get_db_session`, `get_ingestion_settings`);
- `lifespan` тянет scheduler-deps как **module-level imports** из `clay.bootstrap` — overrides не достигают;
- контракт тестирования: `build_services_for_integration(tmp_path)` (real factory) + `monkeypatch.setattr(lifespan_module, <dep>, ...)` + `LifespanManager(app)`.

## Последствия

### Положительные

- явная граница между оркестрацией и наблюдаемым здоровьем;
- consumers могут фильтровать SSE-события по типу без догадок;
- инвариант `start()`-before-assign делает state всегда consistent;
- anti-flood через emit-on-transition держит audit и шину читаемыми;
- fail-fast на старте — лучше fail-sanely для торгового рантайма;
- single-worker assumption явно зафиксирована (а не «как обычно»).

### Отрицательные

- два класса глаголов требуют дисциплины у consumers (слушать оба);
- multi-worker деплой требует отдельного ADR (leader-election или вынос scheduler);
- shutdown-fail пока не чинится — задокументированный known-limit;
- per-job env-gates добавляют 6 переменных в surface (но все опциональны с default).

## Что теперь обязательно

- явный DI в job'ы — **никаких `import clay.bootstrap` внутри `clay/scheduler/`** (A6-инвариант; проверяется grep'ом в acceptance);
- single-worker запуск, без `--reload`, при `CLAY_SCHEDULER_ENABLED`;
- `scheduler.started.jobs` = правда о зарегистрированных job'ах (не intent);
- emit-on-transition для периодических job'ов;
- `start()` строго до `app.state.scheduler = scheduler`;
- `service.status_changed` пишется только call-sites'ами (не из `registry.update_status`);
- manual `POST /ingestion/run` отвечает `409 IngestionCycleBusy` при занятом lock.

## Что это не запрещает

- миграцию на async SQLAlchemy / `asyncio.to_thread` для sync-DB внутри job'ов;
- hot-reload интервалов через RuntimeConfig (если понадобится);
- вынос планировщика в отдельный процесс или multi-worker с leader-election (через новый ADR);
- будущее расширение списка периодических job'ов (news digest, weekly report и т.п.) по тому же routing-контракту;
- альтернативные error-policies для новых job'ов (B4 pattern с `on_error` параметризацией).

## Backlog, зафиксированный этим ADR

- shutdown-fail hardening + устранение reference-leak (#13);
- `UniqueConstraint` на `news_items` и `sentiment_snapshots` (idempotency ingestion);
- lifespan-owned `httpx.AsyncClient` (вместо per-call);
- sync-DB вызовы в async job → `asyncio.to_thread`;
- retention для `ops.*` (~43k строк/мес);
- `chore(types)` burn-down (189 pyright, test-fake debt).
