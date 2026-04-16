# Clay

Your own trading workspace. Signals, review, and control.

## Current Status

This repository is the implementation workspace for `Clay`.

At the moment:

- the architecture and planning phase are complete;
- implementation starts here;
- the first delivery target is `Wave 1`:
- `E1` runtime foundation
- `E2` data ingestion and local historical store
- `E4` control center and runtime operations

## E1 Progress

The current implementation already includes:

- runtime states and controlled transitions;
- XDG-aware config loading with validation and rollback;
- service registry and safe lifecycle actions;
- preflight checks and audit trail scaffolding;
- backend control API for runtime, services, configs, and health;
- minimal React shell wired to live backend data.

## E2 Progress

The current `E2` backend slice already includes:

- ingestion settings and DB bootstrap contracts;
- ORM schema baseline for `market`, `context`, and `ops`;
- Alembic migration skeleton for the first ingestion baseline;
- market normalization contracts for Binance Spot klines;
- pluggable demo connectors for news and sentiment;
- freshness and retention helpers;
- storage-backed repositories for market/context/ops domains;
- orchestration flow for a full ingest cycle;
- downstream backend routes backed by persisted data instead of demo payloads.

## Repository Layout

- `backend/` — future backend application and runtime services
- `frontend/` — future web UI application
- `docs/planning/` — imported planning source documents needed during implementation
- `scripts/` — helper scripts for local development and repo automation

## Planning Source

The most important planning references live in `docs/planning/`:

- `blueprint-v1.md`
- `tech-stack-v1.md`
- `execution-backlog-v1.md`
- `master-planning-review-v1.md`

Implementation should follow those documents rather than reinvent system boundaries during coding.

## Bootstrap Commands

Backend:

```bash
make backend-install
make backend-test
make backend-run
cd backend && uv run alembic upgrade head
```

Frontend:

```bash
make frontend-install
make frontend-test
make frontend-build
make frontend-run
```

## Local Environment

Copy `.env.example` if you want to override defaults for local development.

- `CLAY_API_HOST` and `CLAY_API_PORT` define the backend bind address.
- `CLAY_DATABASE_URL` defines the PostgreSQL/TimescaleDB connection used by `E2`.
- `VITE_CLAY_API_BASE_URL` defines which backend URL the frontend shell calls.

## E2 Notes

- `E2` expects PostgreSQL with TimescaleDB available before running real migrations.
- test coverage uses SQLite with schema translation, while runtime remains targeted at PostgreSQL/TimescaleDB.
- Current `E2` routes:
  - `GET /ingestion/health`
  - `POST /ingestion/run`
  - `GET /market-data/bars/latest`
  - `GET /context-data/summary`
  - `GET /shortlist/metrics`
