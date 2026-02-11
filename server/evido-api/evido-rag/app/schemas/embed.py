from pydantic import BaseModel

class EmbedRequest(BaseModel):
    documentId: int
    versionId: int

class EmbedResponse(BaseModel):
    documentId: int
    versionId: int
    upserted: int
