package com.evido.api.conversation.infrastructure.dto;

import com.evido.api.conversation.application.dto.ConversationSummaryMessage;

import java.util.List;

public record ConversationSummaryGenerateRequest(
        String oldSummary,
        List<Message> messages
) {
    public record Message(
            String role,
            String content
    ) {}

    public static ConversationSummaryGenerateRequest of(
            String oldSummary,
            List<ConversationSummaryMessage> messages
    ) {
        List<Message> convertedMessages = messages == null ? List.of() :
                messages.stream()
                        .map(message -> new Message(
                                message.role(),
                                message.content()
                        ))
                        .toList();

        return new ConversationSummaryGenerateRequest(
                oldSummary,
                convertedMessages
        );
    }
}