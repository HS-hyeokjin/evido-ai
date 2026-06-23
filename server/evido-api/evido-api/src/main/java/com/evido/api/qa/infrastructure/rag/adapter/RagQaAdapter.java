package com.evido.api.qa.infrastructure.rag.adapter;

import com.evido.api.qa.application.dto.ConversationContext;
import com.evido.api.qa.application.port.in.command.AskCommand;
import com.evido.api.qa.application.port.out.RagPort;
import com.evido.api.qa.infrastructure.rag.dto.RagAnswerRequest;
import com.evido.api.qa.infrastructure.rag.dto.RagAnswerResponse;
import com.evido.api.qa.infrastructure.rag.dto.RagStreamEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class RagQaAdapter implements RagPort {

    private final WebClient ragApiWebClient;

    @Value("${rag.timeout-seconds:40}")
    private long timeoutSeconds;

    @Value("${rag.stream-timeout-seconds:180}")
    private long streamTimeoutSeconds;

    @Override
    public Mono<RagAnswerResponse> answer(AskCommand command, ConversationContext context) {
        RagAnswerRequest request = RagAnswerRequest.from(command, context);

        return ragApiWebClient.post()
                .uri("/answer")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(RagAnswerResponse.class)
                .timeout(Duration.ofSeconds(timeoutSeconds));
    }

    @Override
    public Flux<RagStreamEvent> answerStream(AskCommand command, ConversationContext context) {
        RagAnswerRequest request = RagAnswerRequest.from(command, context);

        return ragApiWebClient.post()
                .uri("/answer/stream")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(request)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<RagStreamEvent>>() {
                })
                .map(ServerSentEvent::data)
                .filter(Objects::nonNull)
                .timeout(Duration.ofSeconds(streamTimeoutSeconds));
    }
}