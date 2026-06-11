# Отчёт: DEPLOY-5 Phase 3 code — сессия 2026-06-11

## Что сделано

### 5b-iii.1 — LiteLLMModelClient + RoutingModelClient (эта сессия)
- ✅ A1: transport-поле на ModelVersion dataclass, все записи реестра дополнены, gemma4:e2b-it-qat добавлена в реестр, метод transport_for() fail-loud
- ✅ A2: LiteLLMModelClient(ModelClient) — обёртка над LLMAdapter, маппит chat() → chat_completion(), httpx ошибки → ModelUnavailableError
- ✅ A3: RoutingModelClient(ModelClient) — per-call dispatch по transport_lookup(model_id), fail-loud на неизвестный transport
- ✅ A4: wiring в lifespan.py — оба клиента собраны, обёрнуты в роутер, переданы в AgentRunner (AgentRunner не тронут)
- ✅ A5: 9 offline тестов (routing local/cloud/unknown, LiteLLM happy/empty/500/connect, registry validation)
- ✅ G1-G4: 439 passed (0 failed), ruff/pyright baseline only (0 new), 0 egress
- ✅ Committed: `a4489ac feat(ai)`

## Коммиты

| SHA | Message |
|-----|---------|
| `a4489ac` | feat(ai): LiteLLM cloud ModelClient + per-call transport routing via model registry |
| `c31c782` | docs(ai): runbook-004 dual-transport + ADR-009 addendum + litellm config examples |

HEAD `a4489ac`.
