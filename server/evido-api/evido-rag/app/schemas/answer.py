from typing import List, Optional
from pydantic import BaseModel, Field


class RecentMessage(BaseModel):
    role: str
    content: str


class Evidence(BaseModel):
    chunkId: int
    score: float
    chunkIndex: int
    contentHead: str


class AnswerRequest(BaseModel):
    workspaceId: int
    conversationId: Optional[int] = None
    queryText: str
    topK: Optional[int] = None
    conversationSummary: Optional[str] = None
    recentMessages: List[RecentMessage] = Field(default_factory=list)


class AnswerResponse(BaseModel):
    queryText: str
    answer: str
    evidences: List[Evidence]
    questionType: Optional[str] = None
    fromCache: bool = False