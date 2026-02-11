from fastapi import APIRouter, HTTPException
from app.schemas.embed import EmbedRequest, EmbedResponse
from app.db.session import get_engine
from app.repositories.document_chunk_repo import list_chunks
from app.services.vector_index import VectorIndex

router = APIRouter()

_index = None
def get_index():
    global _index
    if _index is None:
        _index = VectorIndex()
    return _index

@router.post("", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    engine = get_engine()

    rows = list_chunks(engine, req.documentId, req.versionId, limit=200000, offset=0, include_content=True)
    if not rows:
        raise HTTPException(404, "No chunks found. Run /ingest first.")

    chunks = []
    for r in rows:
        if not r.get("content"):
            continue
        chunks.append({
            "chunkId": r["chunk_id"],
            "documentId": r["document_id"],
            "versionId": r["version_id"],
            "chunkIndex": r["chunk_index"],
            "content": r["content"],
        })

    index = get_index()
    upserted = index.upsert_chunks(chunks)

    return EmbedResponse(
        documentId=req.documentId,
        versionId=req.versionId,
        upserted=upserted
    )
