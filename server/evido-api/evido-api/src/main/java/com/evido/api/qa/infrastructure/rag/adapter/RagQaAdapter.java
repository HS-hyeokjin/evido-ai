package com.evido.api.qa.infrastructure.rag.adapter;

import com.evido.api.qa.application.port.in.command.AskCommand;
import com.evido.api.qa.infrastructure.rag.dto.RagAnswerRequest;
import com.evido.api.qa.infrastructure.rag.dto.RagAnswerResponse;
import com.evido.api.qa.infrastructure.rag.port.RagPort;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RagQaAdapter implements RagPort {

    private final WebClient ragApiWebClient;

    @Value("${rag.timeout-seconds:40}")
    private long timeoutSeconds;

    @Override
    public Mono<RagAnswerResponse> answer(AskCommand command) {
        RagAnswerRequest request = RagAnswerRequest.from(command);

        return ragApiWebClient.post()
                .uri("/answer")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(RagAnswerResponse.class)
                .timeout(Duration.ofSeconds(timeoutSeconds));
    }
}
