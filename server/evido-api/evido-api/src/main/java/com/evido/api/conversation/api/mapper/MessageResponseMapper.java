package com.evido.api.conversation.api.mapper;

import com.evido.api.conversation.api.dto.response.MessageResponse;
import com.evido.api.conversation.application.dto.MessageResult;

public class MessageResponseMapper {

    public static MessageResponse from(MessageResult result) {
        return new MessageResponse(
                result.id(),
                result.role(),
                result.content(),
                result.createdAt()
        );
    }
}