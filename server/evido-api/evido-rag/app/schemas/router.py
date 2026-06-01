from enum import Enum
from typing import Optional, Literal
from pydantic import BaseModel, Field


class RouteAction(str, Enum):
    BASIC_RESPONSE = "BASIC_RESPONSE"
    CONTEXT_RESPONSE = "CONTEXT_RESPONSE"
    RAG_REQUIRED = "RAG_REQUIRED"
    CLARIFY = "CLARIFY"
    OUT_OF_SCOPE = "OUT_OF_SCOPE"


class RouteResult(BaseModel):
    action: RouteAction
    reason: str
    response: Optional[str] = None
    top_k: int = Field(default=5, ge=0, le=20)
    prompt_type: Literal["qa", "summary", "comparison", "search"] = "qa"
    confidence: float = Field(default=0.8, ge=0, le=1)