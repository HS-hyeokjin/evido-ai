package com.evido.api.document.api.dto.response;

import java.util.List;

public record BulkUploadResponse(
        List<DocumentCreateResponse> success,
        List<BulkUploadFailedItemResponse> failed
) {}