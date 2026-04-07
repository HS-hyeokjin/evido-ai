package com.evido.api.document.application.port.in.query;

public record GetDocumentFileQuery(
        Long workspaceId,
        Long userId,
        Long documentId,
        Long versionId
) {}