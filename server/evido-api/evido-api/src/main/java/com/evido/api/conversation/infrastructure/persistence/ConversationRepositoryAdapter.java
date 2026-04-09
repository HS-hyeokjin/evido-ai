package com.evido.api.conversation.infrastructure.persistence;

import com.evido.api.conversation.application.port.out.ConversationRepositoryPort;
import com.evido.api.conversation.domain.Conversation;
import com.evido.api.conversation.infrastructure.persistence.entity.ConversationEntity;
import com.evido.api.conversation.infrastructure.persistence.mapper.ConversationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ConversationRepositoryAdapter implements ConversationRepositoryPort {

    private final ConversationJpaRepository conversationJpaRepository;

    @Override
    public List<Conversation> findByWorkspaceId(Long workspaceId) {
        return conversationJpaRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(ConversationMapper::toDomain)
                .toList();
    }

    @Override
    public Conversation createDefaultConversation(Long workspaceId) {
        ConversationEntity entity = new ConversationEntity(
                workspaceId,
                "제목 없음"
        );

        ConversationEntity saved = conversationJpaRepository.save(entity);
        return ConversationMapper.toDomain(saved);
    }

    @Override
    public Optional<Conversation> findById(Long id) {
        return conversationJpaRepository.findById(id)
                .map(ConversationMapper::toDomain);
    }

    @Override
    public Conversation save(Conversation conversation) {
        ConversationEntity entity = new ConversationEntity(
                conversation.getWorkspaceId(),
                conversation.getTitle()
        );

        ConversationEntity saved = conversationJpaRepository.save(entity);
        return ConversationMapper.toDomain(saved);
    }
}