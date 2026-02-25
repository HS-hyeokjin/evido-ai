package com.evido.api.document.infrastructure.rag.client;

import com.evido.api.document.application.port.out.VectorIndexPort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class VectorIndexWebClient implements VectorIndexPort {

    private final WebClient ragWebClient;

    @Override
    public void deleteByDocument(Long documentId) {
        ragWebClient.delete()
                .uri(uriBuilder -> uriBuilder
                        .path("/vectors")
                        .queryParam("documentId", documentId)
                        .build()
                )
                .retrieve()
                .onStatus(HttpStatusCode::isError, resp ->
                        resp.bodyToMono(String.class)
                                .map(body -> new IllegalStateException("Vector delete failed: " + body))
                )
                .toBodilessEntity()
                .block();
    }

    @Override
    public void deleteByDocumentVersion(Long documentId, Long versionId) {
        ragWebClient.delete()
                .uri(uriBuilder -> uriBuilder
                        .path("/vectors")
                        .queryParam("documentId", documentId)
                        .queryParam("versionId", versionId)
                        .build()
                )
                .retrieve()
                .onStatus(HttpStatusCode::isError, resp ->
                        resp.bodyToMono(String.class)
                                .map(body -> new IllegalStateException("Vector delete failed: " + body))
                )
                .toBodilessEntity()
                .block();
    }
}
