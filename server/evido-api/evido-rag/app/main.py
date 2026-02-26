from app.api.ingest import router as ingest_router
from app.api.chunks import router as chunks_router
from app.api.embed import router as embed_router
from app.api.query import router as query_router
from app.api.answer import router as answer_router
from app.api.process import router as process_router
from app.api.vectors import router as vectors_router

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="EVIDO RAG Server")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(
        "[422에러] url=%s errors=%s",
        request.url,
        exc.errors()
    )
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(process_router, prefix="/process", tags=["process"])
app.include_router(answer_router, prefix="/answer", tags=["answer"])
app.include_router(ingest_router, prefix="/ingest", tags=["ingest"])   #문서 메타 등록
app.include_router(chunks_router, prefix="/chunks", tags=["chunks"])   # 디버깅용
app.include_router(embed_router, prefix="/embed", tags=["embed"])      # 임베딩용
app.include_router(query_router, prefix="/query", tags=["query"])      # LLM없이 벡터 검색용

app.include_router(vectors_router, prefix="/vectors", tags=["vectors"])

