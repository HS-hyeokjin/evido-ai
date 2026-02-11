import os
from typing import List, Optional, Dict, Any

from qdrant_client import QdrantClient, models
from fastembed import TextEmbedding


class VectorIndex:

    def __init__(self):
        self.host = os.getenv("QDRANT_HOST", "127.0.0.1")
        self.port = int(os.getenv("QDRANT_PORT", "6333"))
        self.collection = os.getenv("QDRANT_COLLECTION", "document_chunks")
        self.client = QdrantClient(host=self.host, port=self.port)

        self.embed_model_name = os.getenv("EMBED_MODEL", "BAAI/bge-small-en-v1.5")
        self.embedder = TextEmbedding(model_name=self.embed_model_name)

        self.vector_size = len(next(self.embedder.embed(["hello"])) )

        self._ensure_collection()

    def _ensure_collection(self):
        existing = [c.name for c in self.client.get_collections().collections]
        if self.collection in existing:
            return

        self.client.create_collection(
            collection_name=self.collection,
            vectors_config=models.VectorParams(
                size=self.vector_size,
                distance=models.Distance.COSINE,
            )
        )

    def _embed_one(self, text: str) -> List[float]:
        vec = next(self.embedder.embed([text]))
        return vec.tolist() if hasattr(vec, "tolist") else list(vec)

    def _embed_many(self, texts: List[str]) -> List[List[float]]:
        vecs = []
        for v in self.embedder.embed(texts):
            vecs.append(v.tolist() if hasattr(v, "tolist") else list(v))
        return vecs

    def upsert_chunks(self, chunks: List[Dict[str, Any]]):

        if not chunks:
            return 0

        vectors = self._embed_many([c["content"] for c in chunks])

        points = []
        for c, v in zip(chunks, vectors):
            points.append(
                models.PointStruct(
                    id=int(c["chunkId"]),
                    vector=v,
                    payload={
                        "documentId": int(c["documentId"]),
                        "versionId": int(c["versionId"]),
                        "chunkIndex": int(c["chunkIndex"]),
                    }
                )
            )

        self.client.upsert(
            collection_name=self.collection,
            points=points
        )
        return len(points)

    def search(
        self,
        query_text: str,
        document_id: Optional[int] = None,
        version_id: Optional[int] = None,
        limit: int = 5
    ):
        qv = self._embed_one(query_text)

        must = []
        if document_id is not None:
            must.append(models.FieldCondition(
                key="documentId",
                match=models.MatchValue(value=int(document_id))
            ))
        if version_id is not None:
            must.append(models.FieldCondition(
                key="versionId",
                match=models.MatchValue(value=int(version_id))
            ))
        qfilter = models.Filter(must=must) if must else None

        res = self.client.query_points(
            collection_name=self.collection,
            query=qv,
            query_filter=qfilter,
            limit=limit,
            with_payload=True
        )
        return res.points
