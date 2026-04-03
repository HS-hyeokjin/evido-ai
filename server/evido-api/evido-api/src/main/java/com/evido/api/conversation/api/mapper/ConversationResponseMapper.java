package com.evido.api.conversation.api.mapper;

import com.evido.api.conversation.api.dto.response.ConversationResponse;
import com.evido.api.conversation.domain.Conversation;

public final class ConversationResponseMapper {

    private ConversationResponseMapper(){}

    public static ConversationResponse from(Conversation conversation){
        return new ConversationResponse(
        conversation.getId(),
        conversation.getWorkspaceId(),
        conversation.getTitle(),
        conversation.getCreatedAt()
        );
    }
}
