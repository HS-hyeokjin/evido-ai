package com.evido.api.document.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "document_version",
        uniqueConstraints = @UniqueConstraint(name = "uk_doc_version", columnNames = {"document_id", "version_no"})
)
public class DocumentVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "version_id")
    private Long versionId;

    @Column(name = "document_id", nullable = false)
    private Long documentId;

    @Column(name = "file_id", nullable = false)
    private Long fileId;

    @Column(name = "version_no", nullable = false)
    private Integer versionNo;

    @Lob
    @Column(name = "extracted_text")
    private String extractedText;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
