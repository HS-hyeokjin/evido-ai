import os
import logging
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from app.schemas.process import ProcessRequest, ProcessResponse
from app.db.session import get_engine
from app.repositories.file_object_repo import get_file_meta_by_version
from app.services.text_extractor import extract_text_from_local_file
from app.services.chunker import chunk_text_token_based
from app.repositories.document_chunk_repo import insert_chunks
from app.services.vector_index import VectorIndex
from app.services.s3_loader import load_file_from_s3

router = APIRouter()
_index = VectorIndex()
logger = logging.getLogger(__name__)


def get_document_status(engine, document_id: int) -> str | None:
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT status FROM document WHERE document_id = :id"),
            {"id": document_id},
        ).mappings().first()
        return row["status"] if row else None


def abort_if_deleted(engine, document_id: int):
    status = get_document_status(engine, document_id)
    if status is None:
        raise HTTPException(404, "Document를 찾을 수 없습니다")
    if str(status).upper() == "DELETED":
        raise HTTPException(410, "Document is deleted")


@router.post("", response_model=ProcessResponse)
def process(req: ProcessRequest):

    logger.info("[문서처리] 시작 documentId=%s versionId=%s", req.documentId, req.versionId)

    engine = get_engine()
    abort_if_deleted(engine, req.documentId)

    meta = get_file_meta_by_version(engine, req.documentId, req.versionId)
    if not meta:
        raise HTTPException(404, "Document/version을 찾을 수 없습니다")

    provider = meta.get("storage_provider")
    storage_key = meta.get("storage_key")

    if not storage_key:
        raise HTTPException(400, "storage_key 없음")

    temp_path = None

    try:
        if provider == "LOCAL":

            base_dir = os.getenv("UPLOAD_BASE_DIR")
            file_path = Path(base_dir) / storage_key if base_dir else Path(storage_key)

            if not file_path.exists():
                raise HTTPException(404, f"파일이 존재하지 않음: {file_path}")

            logger.info("[process] LOCAL 파일 사용: %s", file_path)

        elif provider == "S3":

            bucket = os.getenv("S3_BUCKET")
            if not bucket:
                raise HTTPException(500, "S3_BUCKET 환경변수 필요")

            file_bytes = load_file_from_s3(bucket, storage_key)

            suffix = Path(storage_key).suffix or ".tmp"
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            tmp.write(file_bytes)
            tmp.close()

            temp_path = Path(tmp.name)
            file_path = temp_path

            logger.info("[process] S3 파일 다운로드 완료 key=%s tmp=%s", storage_key, file_path)

        else:
            raise HTTPException(400, f"지원하지 않는 storage_provider={provider}")


        raw_text = extract_text_from_local_file(
            str(file_path),
            meta.get("content_type")
        )

        logger.info("[process] 텍스트 추출 완료 (길이=%s)", len(raw_text))

    finally:
        if temp_path and temp_path.exists():
            try:
                temp_path.unlink()
            except Exception:
                logger.warning("임시파일 삭제 실패: %s", temp_path)

    if not raw_text.strip():
        raise HTTPException(400, "추출된 텍스트가 비어있음")

    chunks = chunk_text_token_based(
        raw_text,
        chunk_tokens=120,
        overlap_tokens=20,
        min_tokens=40
    )

    if not chunks:
        raise HTTPException(400, "Chunking produced no chunks")

    chunk_ids = insert_chunks(engine, req.documentId, req.versionId, chunks)
    upsert_payload = []

    for i, c in enumerate(chunks):
        content = (c.get("content") or "").strip()
        if not content:
            continue

        chunk_id = chunk_ids[i] if i < len(chunk_ids) else None
        if not chunk_id:
            continue

        upsert_payload.append({
            "workspaceId": int(meta.get("workspace_id") or 0),
            "chunkId": chunk_id,
            "documentId": req.documentId,
            "versionId": req.versionId,
            "chunkIndex": c["chunkIndex"],
            "content": content
        })

    upserted = _index.upsert_chunks(upsert_payload)

    preview = [{
        "chunkIndex": c["chunkIndex"],
        "tokenCount": c["tokenCount"],
        "contentHead": c["content"][:200] + ("..." if len(c["content"]) > 200 else "")
    } for c in chunks[:3]]

    logger.info("[문서처리] 완료 documentId=%s versionId=%s", req.documentId, req.versionId)

    return ProcessResponse(
        documentId=req.documentId,
        versionId=req.versionId,
        filePath=str(storage_key),
        contentType=meta.get("content_type"),
        extractedTextChars=len(raw_text),
        chunkCount=len(chunks),
        upserted=upserted,
        preview=preview
    )