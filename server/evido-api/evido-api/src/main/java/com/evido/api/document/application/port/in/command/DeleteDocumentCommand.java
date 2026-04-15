package com.evido.api.document.application.port.in.command;

public record DeleteDocumentCommand(
        Long workspaceId,
        String userId,
        Long documentId
) {}
