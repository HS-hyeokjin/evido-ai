package com.evido.api.workspace.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(description = "워크스페이스 생성 요청")
public record WorkspaceCreateRequest(

        @Schema(
                description = "생성할 워크스페이스 이름",
                example = "프로젝트 A"
        )
        @Size(max = 100, message = "워크스페이스 이름은 100자 이하여야 합니다.")
        String name
) {}