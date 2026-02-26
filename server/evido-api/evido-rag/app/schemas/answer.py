from pydantic import BaseModel, Field
from typing import List, Optional

class AnswerRequest(BaseModel):
    workspaceId: int
    queryText: str
    documentId: Optional[int] = None
    versionId: Optional[int] = None
    topK: int = Field(default=5, ge=1, le=20)

class Evidence(BaseModel):
    chunkId: int
    score: float
    chunkIndex: int
    contentHead: str

class AnswerResponse(BaseModel):
    queryText: str
    answer: str
    evidences: List[Evidence]
