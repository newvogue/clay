from pydantic import BaseModel, ConfigDict, Field

from clay.runtime.states import RuntimeState


class RuntimeConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    work_window_start: str = "09:00"
    work_window_end: str = "22:00"
    default_state: RuntimeState = RuntimeState.BACKGROUND_MONITORING


class RiskConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    confidence_warning_threshold: float = Field(default=0.6, ge=0.0, le=1.0)
    degraded_confidence_penalty: float = Field(default=0.2, ge=0.0, le=1.0)
