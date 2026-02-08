from fastapi import FastAPI
from app.api.ingest import router as ingest_router

app = FastAPI(title="EVIDO RAG Server")

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(ingest_router, prefix="/ingest", tags=["ingest"])
