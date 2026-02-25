package com.evido.api.document.api.dto.response;

public record BulkUploadFailedItemResponse(
        String filename,
        String reason
) {}