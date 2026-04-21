package com.evido.api.document.api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "문서 생성 응답")
public record DocumentCreateResponse(

        @Schema(description = "문서 ID", example = "10")
        Long documentId,

        @Schema(description = "버전 ID", example = "1")
        Long versionId,

        @Schema(description = "파일 ID", example = "100")
        Long fileId,

        @Schema(description = "문서 제목", example = "회의록")
        String title,

        @Schema(description = "문서 상태", example = "ACTIVE")
        String status
) {}