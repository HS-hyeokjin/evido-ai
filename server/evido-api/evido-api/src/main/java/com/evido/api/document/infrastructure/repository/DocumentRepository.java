package com.evido.api.document.infrastructure.repository;

import com.evido.api.document.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    Page<Document> findByWorkspaceId(Long orgId, Pageable pageable);

    Page<Document> findByWorkspaceIdAndTitleContainingIgnoreCase(Long orgId, String title, Pageable pageable);

}
