package com.evido.api.document.api.mapper;

import com.evido.api.document.api.dto.response.*;
import com.evido.api.document.application.dto.*;

import java.util.List;
import java.util.stream.Collectors;

public final class DocumentResponseMapper {
    private DocumentResponseMapper() {
    }

    public static DocumentCreateResponse from(DocumentCreateResult r) {
        return new DocumentCreateResponse(r.documentId(), r.versionId(), r.fileId(), r.title(), r.status());
    }

    public static BulkUploadResponse from(BulkUploadResult r) {
        List<DocumentCreateResponse> success = r.success() == null ? List.of()
                : r.success().stream().map(DocumentResponseMapper::from).toList();

        List<BulkUploadFailedItemResponse> failed = r.failed() == null ? List.of()
                : r.failed().stream().map(f -> new BulkUploadFailedItemResponse(f.filename(), f.reason())).toList();

        return new BulkUploadResponse(success, failed);
    }

    public static PageResponse<DocumentListItemResponse> from(PageResult<DocumentListItemResult> page) {
        return new PageResponse<>(
                page.content().stream()
                        .map(it -> new DocumentListItemResponse(
                                it.documentId(),
                                it.title(),
                                it.latestVersionId(),
                                it.fileId(),
                                it.filename(),
                                it.createdAt(),
                                it.status()
                        ))
                        .collect(Collectors.toList()),
                page.number(),
                page.size(),
                page.totalElements(),
                page.totalPages()
        );
    }
}
