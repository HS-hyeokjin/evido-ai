package com.evido.api.conversation.api.mapper;

import com.evido.api.conversation.api.dto.response.SendMessageResponse;
import com.evido.api.conversation.application.dto.SendMessageResult;

public class SendMessageResponseMapper {

    private SendMessageResponseMapper() {
    }

    public static SendMessageResponse from(SendMessageResult result) {
        return new SendMessageResponse(
                result.conversationId(),
                result.messages().stream()
                        .map(MessageResponseMapper::from)
                        .toList()
        );
    }
}