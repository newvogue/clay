import pytest

from clay.ingestion.context.connectors.demo_news import DemoNewsConnector
from clay.ingestion.context.connectors.demo_sentiment import DemoSentimentConnector
from clay.ingestion.context.manager import ContextConnectorManager


def test_demo_news_connector_exposes_required_contract_fields() -> None:
    connector = DemoNewsConnector()

    assert connector.connector_id == "demo-news"
    assert connector.connector_type == "news"
    assert connector.source_name == "demo_news_feed"
    assert connector.enabled is True


def test_demo_sentiment_connector_exposes_required_contract_fields() -> None:
    connector = DemoSentimentConnector()

    assert connector.connector_id == "demo-sentiment"
    assert connector.connector_type == "sentiment"
    assert connector.source_name == "demo_sentiment_feed"


@pytest.mark.anyio
async def test_context_manager_skips_disabled_connectors() -> None:
    connector = DemoNewsConnector()
    connector.enabled = False
    manager = ContextConnectorManager([connector])

    results = await manager.run_once()

    assert len(results) == 1
    assert results[0].status == "disabled"
    assert results[0].payloads == []


@pytest.mark.anyio
async def test_context_manager_processes_enabled_connectors() -> None:
    manager = ContextConnectorManager([DemoNewsConnector(), DemoSentimentConnector()])

    results = await manager.run_once()

    assert len(results) == 2
    assert sum(len(result.payloads) for result in results) == 2
    assert all(result.status == "healthy" for result in results)
