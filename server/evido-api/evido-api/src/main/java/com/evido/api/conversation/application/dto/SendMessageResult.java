package com.evido.api.conversation.application.dto;

import java.util.List;

public record SendMessageResult(
        Long conversationId,
        List<MessageResult> messages
) {
}