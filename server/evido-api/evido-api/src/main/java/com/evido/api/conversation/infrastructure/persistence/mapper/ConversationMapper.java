package com.evido.api.conversation.infrastructure.persistence.mapper;

import com.evido.api.conversation.domain.Conversation;
import com.evido.api.conversation.infrastructure.persistence.entity.ConversationEntity;

public class ConversationMapper {

    private ConversationMapper() {}

    public static Conversation toDomain(ConversationEntity entity) {
        return new Conversation(
                entity.getId(),
                entity.getWorkspaceId(),
                entity.getTitle(),
                entity.getCreatedAt()
        );
    }

    public static ConversationEntity toEntity(Conversation domain) {
        return new ConversationEntity(
                domain.getWorkspaceId(),
                domain.getTitle()
        );
    }
}