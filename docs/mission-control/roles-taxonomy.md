# Roles Taxonomy v1 — AI-роли Clay

> Дата: 2026-06-13
> Статус: ratified
> Связанные: ADR-010 Addendum 3 (иерархия v1)

## Принципы

- **AI advisory-only.** Все AI-роли дают сигнал/рекомендацию/аналитику.
  Право на сделку — вне AI-слоя (детерминированный код + attended-оператор).
  Инвариант до конца demo-фазы.
- Роль без источника данных = галлюцинации. Новые роли вводятся только
  вместе с реальным коннектором/источником.
- Референс: TradingAgents (UCLA/MIT), multi-agent архитектуры.

## Ярус 1 — Сенсоры

Сырые данные → структурированные сигналы. Не синтезируют,
не принимают решений.

| Роль | Статус | Модель | Источник |
|------|--------|--------|----------|
| `market-scanner` | ✅ live | gemma-4-31b / local-ollama | Binance market data |
| `news-sentiment-agent` | ✅ live (склейка news+sentiment) | gemma-4-31b | NewsAPI + sentiment |
| `onchain-analyst` | 📋 планируется | TBD | Onchain-коннектор |
| `macro-analyst` | 📋 планируется | TBD | Macro-датафид |
| `liquidity-analyst` | 📋 планируется | TBD | Order book / volume |

**Примечание:** `news-sentiment-agent` временно склеивает новости и
тональность. Позже — расклеить на `news-agent` + `sentiment-agent`.

## Ярус 2 — Интерпретаторы

Принимают сигналы от сенсоров, строят прогнозы и сценарии.

| Роль | Статус | Модель | Источник |
|------|--------|--------|----------|
| `forecast-model` | ✅ live | gemini-3.1-flash-lite | Сенсоры (scanner + sentiment) |
| `bull/bear-researcher` | 📋 пара | TBD | Сенсоры + forecast |
| `regime-detector` | 📋 планируется | TBD | Все сенсоры, макро |

## Ярус 3 — Решение / Риск

Синтезируют выводы интерпретаторов, управляют рисками.

| Роль | Статус | Модель | Вето |
|------|--------|--------|------|
| `chief-agent` | ✅ live | minimax-m3 (TokenRouter) | — |
| `risk-manager` | 📋 приоритет 1 | TBD | Право вето на сигнал |

**Правило:** `execution` — НЕ AI-роль. Детерминированный код +
attended-оператор.

## Ярус 4 — Мета

Наблюдают за качеством работы системы и моделей.

| Роль | Статус | Назначение |
|------|--------|------------|
| `reflection-agent` | 📋 планируется | Анализ собственных ошибок |
| `devils-advocate` | 📋 планируется | Контраргументы к сигналам chief |
| `model-auditor` | 📋 планируется | Мониторинг качества моделей |

## Приоритет расширения

1. `risk-manager` — право вето, критично для safety
2. `bull/bear-researcher` или `devils-advocate` (лайт-версия)
3. Расклейка `news-sentiment` → `news-agent` + `sentiment-agent`
4. `regime-detector` + `reflection-agent`
5. `onchain-analyst` / `macro-analyst` / `liquidity-analyst` — только
   по мере появления реальных источников данных
