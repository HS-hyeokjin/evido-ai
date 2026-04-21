package com.evido.api.document.api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "일괄 업로드 실패 항목")
public record BulkUploadFailedItemResponse(

        @Schema(
                description = "실패한 파일명",
                example = "broken.pdf"
        )
        String filename,

        @Schema(
                description = "실패 사유",
                example = "업로드 실패"
        )
        String reason
) {}