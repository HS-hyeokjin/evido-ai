package com.evido.api.workspace.api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "워크스페이스 응답")
public record WorkspaceResponse(

        @Schema(description = "워크스페이스 ID", example = "1")
        Long id,

        @Schema(description = "워크스페이스 이름", example = "프로젝트 A")
        String name,

        @Schema(description = "생성 일시", example = "2026-04-20T14:10:00")
        LocalDateTime createdAt
) {}