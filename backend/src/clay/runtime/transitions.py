from clay.runtime.states import RuntimeState


class InvalidTransitionError(ValueError):
    """Raised when a runtime state transition is not allowed."""


ALLOWED_TRANSITIONS: dict[RuntimeState, tuple[RuntimeState, ...]] = {
    RuntimeState.BACKGROUND_MONITORING: (
        RuntimeState.PRE_SESSION,
        RuntimeState.DEGRADED,
    ),
    RuntimeState.PRE_SESSION: (
        RuntimeState.ACTIVE_SESSION,
        RuntimeState.BACKGROUND_MONITORING,
        RuntimeState.DEGRADED,
    ),
    RuntimeState.ACTIVE_SESSION: (
        RuntimeState.PAUSED,
        RuntimeState.REVIEW,
        RuntimeState.DEGRADED,
    ),
    RuntimeState.PAUSED: (
        RuntimeState.ACTIVE_SESSION,
        RuntimeState.REVIEW,
        RuntimeState.DEGRADED,
    ),
    RuntimeState.REVIEW: (
        RuntimeState.BACKGROUND_MONITORING,
        RuntimeState.DEGRADED,
    ),
    RuntimeState.DEGRADED: (
        RuntimeState.BACKGROUND_MONITORING,
        RuntimeState.PRE_SESSION,
    ),
}


def get_allowed_transitions(source: RuntimeState) -> list[RuntimeState]:
    return list(ALLOWED_TRANSITIONS[source])


def validate_transition(source: RuntimeState, target: RuntimeState) -> None:
    if target not in ALLOWED_TRANSITIONS[source]:
        raise InvalidTransitionError(
            f"{source.value} -> {target.value} is not allowed",
        )
