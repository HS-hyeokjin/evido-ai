import os
import logging
from typing import List, Optional, Dict, Any

from qdrant_client import QdrantClient, models
from fastembed import TextEmbedding


logger = logging.getLogger(__name__)


class VectorIndex:

    def __init__(self):
        self.host = os.getenv("QDRANT_HOST", "127.0.0.1")
        self.port = int(os.getenv("QDRANT_PORT", "6333"))
        self.collection = os.getenv("QDRANT_COLLECTION", "document_chunks")
        self.client = QdrantClient(host=self.host, port=self.port)

        self.embed_model_name = os.getenv(
            "EMBED_MODEL",
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        )
        self.embedder = TextEmbedding(model_name=self.embed_model_name)

        self.vector_size = len(next(self.embedder.embed(["hello"])))
        self._ensure_collection()

    def _ensure_collection(self):
        existing = [c.name for c in self.client.get_collections().collections]
        if self.collection in existing:
            info = self.client.get_collection(self.collection)
            size = info.config.params.vectors.size
            dist = info.config.params.vectors.distance

            if size != self.vector_size:
                raise RuntimeError(f"Vector size mismatch: collection={size}, model={self.vector_size}")
            if dist != models.Distance.COSINE:
                raise RuntimeError(f"Distance mismatch: collection={dist}, expected=COSINE")
            return

        self.client.create_collection(
            collection_name=self.collection,
            vectors_config=models.VectorParams(
                size=self.vector_size,
                distance=models.Distance.COSINE,
            ),
        )

    def _embed_one(self, text: str) -> List[float]:
        vec = next(self.embedder.embed([text]))
        return vec.tolist() if hasattr(vec, "tolist") else list(vec)

    def _embed_many(self, texts: List[str]) -> List[List[float]]:
        vecs: List[List[float]] = []
        for v in self.embedder.embed(texts):
            vecs.append(v.tolist() if hasattr(v, "tolist") else list(v))
        return vecs

    def upsert_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """
        chunks item required keys:
          - workspaceId, documentId, versionId, chunkId, chunkIndex, content
        """
        if not chunks:
            return 0

        for c in chunks:
            for k in ("workspaceId", "documentId", "versionId", "chunkId", "chunkIndex", "content"):
                if k not in c:
                    raise ValueError(f"upsert_chunks: missing field '{k}' in chunk={c}")

        vectors = self._embed_many([c["content"] for c in chunks])

        points: List[models.PointStruct] = []
        for c, v in zip(chunks, vectors):
            points.append(
                models.PointStruct(
                    id=int(c["chunkId"]),
                    vector=v,
                    payload={
                        "workspaceId": int(c["workspaceId"]),
                        "documentId": int(c["documentId"]),
                        "versionId": int(c["versionId"]),
                        "chunkIndex": int(c["chunkIndex"]),
                    },
                )
            )

        self.client.upsert(collection_name=self.collection, points=points)
        return len(points)

    def delete_by_filter(
        self,
        workspace_id: int,
        document_id: int,
        version_id: Optional[int] = None,
    ) -> None:

        must = [
            models.FieldCondition(
                key="workspaceId",
                match=models.MatchValue(value=int(workspace_id)),
            ),
            models.FieldCondition(
                key="documentId",
                match=models.MatchValue(value=int(document_id)),
            ),
        ]
        if version_id is not None:
            must.append(
                models.FieldCondition(
                    key="versionId",
                    match=models.MatchValue(value=int(version_id)),
                )
            )

        qfilter = models.Filter(must=must)

        # Qdrant will delete all points matching filter
        self.client.delete(
            collection_name=self.collection,
            points_selector=models.FilterSelector(filter=qfilter),
        )

    def search(
        self,
        query_text: str,
        workspace_id: int,
        document_id: Optional[int] = None,
        version_id: Optional[int] = None,
        limit: int = 5,
    ):
        qv = self._embed_one(query_text)

        must = [
            models.FieldCondition(
                key="workspaceId",
                match=models.MatchValue(value=int(workspace_id)),
            )
        ]
        if document_id is not None:
            must.append(
                models.FieldCondition(
                    key="documentId",
                    match=models.MatchValue(value=int(document_id)),
                )
            )
        if version_id is not None:
            must.append(
                models.FieldCondition(
                    key="versionId",
                    match=models.MatchValue(value=int(version_id)),
                )
            )

        qfilter = models.Filter(must=must)

        res = self.client.query_points(
            collection_name=self.collection,
            query=qv,
            query_filter=qfilter,
            limit=limit,
            with_payload=True,
        )
        return res.points