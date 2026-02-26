from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class ProcessRequest(BaseModel):
    documentId: int = Field(..., ge=1)
    versionId: int = Field(..., ge=1)

class ProcessResponse(BaseModel):
    documentId: int
    versionId: int
    filePath: str
    contentType: Optional[str] = None
    extractedTextChars: int
    chunkCount: int
    upserted: int
    preview: List[Dict]
