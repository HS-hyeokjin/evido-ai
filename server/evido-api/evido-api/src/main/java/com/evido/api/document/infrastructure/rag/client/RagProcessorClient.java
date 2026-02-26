package com.evido.api.document.infrastructure.rag.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RagProcessorClient {

    private final WebClient ragProcessorWebClient;

    @Value("${rag.processor.timeout-seconds:5}")
    private long timeoutSeconds;

    public Mono<Void> process(Long documentId, Long versionId) {
        return ragProcessorWebClient.post()
                .uri("/process")
                .bodyValue(new ProcessRequest(documentId, versionId))
                .retrieve()
                .bodyToMono(Void.class)
                .timeout(Duration.ofSeconds(timeoutSeconds));
    }

    public record ProcessRequest(Long documentId, Long versionId) {}
}
