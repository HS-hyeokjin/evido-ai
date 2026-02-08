from typing import List, Dict
from sqlalchemy import text
from sqlalchemy.engine import Engine

def insert_chunks(engine: Engine, document_id: int, version_id: int, chunks: List[Dict]) -> int:
    if not chunks:
        return 0

    sql = text("""
        INSERT INTO document_chunk
        (document_id, version_id, chunk_index, token_count, content, heading)
        VALUES (:document_id, :version_id, :chunk_index, :token_count, :content, :heading)
        ON DUPLICATE KEY UPDATE
          token_count = VALUES(token_count),
          content = VALUES(content),
          heading = VALUES(heading)
    """)

    params = [{
        "document_id": document_id,
        "version_id": version_id,
        "chunk_index": c["chunkIndex"],
        "token_count": c["tokenCount"],
        "content": c["content"],
        "heading": c.get("heading"),
    } for c in chunks]

    with engine.begin() as conn:
        conn.execute(sql, params)

    return len(chunks)
