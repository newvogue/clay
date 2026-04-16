from collections.abc import Generator

from sqlalchemy.orm import Session, sessionmaker

from clay.bootstrap import (
    context_connector_manager,
    ingestion_cycle_service,
    ingestion_session_factory,
    ingestion_settings,
    market_ingestion_service,
)
from clay.ingestion.context.manager import ContextConnectorManager
from clay.ingestion.market.service import MarketIngestionService
from clay.ingestion.service import IngestionCycleService
from clay.settings.ingestion import IngestionSettings


def get_ingestion_settings() -> IngestionSettings:
    return ingestion_settings


def get_session_factory() -> sessionmaker:
    return ingestion_session_factory


async def get_db_session() -> Generator[Session, None, None]:
    with ingestion_session_factory() as session:
        yield session


def get_market_ingestion_service() -> MarketIngestionService:
    return market_ingestion_service


def get_context_connector_manager() -> ContextConnectorManager:
    return context_connector_manager


def get_ingestion_cycle_service() -> IngestionCycleService:
    return ingestion_cycle_service
