package com.evido.api.workspace.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "워크스페이스 수정 요청")
public record WorkspaceUpdateRequest(

        @Schema(
                description = "변경할 워크스페이스 이름",
                example = "프로젝트 A - 수정"
        )
        @NotBlank(message = "워크스페이스 이름은 비어 있을 수 없습니다.")
        @Size(max = 100, message = "워크스페이스 이름은 100자 이하여야 합니다.")
        String name
) {}