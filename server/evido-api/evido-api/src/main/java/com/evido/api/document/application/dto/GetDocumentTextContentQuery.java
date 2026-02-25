package com.evido.api.document.application.dto;

public record GetDocumentTextContentQuery(
        Long workspaceId,
        Long userId,
        Long documentId,
        Long versionId
) {}