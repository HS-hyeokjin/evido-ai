package com.evido.api.conversation.api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "대화 응답")
public record ConversationResponse(

        @Schema(description = "대화 ID", example = "1")
        Long id,

        @Schema(description = "워크스페이스 ID", example = "10")
        Long workspaceId,

        @Schema(description = "대화 제목", example = "회의 정리")
        String title,

        @Schema(description = "생성 일시", example = "2026-04-20T14:30:00")
        LocalDateTime createAt
) {}