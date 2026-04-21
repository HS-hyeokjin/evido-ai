package com.evido.api.document.api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "문서 일괄 업로드 응답")
public record BulkUploadResponse(

        @Schema(description = "업로드 성공 항목 목록")
        List<DocumentCreateResponse> success,

        @Schema(description = "업로드 실패 항목 목록")
        List<BulkUploadFailedItemResponse> failed
) {}