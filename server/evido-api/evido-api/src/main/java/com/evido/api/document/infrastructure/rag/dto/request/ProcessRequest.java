package com.evido.api.document.infrastructure.rag.dto.request;

public record ProcessRequest(
        Long documentId,
        Long versionId
) {}
