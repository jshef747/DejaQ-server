from pydantic import BaseModel, field_validator


class TestProviderRequest(BaseModel):
    model: str

    @field_validator("model")
    @classmethod
    def _strip_non_empty(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Value must not be empty.")
        return stripped


class TestProviderResponse(BaseModel):
    ok: bool
    model_used: str
    provider: str
    latency_ms: float
    prompt_tokens: int
    completion_tokens: int
