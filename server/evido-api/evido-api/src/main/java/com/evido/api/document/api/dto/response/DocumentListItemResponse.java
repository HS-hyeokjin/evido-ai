package com.evido.api.document.api.dto.response;

import java.time.LocalDateTime;

public record DocumentListItemResponse(
        Long documentId,
        String title,
        Long latestVersionId,
        Long fileId,
        String filename,
        LocalDateTime createdAt,
        String status
) {}