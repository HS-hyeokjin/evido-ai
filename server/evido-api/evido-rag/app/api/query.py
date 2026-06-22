from fastapi import APIRouter, HTTPException
from app.schemas.query import QueryRequest, QueryResponse, QueryHit
from app.db.session import get_engine
from app.repositories.document_chunk_repo import get_chunks_by_ids
from app.services.vector_index import VectorIndex

router = APIRouter()

_index = None
def get_index():
    global _index
    if _index is None:
        _index = VectorIndex()
    return _index

@router.post("", response_model=QueryResponse)
def query(req: QueryRequest):
    if not req.queryText.strip():
        raise HTTPException(400, "queryText is empty")

    index = get_index()

    results = index.search(
        workspace_id=req.workspaceId,
        query_text=req.queryText,
        document_id=req.documentId,
        version_id=req.versionId,
        limit=req.topK
    )

    if not results:
        return QueryResponse(queryText=req.queryText, hits=[])

    chunk_ids = []
    for p in results:
        try:
            chunk_ids.append(int(p.id))
        except Exception:
            continue

    if not chunk_ids:
        return QueryResponse(queryText=req.queryText, hits=[])

    engine = get_engine()
    chunks = get_chunks_by_ids(engine, chunk_ids)
    by_id = {int(c["chunk_id"]): c for c in chunks}

    hits = []
    for p in results:
        try:
            cid = int(p.id)
        except Exception:
            continue

        row = by_id.get(cid)
        if not row:
            continue

        content = row.get("content") or ""
        head_size = req.contentHeadSize
        head = content[:head_size] + ("..." if len(content) > head_size else "")

        hits.append(QueryHit(
            chunkId=cid,
            score=float(p.score),
            chunkIndex=int(row["chunk_index"]),
            content=(content if req.includeContent else None),
            contentHead=(head if not req.includeContent else None)
        ))

    return QueryResponse(queryText=req.queryText, hits=hits)
