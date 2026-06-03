# Текущее Состояние

**Дата:** 2026-06-03
**Где остановились:** **Wave D (live rehearsal) — ПОЛНОСТЬЮ ПРОЙДЕН.** D1 (live smoke ✅), D2 (configurable base URL ✅), D3 (429/Retry-After ✅), D4-FIX (AsyncIOExecutor ✅), D4 sustained rehearsal (30min, ~30 cycles ✅). **Wave E — ADR-008 принят, ждёт старта.** `pytest -q` → **284 passed** (262 +22 net, 0 regress). **Pyright:** total 193 (+6 test-fakes), src 36 (0 new). **Commits:** 4 ключевых в этой сессии (`aaeb7f4` D2, `b672c08` ADR-008, `e3c0db7` D3, `5dc7f8b` D4-FIX).
**Следующий шаг:** Emma выносит вердикт MVP-готовности ingestion/scheduler ядра → Wave E (exchange abstraction per ADR-008).
**Активный task-packet:** [handoffs/current.md](handoffs/current.md) — ждёт вердикта MVP.

## 🛑 Точка остановки (session handoff)

**Сессия 2026-06-03.** Полный Wave D (live rehearsal) + D4-FIX (AsyncIOExecutor). D4 sustained rehearsal: 30+ циклов, C1 UPDATE-overlap подтверждён, `coroutine never awaited` = 0, все стабильно.

**Ключевые открытия:**

1. **🔴 D4-FIX (AsyncIOExecutor):** IngestionCycleJob никогда не исполнялся через scheduler — `"default"` executor был ThreadPoolExecutor (B0 mitigation), async `_arun_safely` попадал в sync-пул → `coroutine never awaited`. Фикс: аддитивный `"async": AsyncIOExecutor()` + `executor="async"` в registration. Sync-джобы не тронуты. T2-тест доказывает исполнение.
2. **C1 UPDATE-overlap подтверждён:** первые 2 цикла — +78 новых, затем +3..+9 за цикл. >95% UPDATEs.
3. **D4 sustained rehearsal:** 0 ошибок, 0 `coroutine never awaited`, RSS/PG стабильны, shutdown чистый.

**Wave D итог:**
| Слайс | Статус | Суть |
|---|---|---|
| D1 | ✅ | Live smoke — 9/9 batches, 0 incidents |
| D2 | ✅ | Configurable `CLAY_BINANCE_BASE_URL` |
| D3 | ✅ | 429/Retry-After capped backoff |
| D4-FIX | ✅ | AsyncIOExecutor для async ingestion job |
| D4 | ✅ | Sustained rehearsal 30+ cycles, MVP-ready |

**Wyziwyg:** Система стабильно держит scheduler-driven ingestion против реального Binance. Рекомендация: MVP-ready. Ждём Emma's verdict → Wave E.

## Что сделано за эту сессию

- **D1 live smoke** — 9/9 batches, 0 incidents, 1800 bars inserted, ~5.5s
- **D2 configurable base URL** — `CLAY_BINANCE_BASE_URL` env, тесты default/custom/trailing-slash
- **D3 429/Retry-After** — `_resolve_retry_delay()` helper, capped backoff, 12 unit + 6 integration tests
- **ADR-008** — создан и закоммичен (exchange abstraction blueprint)
- **D4-FIX AsyncIOExecutor** — латентный баг найден и исправлен (coroutine never awaited)
- **D4 sustained rehearsal** — 30+ min, C1 UPDATE-overlap proof, все критерии зелёные

## Что в работе

- **Wave D — D4 report готов, жду вердикта MVP от Emma** → затем Wave E

## Блокеры
- Нет (Wave D пройден, ждём вердикта MVP)

## Ключевые файлы
- `backend/` — Python 3.14 + FastAPI + SQLAlchemy 2.0 Async + uv
- `frontend/` — React 19 + TS 5.x + Vite + Tailwind 4 + Zustand
- `docs/mission-control/adrs/adr-008-exchange-abstraction-and-multi-exchange-portability.md` — **новый ADR (Wave E)**
- `docs/mission-control/runbooks/` — операционные runbook'и
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
- Handoff: [handoffs/current.md](handoffs/current.md)
- Report: [reports/last.md](reports/last.md)
- Observation: [observations/2026-06/obs-2026-06-03-002-d1-live-smoke-results.md](observations/2026-06/obs-2026-06-03-002-d1-live-smoke-results.md)
