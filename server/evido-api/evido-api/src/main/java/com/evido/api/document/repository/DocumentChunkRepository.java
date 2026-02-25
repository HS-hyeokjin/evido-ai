package com.evido.api.document.repository;

import com.evido.api.document.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    long deleteByDocumentId(Long documentId);

    long deleteByDocumentIdAndVersionId(Long documentId, Long versionId);

}
