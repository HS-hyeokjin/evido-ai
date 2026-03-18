package com.evido.api.chat.infrastructure.persistence.mapper;

import com.evido.api.chat.domain.Chat;
import com.evido.api.chat.infrastructure.persistence.entity.ChatEntity;

public class ChatMapper {

    private ChatMapper() {}

    public static Chat toDomain(ChatEntity entity) {
        return new Chat(
                entity.getId(),
                entity.getWorkspaceId(),
                entity.getTitle(),
                entity.getCreatedAt()
        );
    }
}