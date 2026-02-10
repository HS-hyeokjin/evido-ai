from pydantic import BaseModel
from typing import List, Optional, Any

class ChunkItem(BaseModel):
    chunk_id: int
    document_id: int
    version_id: int
    chunk_index: int
    token_count: int
    created_at: Any
    content: Optional[str] = None

class ChunksResponse(BaseModel):
    documentId: int
    versionId: int
    count: int
    items: List[ChunkItem]
