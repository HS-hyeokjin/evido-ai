package com.evido.api.document.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "document_chunk",
        indexes = {
                @Index(name = "idx_document_chunk_document_id", columnList = "document_id"),
                @Index(name = "idx_document_chunk_version_id", columnList = "version_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chunk_id")
    private Long chunkId;

    @Column(name = "document_id", nullable = false)
    private Long documentId;

    @Column(name = "version_id", nullable = false)
    private Long versionId;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(name = "token_count")
    private Integer tokenCount;

    @Lob
    @Column(name = "content", columnDefinition = "MEDIUMTEXT")
    private String content;

    @Column(name = "heading", length = 255)
    private String heading;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
