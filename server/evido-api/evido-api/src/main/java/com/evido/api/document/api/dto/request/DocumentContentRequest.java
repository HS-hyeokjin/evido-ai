package com.evido.api.document.api.dto.request;

public record DocumentContentRequest(
        Long documentId,
        Long versionId
) {}