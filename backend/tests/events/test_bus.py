import asyncio

import pytest

from clay.events.bus import EventBus


@pytest.mark.anyio
async def test_event_bus_delivers_messages_to_subscribers() -> None:
    bus = EventBus()
    queue = bus.subscribe()

    try:
        bus.publish("runtime.updated", {"state": "pre_session"})
        message = await asyncio.wait_for(queue.get(), timeout=1.0)
    finally:
        bus.unsubscribe(queue)

    assert message.event_type == "runtime.updated"
    assert message.payload == {"state": "pre_session"}
