import asyncio
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class EventMessage:
    event_type: str
    payload: dict[str, Any]


class EventBus:
    """In-memory event fan-out for local SSE subscribers."""

    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue[EventMessage]] = set()

    def subscribe(self) -> asyncio.Queue[EventMessage]:
        queue: asyncio.Queue[EventMessage] = asyncio.Queue(maxsize=32)
        self._subscribers.add(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue[EventMessage]) -> None:
        self._subscribers.discard(queue)

    def publish(self, event_type: str, payload: dict[str, Any]) -> None:
        message = EventMessage(event_type=event_type, payload=payload)
        stale_queues: list[asyncio.Queue[EventMessage]] = []

        for queue in self._subscribers:
            try:
                queue.put_nowait(message)
            except asyncio.QueueFull:
                stale_queues.append(queue)

        for queue in stale_queues:
            self.unsubscribe(queue)
