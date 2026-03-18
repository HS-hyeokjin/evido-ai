package com.evido.api.chat.infrastructure.persistence;

import com.evido.api.chat.infrastructure.persistence.entity.ChatEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatJpaRepository extends JpaRepository<ChatEntity, Long> {

    List<ChatEntity> findByWorkspaceId(Long workspaceId);
}