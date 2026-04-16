import pytest

from clay.db.repositories_context import ContextRepository
from clay.db.repositories_market import MarketRepository
from clay.db.repositories_ops import OpsRepository
from clay.ingestion.context.connectors.demo_news import DemoNewsConnector
from clay.ingestion.context.connectors.demo_sentiment import DemoSentimentConnector
from clay.ingestion.context.manager import ContextConnectorManager
from clay.ingestion.market.service import MarketIngestionService
from clay.ingestion.service import IngestionCycleService


class FakeBinanceClient:
    async def fetch_klines(self, symbol: str, interval: str, limit: int = 200):
        del symbol, interval, limit
        return [
            [
                1711954800000,
                "70250.10",
                "70420.00",
                "70180.40",
                "70390.20",
                "123.45",
                1711955699999,
                "8670000.10",
            ],
        ]


@pytest.mark.anyio
async def test_ingestion_cycle_persists_market_context_and_ops_records(
    db_session,
    sqlite_settings,
) -> None:
    service = IngestionCycleService(
        settings=sqlite_settings,
        market_service=MarketIngestionService(FakeBinanceClient()),
        context_manager=ContextConnectorManager(
            [DemoNewsConnector(), DemoSentimentConnector()],
        ),
    )

    summary = await service.run_once(db_session)

    market_repository = MarketRepository(db_session)
    context_repository = ContextRepository(db_session)
    ops_repository = OpsRepository(db_session)

    assert summary.market_records_written == 4
    assert summary.news_records_written == 1
    assert summary.sentiment_records_written == 1
    assert summary.freshness_updates_written == 4
    assert len(market_repository.list_latest_bars()) == 4
    assert len(market_repository.list_freshness_statuses()) == 4
    assert context_repository.latest_news(limit=1)[0].source_name == "demo_news_feed"
    assert context_repository.latest_sentiment(limit=1)[0].source_name == "demo_sentiment_feed"
    assert len(ops_repository.latest_connector_statuses()) == 2
