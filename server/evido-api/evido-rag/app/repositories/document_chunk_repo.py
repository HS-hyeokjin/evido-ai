from __future__ import annotations

from typing import List, Dict, Any
from sqlalchemy import text
from sqlalchemy.engine import Engine


def insert_chunks(engine: Engine, document_id: int, version_id: int, chunks: List[Dict[str, Any]]) -> List[int]:
    if not chunks:
        return []

    insert_sql = text("""
        INSERT INTO document_chunk
            (document_id, version_id, chunk_index, token_count, content, created_at)
        VALUES
            (:document_id, :version_id, :chunk_index, :token_count, :content, NOW())
    """)

    rows = []
    for c in chunks:
        rows.append({
            "document_id": int(document_id),
            "version_id": int(version_id),
            "chunk_index": int(c["chunkIndex"]),
            "token_count": int(c.get("tokenCount", 0) or 0),
            "content": c.get("content", "") or "",
        })

    with engine.begin() as conn:
        conn.execute(insert_sql, rows)

        select_sql = text("""
            SELECT chunk_id, chunk_index
            FROM document_chunk
            WHERE document_id = :document_id
              AND version_id = :version_id
            ORDER BY chunk_index ASC
        """)
        result = conn.execute(select_sql, {
            "document_id": int(document_id),
            "version_id": int(version_id)
        }).mappings().all()

    idx_to_id = {int(r["chunk_index"]): int(r["chunk_id"]) for r in result}

    chunk_ids: List[int] = []
    for c in chunks:
        cid = idx_to_id.get(int(c["chunkIndex"]))
        if cid is not None:
            chunk_ids.append(int(cid))

    return chunk_ids


def count_chunks(engine: Engine, document_id: int, version_id: int) -> int:
    sql = text("""
        SELECT COUNT(*) AS cnt
        FROM document_chunk
        WHERE document_id = :document_id AND version_id = :version_id
    """)
    with engine.connect() as conn:
        row = conn.execute(sql, {
            "document_id": int(document_id),
            "version_id": int(version_id)
        }).mappings().one()
        return int(row["cnt"])


def list_chunks(
    engine: Engine,
    document_id: int,
    version_id: int,
    limit: int = 50,
    offset: int = 0,
    include_content: bool = False
) -> List[Dict[str, Any]]:
    cols = "chunk_id, document_id, version_id, chunk_index, token_count, created_at"
    if include_content:
        cols += ", content"

    sql = text(f"""
        SELECT {cols}
        FROM document_chunk
        WHERE document_id = :document_id AND version_id = :version_id
        ORDER BY chunk_index ASC
        LIMIT :limit OFFSET :offset
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql, {
            "document_id": int(document_id),
            "version_id": int(version_id),
            "limit": int(limit),
            "offset": int(offset),
        }).mappings().all()

    return [dict(r) for r in rows]


def get_chunks_by_ids(engine: Engine, chunk_ids: List[int]) -> List[Dict[str, Any]]:
    if not chunk_ids:
        return []

    placeholders = ", ".join([f":id{i}" for i in range(len(chunk_ids))])
    sql = text(f"""
        SELECT chunk_id, document_id, version_id, chunk_index, token_count, content, created_at
        FROM document_chunk
        WHERE chunk_id IN ({placeholders})
    """)

    params = {f"id{i}": int(cid) for i, cid in enumerate(chunk_ids)}

    with engine.connect() as conn:
        rows = conn.execute(sql, params).mappings().all()

    return [dict(r) for r in rows]
