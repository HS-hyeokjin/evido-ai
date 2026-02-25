package com.evido.api.document.application.dto;

public record GetDocumentFileQuery(
        Long workspaceId,
        Long userId,
        Long documentId,
        Long versionId
) {}