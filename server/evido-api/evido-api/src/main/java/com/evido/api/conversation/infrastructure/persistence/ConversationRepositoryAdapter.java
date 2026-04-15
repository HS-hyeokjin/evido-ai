package com.evido.api.conversation.infrastructure.persistence;

import com.evido.api.conversation.application.port.out.ConversationRepositoryPort;
import com.evido.api.conversation.domain.Conversation;
import com.evido.api.conversation.infrastructure.persistence.entity.ConversationEntity;
import com.evido.api.conversation.infrastructure.persistence.mapper.ConversationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ConversationRepositoryAdapter implements ConversationRepositoryPort {

    private final ConversationJpaRepository conversationJpaRepository;

    @Override
    public List<Conversation> findByWorkspaceId(Long workspaceId) {
        return conversationJpaRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId)
                .stream()
                .map(ConversationMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public Conversation createDefaultConversation(Long workspaceId) {
        ConversationEntity entity = new ConversationEntity(workspaceId, "새 대화");
        ConversationEntity saved = conversationJpaRepository.save(entity);
        return ConversationMapper.toDomain(saved);
    }

    @Override
    public Optional<Conversation> findById(Long id) {
        return conversationJpaRepository.findById(id)
                .map(ConversationMapper::toDomain);
    }

    @Override
    @Transactional
    public Conversation updateTitle(Long conversationId, String title) {
        ConversationEntity entity = conversationJpaRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("대화를 찾을 수 없습니다."));

        entity.changeTitle(title);

        return ConversationMapper.toDomain(entity);
    }

    @Override
    @Transactional
    public void deleteById(Long conversationId) {
        conversationJpaRepository.deleteById(conversationId);
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