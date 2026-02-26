import os
import logging
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
        raise HTTPException(410, "Document is deleted")  # 410 Gone

@router.post("", response_model=ProcessResponse, summary="문서 처리", description="텍스트 추출 → 청킹 → DB 저장 → 벡터DB 업서트")
def process(req: ProcessRequest):
    logger.info("[문서처리] 시작 documentId=%s versionId=%s", req.documentId, req.versionId)

    engine = get_engine()

    try:
        abort_if_deleted(engine, req.documentId)
    except HTTPException as e:
        logger.warning("[문서처리] ABORT early documentId=%s status=DELETED", req.documentId)
        raise e

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("[process] DB 연결 성공")
    except Exception as e:
        logger.exception("[process] DB 연결 실패")
        raise HTTPException(500, f"DB 연결 실패: {e}")

    meta = get_file_meta_by_version(engine, req.documentId, req.versionId)
    logger.debug("[process] 파일 메타=%s", meta)

    doc_status = (meta.get("document_status") or "").upper()
    if doc_status == "DELETED":
        logger.warning("[process] 문서가 DELETED 상태라 중단 documentId=%s", req.documentId)
        raise HTTPException(410, "Document is deleted")

    if not meta:
        logger.warning("[process] 파일 메타 없음 documentId=%s versionId=%s", req.documentId, req.versionId)
        raise HTTPException(404, "Document/version을 찾을 수 없습니다")

    if meta.get("storage_provider") != "LOCAL":
        provider = meta.get("storage_provider")
        logger.warning("[process] 지원하지 않는 스토리지 provider=%s", provider)
        raise HTTPException(400, f"로컬 스토리지만 지원합니다. provider={provider}")

    file_path = meta.get("storage_key")
    if not file_path:
        logger.warning("[process] storage_key(파일 경로)가 비어있음")
        raise HTTPException(400, "경로가 비어있음")

    base_dir = os.getenv("UPLOAD_BASE_DIR")
    if base_dir:
        file_path = str(Path(base_dir) / file_path)
        logger.info("[process] 파일 경로=%s (base_dir=%s)", file_path, base_dir)
    else:
        logger.info("[process] 파일 경로=%s", file_path)

    try:
        raw_text = extract_text_from_local_file(file_path, meta.get("content_type"))
        logger.info("[process] 텍스트 추출 완료 (길이=%s)", len(raw_text))
    except FileNotFoundError as e:
        logger.warning("[process] 파일을 찾을 수 없음 path=%s err=%s", file_path, e)
        raise HTTPException(404, str(e))
    except Exception as e:
        logger.exception("[process] 파일 파싱 실패 path=%s", file_path)
        raise HTTPException(400, f"파싱 실패: {e}")

    if not (raw_text or "").strip():
        logger.warning("[process] 추출된 텍스트가 비어있음 path=%s content_type=%s", file_path, meta.get("content_type"))
        raise HTTPException(400, "추출된 텍스트가 비어있음")

    chunks = chunk_text_token_based(
        raw_text,
        chunk_tokens=120,
        overlap_tokens=20,
        min_tokens=40
    )
    logger.info("[문서처리] 청킹 완료 (청크 수=%s)", len(chunks))

    if not chunks:
        logger.warning("[문서처리] 청킹 결과가 비어있음")
        raise HTTPException(400, "Chunking produced no chunks")

    try:
        chunk_ids = insert_chunks(engine, req.documentId, req.versionId, chunks)
        logger.info("[문서처리] 청크 DB 저장 완료 (생성된 chunk_id 수=%s)", len(chunk_ids))
    except Exception as e:
        logger.exception("[문서처리] 청크 DB 저장 실패")
        raise HTTPException(500, f"청크 DB 저장 실패: {e}")

    if len(chunk_ids) != len(chunks):
        logger.warning("[문서처리] 저장된 chunk_id 수가 청크 수와 다름 chunks=%s ids=%s", len(chunks), len(chunk_ids))

    try:
        abort_if_deleted(engine, req.documentId)
    except HTTPException as e:
        logger.warning("[문서처리] ABORT before upsert documentId=%s versionId=%s", req.documentId, req.versionId)

        try:
            with engine.begin() as conn:
                conn.execute(
                    text("DELETE FROM document_chunk WHERE document_id=:docId AND version_id=:verId"),
                    {"docId": req.documentId, "verId": req.versionId},
                )
        except Exception:
            logger.exception("[문서처리] abort cleanup chunks failed")

        raise e

    upsert_payload = []
    skipped = 0

    for i, c in enumerate(chunks):
        content = (c.get("content") or "").strip()
        if not content:
            skipped += 1
            continue

        chunk_id = chunk_ids[i] if i < len(chunk_ids) else None
        if chunk_id is None:
            skipped += 1
            continue

        workspace_id = int(meta.get("workspace_id") or 0)

        upsert_payload.append({
            "workspaceId": workspace_id,
            "chunkId": chunk_id,
            "documentId": req.documentId,
            "versionId": req.versionId,
            "chunkIndex": c["chunkIndex"],
            "content": content
        })

    logger.info("[문서처리] 벡터 업서트 준비 완료 (payload=%s, 제외=%s)", len(upsert_payload), skipped)

    try:
        upserted = _index.upsert_chunks(upsert_payload)
        logger.info("[문서처리] 벡터 업서트 완료 (업서트 수=%s)", upserted)
    except Exception as e:
        logger.exception("[문서처리] 벡터 업서트 실패 (payload=%s)", len(upsert_payload))
        raise HTTPException(500, f"Vector upsert failed: {e}")

    preview = [{
        "chunkIndex": c["chunkIndex"],
        "tokenCount": c["tokenCount"],
        "contentHead": c["content"][:200] + ("..." if len(c["content"]) > 200 else "")
    } for c in chunks[:3]]

    logger.info("[문서처리] 완료 documentId=%s versionId=%s", req.documentId, req.versionId)

    return ProcessResponse(
        documentId=req.documentId,
        versionId=req.versionId,
        filePath=file_path,
        contentType=meta.get("content_type"),
        extractedTextChars=len(raw_text),
        chunkCount=len(chunks),
        upserted=upserted,
        preview=preview
    )
