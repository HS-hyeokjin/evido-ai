package com.evido.api.document.infrastructure.rag.adapter;

import com.evido.api.document.application.port.out.DocumentProcessPort;
import com.evido.api.document.infrastructure.rag.client.RagProcessorClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class RagDocumentProcessAdapter implements DocumentProcessPort {

    private final RagProcessorClient ragProcessorClient;

    @Override
    public void process(Long documentId, Long versionId) {
        ragProcessorClient.process(documentId, versionId)
                .onErrorResume(e -> Mono.empty())
                .subscribe();
    }
}
