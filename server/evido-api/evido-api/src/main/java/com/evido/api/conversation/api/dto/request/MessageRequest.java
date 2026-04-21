package com.evido.api.conversation.api.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "메시지 전송 요청")
public record MessageRequest(

        @Schema(
                description = "사용자가 입력한 메시지",
                example = "이 문서 핵심만 3줄로 요약해줘"
        )
        @NotBlank(message = "메시지는 비어 있을 수 없습니다.")
        @Size(max = 5000, message = "메시지는 5000자 이하여야 합니다.")
        String content
) {}