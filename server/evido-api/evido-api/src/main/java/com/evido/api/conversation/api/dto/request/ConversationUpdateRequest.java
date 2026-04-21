package com.evido.api.conversation.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "대화 제목 수정 요청")
public record ConversationUpdateRequest(

        @Schema(
                description = "변경할 대화 제목",
                example = "회의 정리 대화"
        )
        @NotBlank(message = "제목은 비어 있을 수 없습니다.")
        @Size(max = 100, message = "제목은 100자 이하여야 합니다.")
        String title
) {}