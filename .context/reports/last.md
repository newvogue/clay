# Отчёт: DEPLOY-5 Phase 3 code — сессия 2026-06-11

## Что сделано

### 5b-iii.1 — LiteLLMModelClient + RoutingModelClient
- ✅ A1–A5: transport-поле, LiteLLM клиент, RoutingModelClient, wiring, 9 тестов
- ✅ 439 passed, committed `a4489ac feat(ai)`

### 5b-iii.2 — host-config Gemini-ключ + boundary-live
- ✅ Ключ из бэкапа → litellm.env (600), drop-in EnvironmentFile
- ✅ gemini-2.5-flash в config.yaml
- ✅ boundary-live: 200, 1.23s, 43 токена
- ✅ 0 коммитов

### 5b-iii.3 — attended smoke forecast-model → gemini-2.5-flash
- ✅ STARTUP прошёл, job registered
- ❌ **429 Too Many Requests** на 1-м тике (Gemini free-tier RPD=20 исчерпан)
- ✅ STOP исполнен чисто, 0 ретраев

### 5b-iii.4a — TokenRouter/MiniMax-M3 host-config + boundary-live
- ✅ Ключ в litellm.env, minimax-m3 в config.yaml
- ✅ Step 0: `MiniMax-M3` model-ID обнаружен
- ✅ boundary-live: 200, 3.78s, 219 токенов
- ✅ 0 коммитов

### 5b-iii.4b — feat: minimax-m3 в реестр + chief-agent назначение
- ✅ placeholder `openai-gpt-5.4` удалён из реестра и INITIAL_ASSIGNMENTS
- ✅ `minimax-m3` добавлен (transport=cloud)
- ✅ `chief-agent → minimax-m3` штатно (0 bypass)
- ✅ 440 passed, 0 new lint/type
- ✅ committed `bbf6623 feat(ai-control)`
- 🎯 FOOTGUN найдено: IngestionSettings не читает .env, дефолтит в live 5432

### 5b-iii.4c — attended smoke chief-agent → minimax-m3 (полный цикл)
- ✅ **2 цикла**, content_len=1115/1718, error=NULL
- ✅ thinking=NULL (cloud), VRAM +30MB (vs +2GB локально)
- ✅ **Dual-transport доказан live на обоих плечах**
- ✅ 0 коммитов

### 5b-iii-docs — документация закрытия трека
- ✅ runbook-004: dual-transport, provider procedure, quota, FOOTGUN
- ✅ ADR-010 addendum: RoutingModelClient per-call, live-метрики, provider policy
- ✅ config.yaml.example: 4 модели
- ✅ backlog: 3 пункта
- ✅ committed `6969224 docs(mission-control)`

### 5b-iii.5a — Gemini 3.1 Flash Lite host-config + boundary-live
- ✅ Новый ключ (AIzaSyB9y... → AQ.Ab8RN6...)
- ✅ Discovery: `gemini-3.1-flash-lite` стабильный
- ✅ boundary-live: **200, 0.69s, 19 токенов**
- ✅ 5 моделей в шлюзе
- ✅ 0 коммитов

## Коммиты (сессия)

| SHA | Message |
|-----|---------|
| `6969224` | docs(mission-control): dual-transport routing, provider policy, quota runbook (5b-iii) |
| `bbf6623` | feat(ai-control): add minimax-m3 cloud model, assign chief-agent (5b-iii.4b) |
| `a4489ac` | feat(ai): LiteLLM cloud ModelClient + per-call transport routing via model registry |
| `5e2f5b8` | docs(context): update state.md + reports/last.md for 5b-iii.1 |

HEAD `6969224`.
