package com.evido.api.document.application.port.out;

public interface VectorIndexPort {

    void deleteByDocument(Long documentId);

    void deleteByDocumentVersion(Long documentId, Long versionId);

}