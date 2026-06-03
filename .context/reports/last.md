# Report: Wave D — live rehearsal (full wave)

> **Сессия 2026-06-03. Wave D — ПОЛНОСТЬЮ ПРОЙДЕН.** D1 ✅ D2 ✅ D3 ✅ D4-FIX ✅ D4 ✅. **284 passed** (262 → 284, +22 net, 0 regress). **Pyright:** total 193, src 36. **4 коммита** в этой сессии.
>
> **Главное открытие:** D4-FIX — латентный баг scheduler-driven ingestion. Async `IngestionCycleJob._arun_safely` попадал в sync ThreadPoolExecutor → `coroutine never awaited`, цикл никогда не исполнялся планировщиком. D1-успех был только ручной `POST /ingestion/run`. Фикс: аддитивный `AsyncIOExecutor` + `executor="async"`. T2-тест доказывает исполнение.

## D1 — первый bounded live-smoke ✅

| Метрика | Значение |
|---|---|
| Batches | 9/9 success |
| Incidents | 0 |
| Bars inserted | 1,800 |
| Latency | ~5.5s |
| Freshness | Все FRESH |
| Флаг-условия | 0 |

Observation: `observations/2026-06/obs-2026-06-03-002-d1-live-smoke-results.md`

## D2 — configurable `CLAY_BINANCE_BASE_URL` ✅

| # | Файл | Изменение |
|---|---|---|
| 1 | `settings/ingestion.py` | +`binance_base_url: str = "https://api.binance.com"` |
| 2 | `bootstrap.py` | `BinanceSpotClient(base_url=ingestion_settings.binance_base_url)` |
| 3 | `test_ingestion_schema.py` | +default-value pin |
| 4 | `test_binance_client.py` | +custom URL + trailing-slash tests |

Commit: `aaeb7f4 feat(market): configurable CLAY_BINANCE_BASE_URL`

## ADR-008 — Exchange abstraction blueprint ✅

Commit: `b672c08 docs(adr): add ADR-008 exchange abstraction and multi-exchange portability`

## D3 — 429/Retry-After capped backoff ✅

| # | Файл | Изменение |
|---|---|---|
| 1 | `settings/ingestion.py` | +`binance_retry_after_cap_seconds: float = 60.0` |
| 2 | `ingestion/service.py` | +`_resolve_retry_delay()` helper, capped Retry-After, logger.warning |
| 3 | `test_retry_delay.py` | **new** — 12 unit tests (seconds/HTTP-date/fallback/418) |
| 4 | `test_fetch_retry_integration.py` | **new** — 6 integration tests (429/500/cap/retry-success/exhausted) |

Commit: `e3c0db7 feat(market): honor Binance 429/Retry-After with capped backoff`

## D4-FIX — AsyncIOExecutor for async ingestion job ✅

**🔴 Критическое открытие:** `AsyncIOScheduler` constructor заменял `"default"` executor на `ThreadPoolExecutor(max_workers=4)` (B0 mitigation для sync health/reliability). `add_ingestion_cycle_job()` без явного executor → попадал в sync-пул → `_arun_safely` (async def) возвращал coroutine, которая никогда не авайтилась. Ingestion-цикл НЕ ИСПОЛНЯЛСЯ через планировщик.

**Фикс:** аддитивный `"async": AsyncIOExecutor()` в executors dict + `executor="async"` в registration. Sync-джобы не тронуты.

**Тесты:**
- **T1** (registration pin): ingestion-cycle → `executor="async"`, health/reliability → `executor="default"`
- **T2** (execution proof): реальный AsyncIOScheduler с near-immediate триггером доказывает, что `run_once` вызывается

Commit: `5dc7f8b fix(scheduler): route async ingestion job to AsyncIOExecutor`

## D4 — sustained rehearsal ✅

**Env:** prod API (`https://api.binance.com`), Frankfurt DE proxy
**Duration:** 31 min, ~30 scheduler cycles

### Снимки

| Время | Bars count | Δ | Market | Incidents |
|---|---|---|---|---|
| t0 (16:28) | 5,276 | — | stale | — |
| +1.5m | 5,354 | +78 (1st cycle) | fresh | 0 |
| +3.5m | 5,360 | +6 (2nd cycle) | fresh | 0 |
| +10m | 5,363 | +3 | fresh | 0 |
| +20m | 5,372 | +9 | fresh | 0 |
| +30m | 5,378 | +6 | fresh | 0 |

### Критерии MVP

| Критерий | Статус |
|---|---|
| ≥20 циклов, 0 unhandled errors/traceback | ✅ ~30 циклов |
| `updated > 0` (C1 UPDATE-overlap) | ✅ 2nd+ cycles: +3 to +9, >95% UPDATEs |
| 0 PK-нарушений, нелинейный рост | ✅ 5,276 → 5,378 за 30 мин |
| Freshness стабильно fresh | ✅ |
| /ingestion/health стабильно healthy | ✅ incidents=0 весь прогон |
| Ресурсы без роста | ✅ RSS ~112MB flat, PG 3 conn |
| Egress стабилен | ✅ ни одного сбоя |
| Чистый shutdown | ✅ 0 ошибок, http-client закрыт |
| `coroutine never awaited` | **0** — фикс держится |

**Вердикт: ingestion/scheduler ядро (epic e2) — MVP-ready ✅**

### Сводка acceptance по волне D

| | |
|---|---|
| pytest | **284 passed** (+22 net, 0 regress) |
| Pyright src | **36** (0 new) |
| A6 invariant | ✅ 0 `import bootstrap` in `scheduler/` |
| basicConfig | not touched ✅ |
| Client (`binance_client.py`) | not touched ✅ |
| Sync jobs unchanged | ✅ |

**Next:** Emma выносит финальный вердикт MVP → Wave E (exchange abstraction per ADR-008).
