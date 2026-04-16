from pydantic import BaseModel


class PreflightCheck(BaseModel):
    service_id: str
    status: str


class PreflightResult(BaseModel):
    status: str
    checks: list[PreflightCheck]
