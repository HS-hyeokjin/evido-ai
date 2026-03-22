package com.evido.api.conversation.infrastructure.persistence;

import com.evido.api.conversation.application.port.out.MessageRepositoryPort;
import com.evido.api.conversation.domain.Message;
import com.evido.api.conversation.infrastructure.persistence.mapper.MessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MessageRepositoryAdapter implements MessageRepositoryPort {

    private final MessageJpaRepository messageJpaRepository;

    @Override
    public Message save(Message message) {

        var entity = MessageMapper.toEntity(message);
        var saved = messageJpaRepository.save(entity);

        return MessageMapper.toDomain(saved);
    }

    @Override
    public List<Message> findByConversationId(Long conversationId) {

        return messageJpaRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(MessageMapper::toDomain)
                .toList();
    }
}