"""Finding F: ``SessionReviewService._read_audit_events`` resilience.

Mirrors the regression fixed in Finding C for ``ControlCenterService``:
the previous implementation parsed the audit file with a bare
``json.loads(raw_line)`` and indexed ``payload["timestamp"|"event_type"|"payload"]``
without any guard, so a single malformed/incomplete line in
``audit.jsonl`` crashed the entire ``build_snapshot`` of
``SessionReviewService``.

The fix is the same delegation pattern as Finding C: this method
becomes a thin pass-through to ``AuditWriter.read_recent(limit=limit)``,
which is already corruption-tolerant and newest-first. The existing
``_normalize_audit_event`` is reused unchanged.

Two regression guards:

1. ``test_session_review_read_audit_events_skips_malformed_and_missing_keys``
   — three well-formed events, then a manually-injected broken JSON
   line and a JSON line missing the ``payload`` key, then a fourth
   well-formed event. ``_read_audit_events`` must return the four
   normalized events newest-first, never raise, and skip both
   corrupt lines.

2. ``test_session_review_read_audit_events_does_not_raise_on_corrupt_lines``
   — explicit regression guard for Finding F: the read path no
   longer raises when the tail of the file is unparseable. Same
   corruption injection as (1) but framed as ``no exception`` and
   ``valid events still present``.
"""

from __future__ import annotations

import json
from types import SimpleNamespace
from typing import cast

from clay.ai_control.service import AIControlService
from clay.audit.writer import AuditWriter
from clay.events.bus import EventBus
from clay.session_review.service import SessionReviewService


def _build_service(writer: AuditWriter) -> SessionReviewService:
    return SessionReviewService(
        audit_writer=writer,
        event_bus=EventBus(),
        ai_control_service=cast(AIControlService, SimpleNamespace(assignments={})),
    )


def test_session_review_read_audit_events_skips_malformed_and_missing_keys(
    tmp_path,
) -> None:
    writer = AuditWriter(tmp_path, max_bytes=0)

    for i in range(3):
        writer.write(
            "review.feedback.captured",
            {
                "feedback_id": i,
                "record_id": i * 10,
                "signal_id": f"sig-{i}",
                "symbol": "BTCUSDT",
                "feedback_label": "useful",
            },
        )

    with writer.path.open("a", encoding="utf-8") as handle:
        handle.write("{ broken json\n")
        handle.write(
            json.dumps(
                {
                    "timestamp": "2026-06-04T00:00:00+00:00",
                    "event_type": "demo.trade.logged",
                }
            )
            + "\n"
        )

    writer.write(
        "demo.trade.logged",
        {"record_id": 99, "signal_id": "sig-eth", "symbol": "ETHUSDT"},
    )

    service = _build_service(writer)
    events = service._read_audit_events(limit=20)

    assert len(events) == 4
    assert [e.event_type for e in events] == [
        "demo.trade.logged",
        "review.feedback.captured",
        "review.feedback.captured",
        "review.feedback.captured",
    ]
    assert all(e.severity in {"info", "warning", "critical"} for e in events)
    assert all(e.actor == "operator" for e in events)
    assert all(e.module == e.event_type.split(".", 1)[0] for e in events)


def test_session_review_read_audit_events_does_not_raise_on_corrupt_lines(
    tmp_path,
) -> None:
    writer = AuditWriter(tmp_path, max_bytes=0)

    writer.write(
        "demo.trade.logged",
        {"record_id": 1, "signal_id": "sig-btc", "symbol": "BTCUSDT"},
    )
    with writer.path.open("a", encoding="utf-8") as handle:
        handle.write("definitely not json at all\n")
        handle.write(
            json.dumps(
                {
                    "timestamp": "2026-06-04T00:00:00+00:00",
                    "event_type": "demo.trade.logged",
                }
            )
            + "\n"
        )
    writer.write(
        "demo.trade.logged",
        {"record_id": 2, "signal_id": "sig-eth", "symbol": "ETHUSDT"},
    )

    service = _build_service(writer)

    events = service._read_audit_events(limit=20)

    assert len(events) == 2
    assert [e.event_type for e in events] == [
        "demo.trade.logged",
        "demo.trade.logged",
    ]
    assert [e.object_id for e in events] == ["sig-eth", "sig-btc"]
