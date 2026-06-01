package com.evido.api.conversation.infrastructure.persistence.repository;

import com.evido.api.conversation.infrastructure.persistence.entity.ConversationSummaryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConversationSummaryJpaRepository extends JpaRepository<ConversationSummaryJpaEntity, Long> {

    Optional<ConversationSummaryJpaEntity> findByConversationId(Long conversationId);
}