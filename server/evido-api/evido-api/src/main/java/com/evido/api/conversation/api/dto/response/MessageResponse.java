package com.evido.api.conversation.api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "메시지 응답")
public record MessageResponse(

        @Schema(description = "메시지 ID", example = "100")
        Long id,

        @Schema(description = "메시지 역할", example = "USER")
        String role,

        @Schema(description = "메시지 내용", example = "이 문서 핵심만 요약해줘")
        String content,

        @Schema(description = "생성 일시", example = "2026-04-20T14:31:00")
        LocalDateTime createdAt
) {}