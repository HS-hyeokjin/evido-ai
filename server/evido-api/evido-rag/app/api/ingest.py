from fastapi import APIRouter, HTTPException
from app.schemas.ingest import IngestRequest, IngestResponse
from app.services.chunker import chunk_text_token_based
from app.db.session import get_engine
from app.repositories.document_chunk_repo import insert_chunks

router = APIRouter()

@router.post("", response_model=IngestResponse)
def ingest(req: IngestRequest):
    if not req.rawText.strip():
        raise HTTPException(400, "rawText is empty")

    chunks = chunk_text_token_based(
        req.rawText,
        chunk_tokens=req.chunkTokens,
        overlap_tokens=req.overlapTokens,
        min_tokens=req.minTokens
    )

    engine = get_engine()
    insert_chunks(engine, req.documentId, req.versionId, chunks)

    preview = [{
        "chunkIndex": c["chunkIndex"],
        "tokenCount": c["tokenCount"],
        "contentHead": c["content"][:200] + ("..." if len(c["content"]) > 200 else "")
    } for c in chunks[:3]]

    return IngestResponse(
        documentId=req.documentId,
        versionId=req.versionId,
        chunkCount=len(chunks),
        preview=preview
    )
