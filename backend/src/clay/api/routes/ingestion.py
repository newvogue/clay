from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from clay.api.dependencies import get_db_session, get_ingestion_cycle_service
from clay.bootstrap import audit_writer, event_bus
from clay.db.repositories_context import ContextRepository
from clay.db.repositories_market import MarketRepository
from clay.db.repositories_ops import OpsRepository
from clay.freshness.evaluator import evaluate_context_freshness, evaluate_market_freshness
from clay.ingestion.service import IngestionCycleService


router = APIRouter(prefix="/ingestion", tags=["ingestion"])


@router.get("/health")
async def get_ingestion_health(
    session: Annotated[Session, Depends(get_db_session)],
) -> dict[str, object]:
    now = datetime.now(UTC)
    market_repo = MarketRepository(session)
    context_repo = ContextRepository(session)
    ops_repo = OpsRepository(session)

    freshness_rows = market_repo.list_freshness_statuses()
    market_items = []
    market_status = "fresh"
    blocks_active_trading = False
    for row in freshness_rows:
        evaluated = evaluate_market_freshness(
            timeframe=row.timeframe,
            last_received_at=row.latest_bar_open_time,
            now=now,
        )
        market_items.append(
            {
                "symbol": row.symbol,
                "timeframe": row.timeframe,
                "status": row.freshness_state,
                "evaluated_at": row.evaluated_at.isoformat(),
                "latest_bar_open_time": (
                    row.latest_bar_open_time.isoformat()
                    if row.latest_bar_open_time is not None
                    else None
                ),
                "reason": evaluated.reason,
            },
        )
        if row.freshness_state != "fresh":
            market_status = row.freshness_state
            blocks_active_trading = True

    latest_news = context_repo.latest_news(limit=1)
    latest_sentiment = context_repo.latest_sentiment(limit=1)
    news = evaluate_context_freshness(
        stream_name="news",
        last_received_at=latest_news[0].published_at if latest_news else None,
        now=now,
    )
    sentiment = evaluate_context_freshness(
        stream_name="sentiment",
        last_received_at=latest_sentiment[0].captured_at if latest_sentiment else None,
        now=now,
    )
    connector_statuses = ops_repo.latest_connector_statuses()
    context_status = "fresh"
    if (
        news.status != "fresh"
        or sentiment.status != "fresh"
        or any(
            row.status in {"degraded", "error"}
            for row in connector_statuses
        )
    ):
        context_status = "degraded"

    return {
        "market": {
            "status": market_status if market_items else "unknown",
            "blocks_active_trading": blocks_active_trading,
            "items": market_items,
        },
        "context": {
            "status": context_status,
            "streams": {
                "news": news.status,
                "sentiment": sentiment.status,
            },
            "connectors": [
                {
                    "connector_id": row.connector_id,
                    "connector_type": row.connector_type,
                    "status": row.status,
                    "observed_at": row.observed_at.isoformat(),
                }
                for row in connector_statuses
            ],
        },
        "incidents": [
            {
                "source_name": row.source_name,
                "severity": row.severity,
                "message": row.message,
                "recorded_at": row.recorded_at.isoformat(),
            }
            for row in ops_repo.latest_incidents()
        ],
    }


@router.post("/run")
async def run_ingestion_cycle(
    session: Annotated[Session, Depends(get_db_session)],
    service: Annotated[IngestionCycleService, Depends(get_ingestion_cycle_service)],
) -> dict[str, object]:
    summary = await service.run_once(session)
    payload = summary.as_payload()
    audit_writer.write("ingestion.run", payload)
    event_bus.publish("ingestion.updated", payload)
    return payload
