package com.evido.api.conversation.infrastructure.persistence;

import com.evido.api.conversation.infrastructure.persistence.entity.ConversationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationJpaRepository extends JpaRepository<ConversationEntity, Long> {

    List<ConversationEntity> findByWorkspaceId(Long workspaceId);
}