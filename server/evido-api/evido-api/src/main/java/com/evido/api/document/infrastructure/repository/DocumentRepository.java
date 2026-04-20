package com.evido.api.document.infrastructure.repository;

import com.evido.api.document.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    Page<Document> findByWorkspaceIdAndOwnerUserIdAndStatus(
            Long workspaceId,
            String ownerUserId,
            String status,
            Pageable pageable
    );

    Page<Document> findByWorkspaceIdAndOwnerUserIdAndStatusAndTitleContainingIgnoreCase(
            Long workspaceId,
            String ownerUserId,
            String status,
            String title,
            Pageable pageable
    );

    boolean existsByWorkspaceIdAndOwnerUserIdAndStatusAndTitle(
            Long workspaceId,
            String ownerUserId,
            String status,
            String title
    );
}