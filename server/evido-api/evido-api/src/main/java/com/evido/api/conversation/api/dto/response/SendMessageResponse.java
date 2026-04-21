package com.evido.api.conversation.api.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "메시지 전송 응답")
public record SendMessageResponse(

        @Schema(description = "대화 ID", example = "1")
        Long conversationId,

        @Schema(description = "전송 후 저장된 메시지 목록")
        List<MessageResponse> messages
) {}