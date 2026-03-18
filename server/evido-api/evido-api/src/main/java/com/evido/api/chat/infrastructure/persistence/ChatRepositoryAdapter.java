package com.evido.api.chat.infrastructure.persistence;

import com.evido.api.chat.application.port.out.ChatRepositoryPort;
import com.evido.api.chat.domain.Chat;
import com.evido.api.chat.infrastructure.persistence.entity.ChatEntity;
import com.evido.api.chat.infrastructure.persistence.mapper.ChatMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ChatRepositoryAdapter implements ChatRepositoryPort {

    private final ChatJpaRepository chatJpaRepository;

    @Override
    public List<Chat> findByWorkspaceId(Long workspaceId) {

        return chatJpaRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(ChatMapper::toDomain)
                .toList();
    }

    @Override
    public Chat createDefaultChat(Long workspaceId) {

        ChatEntity entity = new ChatEntity(
                workspaceId,
                "기본 채팅"
        );

        ChatEntity saved = chatJpaRepository.save(entity);

        return ChatMapper.toDomain(saved);
    }
}