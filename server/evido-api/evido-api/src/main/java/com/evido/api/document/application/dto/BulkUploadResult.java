package com.evido.api.document.application.dto;

import java.util.List;

public record BulkUploadResult(
        List<DocumentCreateResult> success,
        List<BulkUploadFailedItemResult> failed
) {
    public record BulkUploadFailedItemResult(String filename, String reason) {}
}
