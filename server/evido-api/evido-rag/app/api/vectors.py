import logging
from fastapi import APIRouter, HTTPException, Query

from app.schemas.vectors import VectorDeleteResponse
from app.services.vector_index import VectorIndex

router = APIRouter()
_index = VectorIndex()
logger = logging.getLogger(__name__)

@router.delete(
    "",
    response_model=VectorDeleteResponse,
    summary="벡터 삭제",
    description="Qdrant payload filter(workspaceId/documentId/versionId)로 삭제"
)
def delete_vectors(
    workspaceId: int = Query(..., ge=1),
    documentId: int = Query(..., ge=1),
    versionId: int | None = Query(None, ge=1),
):
    logger.info(
        "[vectors] delete start workspaceId=%s documentId=%s versionId=%s",
        workspaceId, documentId, versionId
    )

    try:
        _index.delete_by_filter(
            workspace_id=workspaceId,
            document_id=documentId,
            version_id=versionId
        )
    except Exception as e:
        logger.exception(
            "[vectors] 삭제 실패 workspaceId=%s documentId=%s versionId=%s",
            workspaceId, documentId, versionId
        )
        raise HTTPException(500, f"Vector 삭제 실패: {e}")

    logger.info(
        "[vectors] delete done workspaceId=%s documentId=%s versionId=%s",
        workspaceId, documentId, versionId
    )
    return VectorDeleteResponse(
        workspaceId=workspaceId,
        documentId=documentId,
        versionId=versionId,
        status="OK"
    )