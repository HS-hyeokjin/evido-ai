package com.evido.api.document.application.dto;

public record DocumentCreateResult(
        Long documentId,
        Long versionId,
        Long fileId,
        String title,
        String status
) {}
