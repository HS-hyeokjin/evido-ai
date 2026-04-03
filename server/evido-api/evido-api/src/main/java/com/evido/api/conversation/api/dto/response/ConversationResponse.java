package com.evido.api.conversation.api.dto.response;

import java.time.LocalDateTime;

public record ConversationResponse (
    Long id,
    Long workspaceId,
    String title,
    LocalDateTime createAt
    ) {}
