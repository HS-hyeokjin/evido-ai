package com.evido.api.conversation.api.dto.response;

import java.util.List;

public record SendMessageResponse(
        Long conversationId,
        List<MessageResponse> messages
) {
}