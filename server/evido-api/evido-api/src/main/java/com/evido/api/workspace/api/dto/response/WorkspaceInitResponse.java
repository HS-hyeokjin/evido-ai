package com.evido.api.workspace.api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "워크스페이스 초기화 응답")
public record WorkspaceInitResponse(

        @Schema(description = "초기 진입할 워크스페이스 ID", example = "1")
        Long workspaceId
) {}