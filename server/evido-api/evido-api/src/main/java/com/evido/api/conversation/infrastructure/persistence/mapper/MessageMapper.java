package com.evido.api.conversation.infrastructure.persistence.mapper;

import com.evido.api.conversation.domain.Message;
import com.evido.api.conversation.infrastructure.persistence.entity.MessageEntity;

public class MessageMapper {

    public static Message toDomain(MessageEntity entity) {
        return new Message(
                entity.getId(),
                entity.getConversationId(),
                entity.getRole(),
                entity.getContent(),
                entity.getCreatedAt()
        );
    }

    public static MessageEntity toEntity(Message message) {
        return new MessageEntity(
                message.getConversationId(),
                message.getRole(),
                message.getContent()
        );
    }
}