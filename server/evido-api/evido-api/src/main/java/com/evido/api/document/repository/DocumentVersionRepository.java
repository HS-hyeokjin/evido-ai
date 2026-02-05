package com.evido.api.document.repository;

import com.evido.api.document.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

    @Query("select coalesce(max(v.versionNo), 0) from DocumentVersion v where v.documentId = :documentId")
    int findMaxVersionNo(Long documentId);
}
