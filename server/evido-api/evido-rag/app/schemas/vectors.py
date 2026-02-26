from pydantic import BaseModel
from typing import Optional

class VectorDeleteResponse(BaseModel):
    documentId: int
    versionId: Optional[int] = None
    status: str