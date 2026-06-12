---
date: 2026-06-12
from: Emma
status: 3.5e CLOSED. uid 945, always-on, fail-closed proven. 5b-iii CLOSED.
pytests: "441"
pyright_src: "33 (baseline)"
ruff: "13 (src baseline)"
live_db: "5432 — НЕ ТРОГАТЬ"
podman_db: "5433 — TS2.27.1 — restart=always + podman-restart + linger (автостарт после ребута)"
tun: "UP — NL exit (node selection pending для Gemini geo)"
killswitch: "active — uid 945 only, always-on. Emma не фильтруется."
scheduler: "OFF (не запущен)"
litellm_models: "5 — gemma4-e2b, local-ollama, gemini-2.5-flash, minimax-m3, gemini-3.1-flash-lite (uid 945)"
model_registry: "7 — minimax-m3, openai-gpt-5.4-mini, anthropic-claude-sonnet-4.5, gemini-2.5-flash, forecast-lite-v1, gemini-3.1-flash-lite, gemma4:e2b-it-qat"
clay_user: "uid 945, /var/lib/clay, nologin, группа clay"
litellm_path: "/var/lib/clay/.local/share/uv/tools/litellm/bin/python"
litellm_config: "/etc/clay/litellm/ (config.yaml 640, litellm.env 600 — clay:clay)"
killswitch_nft: "/etc/clay-killswitch.nft — uid 945 only, always-on, latch/udev — history"


# Deploy-трек — 5b-iii CLOSED, 3.5e CLOSED

## Коммиты (HEAD `b59c7f3`)

| SHA | Message |
|-----|---------|
| `b59c7f3` | docs(killswitch,gateway,backlog): rewrite runbook-003 for uid-945 isolation, 3.5e-docs |
| `73b59ac` | feat(ai-control): add gemini-3.1-flash-lite registry, assign forecast-model (5b-iii.5b) |
| `6969224` | docs(mission-control): dual-transport routing, provider policy, quota runbook (5b-iii) |
| `bbf6623` | feat(ai-control): add minimax-m3 cloud model, assign chief-agent (5b-iii.4b) |
| `a4489ac` | feat(ai): LiteLLM cloud ModelClient + per-call transport routing via model registry |
| `5e2f5b8` | docs(context): update state.md + reports/last.md for 5b-iii.1 |
| `c31c782` | docs(ai): runbook-004 dual-transport + ADR-009 addendum + litellm config examples |

## Закрыто (сессия 2026-06-12)

- **3.5e.1:** пользователь `clay` (uid 945), LiteLLM под uid 945, новый nft always-on ✅ 0 коммитов
- **3.5e.2:** fail-closed verify — T2/T3/T6/T8, all green ✅ 0 коммитов
- **3.5e-docs:** runbook-003/004 rewrite, backlog update ✅ `b59c7f3`
- **DB-AUTOSTART:** `restart=always` + `podman-restart` + linger ✅ 0 коммитов
- **5b-iii:** 3 cloud × полный цикл, dual-transport live ✅ `a4489ac`..`73b59ac` (все 6 гейтов)

## Открыто / следующий

- **5c recon (субагенты):** 📋 следующий. Роли market-scanner / news-sentiment-agent.
  - Примерка Gemma 4 31B (RPD 1.5K, TPM Unlimited) как кандидата в provider pool.
  - Перед live-частью: подбор ноды (Binance ≠US + Gemini 200) — правило из runbook-004 §9.
- **FOOTGUN fix IngestionSettings:** env_file или fail-loud на live 5432
- **Provider pool free-tier:** Emma → список источников → recon → приоритезация
- **DNS metadata-leak для uid 945:** опциональное ужесточение

## Ключевые решения сессии

1. **3.5e изоляция kill-switch:** uid 945 (пользователь `clay`) вместо skuid 1000. Emma не фильтруется никогда.
2. **Always-on, latch/udev — history:** новое правило не требует событийного арма.
3. **DB-autostart:** `restart=always` + `podman-restart` + linger — контейнер переживает ребут.
4. **Node-selection rule:** нода годна = Binance ≠US + Gemini 200 (runbook-004 §9).
