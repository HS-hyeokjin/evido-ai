package com.evido.api.qa.application.dto;

import java.util.List;

public record ConversationContext(
        String summary,
        List<RecentMessage> recentMessages
) {
    public record RecentMessage(
            String role,
            String content
    ) {}

    public static ConversationContext empty() {
        return new ConversationContext(null, List.of());
    }

    public ConversationContext {
        if (recentMessages == null) {
            recentMessages = List.of();
        }
    }
}