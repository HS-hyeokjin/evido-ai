package com.evido.api.document.infrastructure.repository;

import com.evido.api.document.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

    @Query("select coalesce(max(v.versionNo), 0) from DocumentVersion v where v.documentId = :documentId")
    int findMaxVersionNo(Long documentId);

    List<DocumentVersion> findByVersionIdIn(Collection<Long> versionIds);

    List<DocumentVersion> findByDocumentId(Long documentId);


}
