from fastapi import FastAPI

from clay.api.routes.context_data import router as context_data_router
from clay.api.routes.configs import router as configs_router
from clay.api.routes.events import router as events_router
from clay.api.routes.health import router as health_router
from clay.api.routes.ingestion import router as ingestion_router
from clay.api.routes.market_data import router as market_data_router
from clay.api.routes.preflight import router as preflight_router
from clay.api.routes.runtime import router as runtime_router
from clay.api.routes.shortlist import router as shortlist_router
from clay.api.routes.services import router as services_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Clay API",
        version="0.1.0",
        summary="Local control plane for Clay",
    )
    app.include_router(configs_router)
    app.include_router(context_data_router)
    app.include_router(events_router)
    app.include_router(health_router)
    app.include_router(ingestion_router)
    app.include_router(market_data_router)
    app.include_router(preflight_router)
    app.include_router(runtime_router)
    app.include_router(shortlist_router)
    app.include_router(services_router)
    return app


app = create_app()
