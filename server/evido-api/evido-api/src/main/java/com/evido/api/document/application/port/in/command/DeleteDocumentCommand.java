package com.evido.api.document.application.port.in.command;

public record DeleteDocumentCommand(
        Long workspaceId,
        Long userId,
        Long documentId
) {}
