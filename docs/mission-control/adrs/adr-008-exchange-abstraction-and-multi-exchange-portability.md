# ADR-008: Exchange Abstraction & Multi-Exchange Portability

- **Status:** Proposed (реализация — Wave E, ПОСЛЕ Wave D)
- **Date:** 2026-06-03
- **Deciders:** Emma (product), Architect
- **Related:** ADR-005 (model-provider-abstraction — аналогичный паттерн), build_specs/e2-data-ingestion-and-local-historical-store, Wave D (real-data rehearsal)

## Context

- Clay сейчас жёстко завязан на Binance Spot на уровне market-data ingestion: единственный конкретный `BinanceSpotClient`, endpoint `GET /api/v3/klines`, формат символов `BTCUSDT`, Binance weight/rate-limit модель.
- Бизнес-требование (Emma): приложение должно **полноценно работать с несколькими биржами**. Это resilience-требование: биржа может стать недоступна (регуляторика, гео-бан, техсбой) или обанкротиться (прецедент FTX). Single-exchange = single point of failure.
- Дополнительный фактор: D1 live-contact состоялся только через DE-прокси (Frankfurt) → прямой доступ из РФ к `api.binance.com` не гарантирован → переносимость источников данных усиливает устойчивость.
- Storage-слой `market_bars` (OHLCV) уже exchange-нейтрален.

## Decision

Ввести абстракцию источника рыночных данных (`ExchangeClient` / `MarketDataSource` Protocol), под которой Binance — первая из нескольких взаимозаменяемых реализаций. Абстракцию **извлекаем из работающего, валидированного Binance-pipeline** (после Wave D), а не проектируем заранее (rule-of-three).

Состав:

1. **`ExchangeClient` Protocol** — единый контракт (`fetch_klines(symbol, timeframe) -> list[NormalizedMarketBar]`, метаданные capability).
2. **`NormalizedMarketBar` DTO** — внутренний канонический формат свечи.
3. **Symbol & timeframe normalization** layer (per-exchange): `BTCUSDT` ↔ `BTC-USD` и т.п.
4. **Per-exchange rate-limit / capability модель.**
5. **`exchange`/`source` столбец в `market_bars`**; расширение PK до `(exchange, symbol, timeframe, bar_open_time)` (Alembic-миграция, additive).
6. **Config-driven выбор** активной биржи(бирж).
7. **Минимум одна вторая биржа** как proof-of-seam.

## Non-goals

- Multi-exchange **execution** (отправка ордеров: auth, ключи, order-API каждой биржи) — отдельный, более тяжёлый под-слой; откладывается. Q5 (manual-only) и demo-симуляция остаются в силе.
- **CMC (CoinMarketCap)** — агрегатор, не биржа; возможный отдельный broad-market источник, не CEX-адаптер. Решается отдельно.
- **Desktop-упаковка** (horizon).

## Sequencing

`A → B → C → D (Binance live, validated reference) → Wave E (этот ADR) → MVP-polish`

Стартует после принятия **D4** (MVP-readiness verdict по Binance). D2 (`CLAY_BINANCE_BASE_URL`) переезжает внутрь Binance-адаптера как per-adapter config (testnet / `data-api.binance.vision` / geo).

## Implementation outline (предварительные слайсы)

- **E0** — Recon Binance-специфики + финализация этого ADR.
- **E1** — `NormalizedMarketBar` + `exchange` столбец + миграция (additive, обратносовместимо).
- **E2** — извлечь `ExchangeClient` Protocol; `BinanceSpotClient` → первая реализация (0 изменений поведения, тесты зелёные).
- **E3** — symbol/timeframe normalization + capability модель.
- **E4** — config-driven выбор биржи (дефолт Binance, zero behavior change).
- **E5** — вторая биржа (proof-of-seam), end-to-end ingestion.
- **E6** — финализация doc/ADR, обновление плана.

*(Точная нарезка фиксируется на E0.)*

## Consequences

**Плюсы:** устойчивость к недоступности/краху одной биржи; чистое аддитивное расширение (новая реализация интерфейса, не переписывание); storage уже готов; зеркалит проверенный паттерн ADR-005.

**Издержки:** миграция PK `market_bars`; рост сложности конфигурации; нормализация символов — источник тонких багов; вторая биржа = доп. объём тестов.

**Риски:** преждевременная абстракция → смягчён принципом «извлекать из работающего примера после Wave D».

## Open questions

- Вторая биржа для proof-of-seam: Coinbase / OKX / Bybit / Kraken?
- Включать ли CMC-агрегатор как отдельный broad-market источник в Wave E или позже?
- Промотировать ли Wave E в полноценный эпик `e13` (build_spec + implementation_plan) или оставить ADR + слайсы?
