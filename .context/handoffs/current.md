---
date: 2026-06-04
from: Emma
status: ACTIVE — MVP-polish
slice: **MP3 (config-driven providers)** — ждёт слайса от Emma
commits:
  c3: c30a911
  mp1: facef1f
  mp4: a6b0e3f
pytest: "341 passed (+9, 0 regress)"
pyright_src: 35
source_of_truth: .context/state.md + .context/reports/last.md
---

# Active Task-packet: MP3 — config-driven providers

> **MVP-polish.** MP1 (retention) + MP4 (loud-failure logging) закрыты.
> **Next:** MP3 (config-driven providers) — вынести hardcode в settings.

Скоуп предварительно (из MP0-recon):
- `limit=200` (5 мест)
- `timeout=10.0` (3 места)
- httpx `Limits(20,10)` (`lifespan.py:104-105`)
- `MARKET/CONTEXT_THRESHOLDS` (`freshness/evaluator.py`)
- унификация settings-surface (экспорт `SchedulerSettings` из `settings/__init__.py`, рассмотреть top-level агрегат `Settings`)

Ждёт полного слайса от Emma.
