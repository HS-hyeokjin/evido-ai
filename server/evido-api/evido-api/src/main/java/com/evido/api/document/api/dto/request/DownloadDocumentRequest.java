package com.evido.api.document.api.dto.request;

public record DownloadDocumentRequest(
        Long documentId,
        Long versionId
) {}