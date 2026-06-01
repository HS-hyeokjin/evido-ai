package com.evido.api.conversation.infrastructure.persistence.adapter;

import com.evido.api.conversation.application.port.out.ConversationSummaryRepositoryPort;
import com.evido.api.conversation.domain.ConversationSummary;
import com.evido.api.conversation.infrastructure.persistence.entity.ConversationSummaryJpaEntity;
import com.evido.api.conversation.infrastructure.persistence.repository.ConversationSummaryJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ConversationSummaryRepositoryAdapter implements ConversationSummaryRepositoryPort {

    private final ConversationSummaryJpaRepository conversationSummaryJpaRepository;

    @Override
    public Optional<ConversationSummary> findByConversationId(Long conversationId) {
        return conversationSummaryJpaRepository.findByConversationId(conversationId)
                .map(ConversationSummaryJpaEntity::toDomain);
    }

    @Override
    public ConversationSummary save(ConversationSummary conversationSummary) {
        ConversationSummaryJpaEntity entity = ConversationSummaryJpaEntity.from(conversationSummary);
        ConversationSummaryJpaEntity savedEntity = conversationSummaryJpaRepository.save(entity);

        return savedEntity.toDomain();
    }
}