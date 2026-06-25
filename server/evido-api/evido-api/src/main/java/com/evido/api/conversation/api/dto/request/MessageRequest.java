package com.evido.api.conversation.api.dto.request;

import com.evido.api.usersetting.domain.AnswerStyle;
import com.evido.api.usersetting.domain.EvidenceMode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "메시지 전송 요청")
public record MessageRequest(

        @NotBlank(message = "메시지는 비어 있을 수 없습니다.")
        @Size(max = 5000, message = "메시지는 5000자 이하여야 합니다.")
        String content,
        @Schema(
                description = "답변 스타일",
                example = "EVIDENCE"
        )
        AnswerStyle answerStyle,

        @Schema(
                description = "근거 표시 방식",
                example = "SIMPLE"
        )
        EvidenceMode evidenceMode
) {
}