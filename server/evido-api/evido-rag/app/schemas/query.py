from pydantic import BaseModel, Field
from typing import List, Optional

class QueryRequest(BaseModel):
    workspaceId: int = Field(...,ge=1)
    queryText: str
    documentId: Optional[int] = None
    versionId: Optional[int] = None
    topK: int = Field(default=5, ge=1, le=20)
    includeContent: bool = Field(default=True)
    contentHeadSize: int = Field(default=200, ge=50, le=1000)

class QueryHit(BaseModel):
    chunkId: int
    score: float
    chunkIndex: int
    content: Optional[str] = None
    contentHead: Optional[str] = None

class QueryResponse(BaseModel):
    queryText: str
    hits: List[QueryHit]
