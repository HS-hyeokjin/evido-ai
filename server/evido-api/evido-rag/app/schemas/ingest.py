from pydantic import BaseModel, Field
from typing import List

class IngestRequest(BaseModel):
    documentId: int
    versionId: int
    rawText: str

    chunkTokens: int = Field(default=450, ge=100, le=2000)
    overlapTokens: int = Field(default=90, ge=0, le=800)
    minTokens: int = Field(default=120, ge=0, le=1500)

class IngestResponse(BaseModel):
    documentId: int
    versionId: int
    chunkCount: int
    preview: List[dict]
