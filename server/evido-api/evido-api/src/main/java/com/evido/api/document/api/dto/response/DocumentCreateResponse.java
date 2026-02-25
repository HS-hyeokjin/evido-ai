package com.evido.api.document.api.dto.response;

public record DocumentCreateResponse(
        Long documentId,
        Long versionId,
        Long fileId,
        String title,
        String status
) {}