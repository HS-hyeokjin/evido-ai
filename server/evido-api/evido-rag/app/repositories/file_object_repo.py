from sqlalchemy import text
from sqlalchemy.engine import Engine

def get_file_meta_by_version(engine: Engine, document_id: int, version_id: int):
    sql = text("""
        SELECT
            d.document_id,
            d.workspace_id,
            d.status AS document_status,
            v.version_id,
            v.file_id,
            f.storage_provider,
            f.storage_key,
            f.content_type
        FROM document d
        JOIN document_version v ON v.version_id = :version_id AND v.document_id = d.document_id
        JOIN file_object f ON f.file_id = v.file_id
        WHERE d.document_id = :document_id
        LIMIT 1
    """)
    with engine.connect() as conn:
        row = conn.execute(sql, {
            "document_id": document_id,
            "version_id": version_id
        }).mappings().first()

    return dict(row) if row else None
