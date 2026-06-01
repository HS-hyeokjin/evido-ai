package com.evido.api.conversation.application.dto;

public record ConversationSummaryMessage(
        String role,
        String content
) {
}