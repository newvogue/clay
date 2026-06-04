# Report: Wave E — E2 source в identity

> **Сессия 2026-06-04.** E1 закоммичен (commit `6d6953f`). E2 закоммичен. **288 passed** (286 → 288, +2 net, 0 regress). Pyright src 35 (baseline 35).

## E2 — source становится частью identity ✅

### Решения Emma (Q1-Q3)
- **Q1 — один слайс**: атомарно (schema + code + tests), DDL мгновенный
- **Q2 — server_default СНИМАЕМ**: forgotten source = NOT NULL violation, не mislabel; multi-exchange hazard
- **Q3 — OrderBookSummary**: 0 касаний (dormant)

### Создано
| Файл | Суть |
|---|---|
| `backend/alembic/versions/0010_e2_source_in_identity.py` | Миграция: UC расширены, DROP DEFAULT, ADD COLUMN +source |
| `.context/observations/2026-06/obs-2026-06-04-001-e2-source-in-identity.md` | Observation E2 |

### Изменено (3 source + ~18 test)
| Файл | Суть |
|---|---|
| `db/models_market.py` | FreshnessStatus +source; UC расширены на обоих; 0 default |
| `db/repositories_market.py` | `upsert_freshness_status(..., source)`, WHERE += source |
| `ingestion/service.py` | source: success=`latest_bar.source`, failure=`client.source` (не литерал) |
| 18 test-файлов | `source="binance_spot"` во все вызовы `upsert_freshness_status` |

### Проверки
| Критерий | Статус |
|---|---|
| (a) PK не тронут | ✅ |
| (b) server_default снят | ✅ |
| (c) failure-path из client.source | ✅ |
| (d) up/down/up на PG | ✅ |
| (e) orderbook не тронут | ✅ |
| (f) литерал `'binance_spot'` в проде | ❌ нет |
| (g) положительные пины | ✅ 2 теста |

### Acceptance
| | baseline | E2 | Δ |
|---|---|---|---|
| pytest | 286 | **288** | +2 (source-UC + freshness-source) |
| regressions | — | 0 | ✅ |
| pyright src | 35 | **35** | 0 new |
| migrations | 1 (0010) | up/down/up | ✅ |

### Отложено в E3/E5
- Read-side source-фильтрация (6 freshness + 4 bars sites) — E3
- `list_latest_bars()` dedup на `(symbol, timeframe)` без source — E3
- Bybit адаптер — E4
