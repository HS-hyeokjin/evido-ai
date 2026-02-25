package com.evido.api.document.application.port.out;

public interface DocumentProcessPort {

    void process(Long documentId, Long versionId);

}
