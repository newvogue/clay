import json
from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from clay.bootstrap import event_bus


router = APIRouter(prefix="/events", tags=["events"])


def encode_sse(event_type: str, payload: dict[str, object]) -> str:
    return f"event: {event_type}\ndata: {json.dumps(payload)}\n\n"


async def event_lines() -> AsyncIterator[str]:
    queue = event_bus.subscribe()
    try:
        yield encode_sse("control.ready", {"status": "connected"})
        while True:
            message = await queue.get()
            yield encode_sse(message.event_type, message.payload)
    finally:
        event_bus.unsubscribe(queue)


@router.get("/stream")
async def get_event_stream() -> StreamingResponse:
    return StreamingResponse(
        event_lines(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"},
    )
