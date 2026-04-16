import pytest

from clay.api.routes.events import get_event_stream


@pytest.mark.anyio
async def test_events_stream_returns_sse_response() -> None:
    response = await get_event_stream()

    assert response.headers["content-type"].startswith("text/event-stream")

    first_chunk = await response.body_iterator.__anext__()
    assert first_chunk == 'event: control.ready\ndata: {"status": "connected"}\n\n'

    await response.body_iterator.aclose()
