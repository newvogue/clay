# Текущее Состояние

**Дата:** 2026-06-04
**Где остановились:** **MP4 — loud-failure / observability завершён.** `pytest -q` → **341 passed** (332→341, +9 net, 0 regress). Pyright src 35 (baseline). Миграция 0011.
**Следующий шаг:** MP3 (config-driven providers) — ждёт от Emma.

## 🛑 Точка остановки (session handoff)

**Сессия 2026-06-04 (продолжение).** MVP-polish: E6a+b → MP0 → MP1 → MP4.

**Что сделано (эта сессия):**
1. **MP1** ✅ — ratified, committed (`facef1f`)
2. **MP4** ✅ — ratified, committed (`a6b0e3f`)
3. **C3 route refactor** ✅ — committed separately (`c30a911`)

**Wave E composition (historical, done previous session):**
| Слайс | Статус |
|---|---|
| E1–E6b | ✅ FORMALLY CLOSED |

**MP1 итог:**
- 9 файлов: 0011 миграция + retention/jobs + scheduler/jobs + scheduler/service + settings/scheduler + models_ops (index fix) + 3 test файла
- Микрофикс: `index=True` на `IngestRun.started_at` (модель = DDL)
- C3-роут вынесен в отдельный коммит

**MP4 итог:**
- 9 файлов: `core/logging.py` (own-handler, `propagate=False`, guard), wiring в `create_app()`, 3 no-log sites, 6+ тестов
- Site 1: `_collect_market_bars` — `logger.warning` перед упаковкой в `_MarketBatch.error`
- Site 2: `_fetch_market_bars` retry-loop — per-attempt `logger.warning` + финальный `logger.error`
- Site 3: `context/manager.py` — module-logger + `logger.exception`
- 2 caplog-fix: `test_clay_scheduler`, `test_context_repositories_dedup` (collateral от `propagate=False`)
- pyright 196→194 (−2, бонус)

**Ключевые решения сессии:**
- ADR-009 принят Emma (ops.* retention policy) — коммитит сама
- Logging-config: собственный handler на `clay` + `propagate=False` + sentinel-guard (НЕ propagate-only — упрётся в `logging.lastResort`)
- `_reset_clay_logging()` в тестах — чистит handlers/sentinel между тестами
- autogenerate сломан project-wide (pre-existing, `0001` base) — drift-detection в backlog
- Коммиты: C3 → MP1 → MP4 (push в origin)

## Блокеры
— нет

## Ключевые файлы (MP4)
- `src/clay/core/logging.py`
- `src/clay/ingestion/service.py` (+2 no-log sites)
- `src/clay/ingestion/context/manager.py` (+site 3)
- `tests/core/test_logging.py` (6 тестов конфига)
- `tests/ingestion/test_fetch_retry_integration.py` (+2 emission теста)
- `tests/ingestion/test_context_connectors.py` (+1 emission тест)

## Маршруты и AI Rules
— без изменений.
