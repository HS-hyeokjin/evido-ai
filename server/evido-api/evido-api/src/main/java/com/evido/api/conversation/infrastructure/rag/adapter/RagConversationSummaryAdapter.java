package com.evido.api.conversation.infrastructure.rag.adapter;

import com.evido.api.conversation.application.port.out.ConversationSummaryGeneratorPort;
import com.evido.api.conversation.application.dto.ConversationSummaryMessage;
import com.evido.api.conversation.infrastructure.dto.ConversationSummaryGenerateRequest;
import com.evido.api.conversation.infrastructure.dto.ConversationSummaryGenerateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RagConversationSummaryAdapter implements ConversationSummaryGeneratorPort {

    private final WebClient ragApiWebClient;

    @Value("${rag.summary-timeout-seconds:60}")
    private long timeoutSeconds;

    @Override
    public Mono<String> generateSummary(
            String oldSummary,
            List<ConversationSummaryMessage> messages
    ) {
        ConversationSummaryGenerateRequest request =
                ConversationSummaryGenerateRequest.of(oldSummary, messages);

        return ragApiWebClient.post()
                .uri("/conversation/summary")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ConversationSummaryGenerateResponse.class)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .map(ConversationSummaryGenerateResponse::summary);
    }
}