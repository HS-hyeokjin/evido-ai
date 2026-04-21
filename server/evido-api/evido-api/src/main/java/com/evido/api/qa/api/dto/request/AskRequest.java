package com.evido.api.qa.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "문서 기반 질문 요청")
public record AskRequest(

        @Schema(description = "질문할 대상 워크스페이스 ID", example = "1")
        @NotNull(message = "workspaceId는 필수입니다.")
        Long workspaceId,

        @Schema(description = "사용자 질문 내용", example = "이 문서 핵심만 3줄로 요약해줘")
        @NotBlank(message = "queryText는 비어 있을 수 없습니다.")
        String queryText,

        @Schema(description = "참고할 근거 개수", example = "5", defaultValue = "5")
        @Min(value = 1, message = "topK는 1 이상이어야 합니다.")
        Integer topK
) {}