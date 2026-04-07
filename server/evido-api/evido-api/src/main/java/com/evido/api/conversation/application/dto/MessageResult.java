package com.evido.api.conversation.application.dto;

import java.time.LocalDateTime;

public record MessageResult(
        Long id,
        String role,
        String content,
        LocalDateTime createdAt
) {
}