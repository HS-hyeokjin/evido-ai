package com.evido.api.document.application.dto;

public record DeleteDocumentCommand(
        Long workspaceId,
        Long userId,
        Long documentId
) {}
