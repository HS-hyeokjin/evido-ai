package com.evido.api.conversation.application.port.out;

import com.evido.api.conversation.application.dto.ConversationSummaryMessage;
import reactor.core.publisher.Mono;

import java.util.List;

public interface ConversationSummaryGeneratorPort {

    Mono<String> generateSummary(
            String oldSummary,
            List<ConversationSummaryMessage> messages
    );
}