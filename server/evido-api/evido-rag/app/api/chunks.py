from fastapi import APIRouter, Query, HTTPException
from app.db.session import get_engine
from app.repositories.document_chunk_repo import list_chunks, count_chunks
from app.schemas.chunks import ChunksResponse, ChunkItem

router = APIRouter()

@router.get("", response_model=ChunksResponse)
def get_chunks(
    documentId: int = Query(..., ge=1),
    versionId: int = Query(..., ge=1),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    includeContent: bool = Query(False)
):
    engine = get_engine()

    total = count_chunks(engine, documentId, versionId)
    if total == 0:
        raise HTTPException(404, "No chunks found. Run /ingest first.")

    rows = list_chunks(
        engine,
        documentId,
        versionId,
        limit=limit,
        offset=offset,
        include_content=includeContent
    )

    items = [ChunkItem(**r) for r in rows]

    return ChunksResponse(
        documentId=documentId,
        versionId=versionId,
        count=total,
        items=items
    )
