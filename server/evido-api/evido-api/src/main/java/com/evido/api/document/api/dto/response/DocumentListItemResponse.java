package com.evido.api.document.api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "문서 목록 항목 응답")
public record DocumentListItemResponse(

        @Schema(description = "문서 ID", example = "10")
        Long documentId,

        @Schema(description = "문서 제목", example = "회의록")
        String title,

        @Schema(description = "최신 버전 ID", example = "1")
        Long latestVersionId,

        @Schema(description = "파일 ID", example = "100")
        Long fileId,

        @Schema(description = "원본 파일명", example = "meeting.txt")
        String filename,

        @Schema(description = "생성 일시", example = "2026-04-20T14:00:00")
        LocalDateTime createdAt,

        @Schema(description = "문서 상태", example = "ACTIVE")
        String status
) {}