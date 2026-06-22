from typing import Literal, Optional, Union, List
from pydantic import BaseModel, Field


class StreamEvidence(BaseModel):
    chunkId: Optional[int] = None
    score: Optional[float] = None
    chunkIndex: Optional[int] = None
    contentHead: Optional[str] = None
    documentId: Optional[int] = None
    versionId: Optional[int] = None


class StatusStreamEvent(BaseModel):
    type: Literal["status"] = "status"
    message: str


class TokenStreamEvent(BaseModel):
    type: Literal["token"] = "token"
    content: str


class EvidenceStreamEvent(BaseModel):
    type: Literal["evidence"] = "evidence"
    evidences: List[StreamEvidence] = Field(default_factory=list)


class DoneStreamEvent(BaseModel):
    type: Literal["done"] = "done"


class ErrorStreamEvent(BaseModel):
    type: Literal["error"] = "error"
    code: str = "RAG_STREAM_ERROR"
    message: str


AnswerStreamEvent = Union[
    StatusStreamEvent,
    TokenStreamEvent,
    EvidenceStreamEvent,
    DoneStreamEvent,
    ErrorStreamEvent,
]