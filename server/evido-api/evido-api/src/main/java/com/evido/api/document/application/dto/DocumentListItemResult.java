package com.evido.api.document.application.dto;

import java.time.LocalDateTime;

public record DocumentListItemResult(
        Long documentId,
        String title,
        Long latestVersionId,
        Long fileId,
        String filename,
        LocalDateTime createdAt,
        String status
) {}
