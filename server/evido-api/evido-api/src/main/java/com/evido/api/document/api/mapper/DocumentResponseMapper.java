package com.evido.api.document.api.mapper;

import com.evido.api.document.api.dto.response.BulkUploadFailedItem;
import com.evido.api.document.api.dto.response.BulkUploadResponse;
import com.evido.api.document.api.dto.response.DocumentCreateResponse;
import com.evido.api.document.application.dto.*;

import java.util.List;

public final class DocumentResponseMapper {
    private DocumentResponseMapper() {}

    public static DocumentCreateResponse from(DocumentCreateResult r) {
        return new DocumentCreateResponse(r.documentId(), r.versionId(), r.fileId(), r.title(), r.status());
    }

    public static BulkUploadResponse from(BulkUploadResult r) {
        List<DocumentCreateResponse> success = r.success() == null ? List.of()
                : r.success().stream().map(DocumentResponseMapper::from).toList();

        List<BulkUploadFailedItem> failed = r.failed() == null ? List.of()
                : r.failed().stream().map(f -> new BulkUploadFailedItem(f.filename(), f.reason())).toList();

        return new BulkUploadResponse(success, failed);
    }
}
