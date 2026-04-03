package com.evido.api.conversation.api.dto.response;

import java.time.LocalDateTime;

public record MessageResponse(
        Long in,
        String role,
        String content,
        LocalDateTime createdAt
) {}
