# Текущее состояние Clay

- **Infrastructure & Ingestion:** ✅ MVP-ready (Live-gates G0-G4 closed).
- **Trading Layer (FSM):** ✅ MVP-ready (Finding G CLOSED).
- **DEPLOY TRACK:** ✅ G6-obs → DEPLOY-0/0.1/1/2/3/3.5a/3.5a-V2/3.5b/3.5c/3.5d/4 closed.
- **DEPLOY-5-RECON + DOCS α1/α2:** ✅ CLOSED.
- **DEPLOY-5 Phase 3 (code):** активен. 5a-5b код в работе.
- **HEAD:** `a4489ac` — feat(ai): LiteLLM cloud ModelClient + per-call transport routing via model registry
- **origin/main:** `3a325b0` запушено (8 коммитов не запушены).

## DEPLOY TRACK

- **DEPLOY-0** (baseline): ✅ CLOSED. 409/33/47.
- **DEPLOY-0.1** (test/tooling hygiene): ✅ CLOSED. Commit `c091ac8`.
- **DEPLOY-1** (TimescaleDB Podman): ✅ CLOSED. Commit `4a353c7`. Порт `127.0.0.1:5433`.
- **DEPLOY-2** (app-on-host + alembic + health): ✅ CLOSED. 0-commit.
- **DEPLOY-3** (egress verify): ✅ CLOSED.
- **DEPLOY-3.5a** (kill-switch recon): ✅ CLOSED.
- **DEPLOY-3.5a-V2** (owner-anchor recon): ✅ CLOSED.
- **DEPLOY-3.5b** (nft kill-switch): ✅ CLOSED.
- **DEPLOY-3.5c** (persistence): ✅ CLOSED.
- **DEPLOY-3.5d** (kill-switch boot-fix): ✅ CLOSED. HEAD `3a325b0`.
- **DEPLOY-4** (scheduler ON): ✅ CLOSED.
- **DEPLOY-5-RECON** (R1–R9): ✅ CLOSED.
- **DEPLOY-5-DOCS-α1** (ADR-009..012): ✅ CLOSED.
- **DEPLOY-5-DOCS-α2** (build_spec + impl_plan + runbooks + backlog): ✅ CLOSED.
- **DEPLOY-5 Phase 3 code:**
  - **5a-i** (llm adapter): ✅ CLOSED. `5aaf981 feat(llm)`
  - **5a-ii** (litellm install): ✅ CLOSED. Host-native LiteLLM 1.88.1, systemd --user clay-litellm.service, Ollama gemma4:e2b-it-qat
  - **DOCS-LL-1** (runbook-004 + deploy/): ✅ CLOSED. `4eaf175 docs(runbook)`
  - **5b-ii.0** (model + context fix): ✅ CLOSED. gemma4:e2b-it-qat pulled, OLLAMA_CONTEXT_LENGTH=65536, dual-transport decision
  - **5b-ii.1** (AgentRunner): ✅ CLOSED. `e4da83a feat(ai_control)`
  - **5b-ii.2a** (resolver+settings+fail-loud): ✅ CLOSED. `3aa8da3 feat(ai_control)`
  - **5b-ii.2b-i** (persistence model + migration): ✅ CLOSED. `50ccfdf feat(db)`
   - **5b-ii.2b-ii** (scheduler ai-agent-cycle): ✅ CLOSED. `2c520df feat(scheduler)`
   - **5b-ii-docs** (docs-слайс): ✅ CLOSED. `c31c782 docs(ai)`
    - **5b-iii.1** (LiteLLMModelClient + RoutingModelClient): ✅ CLOSED. `a4489ac feat(ai)`
    - **5b-iii.2** (host-config ключи + attended boundary-live): 📋 следующий
    - **5b-iii.3** (attended live-smoke): 📋 после .2
- **DEPLOY-CUTOVER** (pg_dump live→podman): 📋 отложен.

## Pending

- **5b-iii.2:** GEMINI_API_KEY из бэкапа → окружение юнита шлюза, gemini/gemini-2.5-flash в config.yaml, 0 коммитов
- **5b-iii.3:** attended boundary-live smoke (CLAY_SCHEDULER_AI_AGENT_ROLE_ID=forecast-model)
- **G6-tune wave** — отложено
- **Post-G5 Cleanup:** Ruff-47 — отложено
- **Push origin:** 8 коммитов не запушены

## Critical Context

- **Live-5432** НЕ ТРОГАТЬ. **Podman-5433** — рабочая БД.
- **CLAY_DATABASE_URL** = `localhost:5433` (podman). FOOTGUN A обойдён.
- **TUN UP** (exit=🇳🇱 Netherlands, MIRhosting). Kill-switch вооружён (udev-arm).
- **Scheduler ON**: `CLAY_SCHEDULER_ENABLED=true`.
- **LiteLLM:** host-native (uv tool, 1.88.1), порт 4000, systemd --user unit, Ollama gemma4:e2b-it-qat
- **Ollama:** system-сервис, `OLLAMA_HOST=127.0.0.1`, `OLLAMA_CONTEXT_LENGTH=65536`, `OLLAMA_NUM_PARALLEL=1`, порт 11434
- **Dual-transport:** локаль через нативный Ollama `/api/chat` (thinking+content, num_ctx=65536), внешка — через LiteLLM gateway
- **test:** 439 passed (0 failed). 2 pre-existing не проявились.
- **Ключи провайдеров:** в бэкапе `~/.config/clay/_backup/old-podman-litellm-*.tar.gz`

## Commits (все, с головы)

 | SHA | Message |
 |-----|---------|
 | `a4489ac` | feat(ai): LiteLLM cloud ModelClient + per-call transport routing via model registry |
 | `c31c782` | docs(ai): runbook-004 dual-transport + ADR-009 addendum + litellm config examples |
| `2c520df` | feat(scheduler): ai-agent-cycle job — chief-agent snapshot->runner->ops.ai_agent_runs, flag-gated off by default |
| `50ccfdf` | feat(db): ops.ai_agent_runs table + AIAgentRun model (0015) for agent-run persistence |
| `3aa8da3` | feat(ai_control): ServiceModelResolver, OllamaSettings, fail-loud ModelUnavailableError |
| `e4da83a` | feat(ai_control): AgentRunner with native Ollama ModelClient + offline tests |
| `4eaf175` | docs(runbook): host-native litellm gateway runbook-004 + deploy/litellm reference config & unit |
| `5aaf981` | feat(llm): scaffold httpx OpenAI-compat adapter + CLAY_LLM_* settings + offline stub smoke | |
