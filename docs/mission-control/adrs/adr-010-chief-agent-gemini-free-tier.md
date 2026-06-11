# ADR-010 — Chief-agent на Gemini free-tier через шлюз

Дата: 2026-06-10
Статус: accepted
Связанные эпики: `E5`, `DEPLOY-5`
Решение пользователя: 3 (Gemini)
Связанные ADR: ADR-005, ADR-009

## Контекст

Chief-agent — оркестратор: синтезирует выводы суб-агентов (market-scanner, news-sentiment, forecast) и формирует итог, обязан вскрывать конфликты и не имеет права на silent-switch (роль закреплена в `ai_control`). Recon R1: текущее `INITIAL_ASSIGNMENTS` ставит chief→`openai-gpt-5.4` (заглушка). Бюджет проекта на модели — **бесплатный**. Recon R9: доступны Gemini (free-tier/CLI), relay FreeQwenApi для суб-агентов, Ollama локально.

## Решение

Роль **chief-agent** назначается на **Gemini free-tier**, маршрутизируется через LiteLLM-шлюз (ADR-009).

- Суб-агенты (market-scanner, news-sentiment) — более дешёвый/relay-вариант (FreeQwenApi) или локальные модели; **Ollama = last resort**.
- Назначение хранится в `ops.ai_assignments` через существующий governance (review→apply). Никакого hardcode вендора на роль — соблюдается ADR-005.
- Вызовы chief-agent выполняются в async scheduler-job `ai-agent-cycle`, не в request-path (recon R5).

## Последствия

- Free-tier → rate limits: нужен backoff и управляемый fallback-chain (`fallback_ready`), деградация без обвала.
- Латентность chief учитывается в бюджете async-job, не в синхронном `build_snapshot`.
- Смена провайдера chief = governance-операция (review-card), а не правка кода.

## Addendum 2026-06-11 — Dual-transport routing + live-метрики + политика провайдеров

### Архитектура роутинга (5b-iii.1)

Первоначальный дизайн (см. ADR-009 addendum) предполагал static select-функцию
в `lifespan.py`, решающую транспорт один раз на старте app. Это создавало
проблему: governance может сменить назначение в рантайме (review→apply),
а клиент в раннере остался бы stale.

**Решение:** `RoutingModelClient` — композитный `ModelClient`, держит оба
транспорта и диспатчит **per-call по `model_id`**:

```
RoutingModelClient.chat(model_id="minimax-m3")
  → transport_for("minimax-m3")  # "cloud"
  → LiteLLMModelClient.chat(...)
```

- Решение по transport-атрибуту реестра (`local` → Ollama, `cloud` → LiteLLM).
- Неизвестный/без атрибута → fail-loud `ModelUnavailableError`.
- Lifespan-вайринг тривиален: собрал два клиента → обернул в роутер → отдал
  в `AgentRunner`. `AgentRunner` ничего не знает о транспортах.

### Live-метрики (5b-iii.4c, 2026-06-11)

| Метрика | Local (gemma4:e2b-it-qat) | Cloud (minimax-m3 via TokenRouter) |
|---------|---------------------------|-----------------------------------|
| VRAM | idle → пик +2 GB | idle → пик +30 MB |
| Content | 932 / 210 токенов | 1115 / 1718 токенов |
| Thinking | 1607 / 1239 токенов | NULL |
| Latency cold | ~19 s | ~3–5 s (через шлюз) |
| Latency hot | ~6 s | ~3–5 s |

Gemini boundary-live (5b-iii.2): 200, latency 1.23s, 43 токена (12p+31c, 24 reasoning).

### Политика провайдеров (решение Emma 2026-06-11)

- **ДЕМО-режим:** любые бесплатные провайдеры и агрегаторы (TokenRouter,
  Gemini free-tier), но строго через LiteLLM-шлюз за TUN + kill-switch.
- **REAL-MONEY (будущее):** только официальные платные провайдеры с
  контрактом.
- **Секреты:** только `~/.config/clay/litellm/litellm.env` (600),
  никогда в git и никогда через чат.

## Альтернативы

- OpenAI / Anthropic (платно). Отклонено: стоимость.
- Полностью локальный chief (Ollama). Отклонено сейчас (качество/железо), **ревизуемо** как fallback/последняя инстанция. После live-пруфа cloud (minimax-m3, VRAM +30MB vs +2GB) локальный chief — шаг назад.
