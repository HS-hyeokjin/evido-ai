package com.evido.api.document.application.port.in;

import com.evido.api.document.application.dto.*;
import reactor.core.publisher.Mono;

public interface DocumentUseCase {
    Mono<DocumentCreateResult> uploadNewDocument(UploadNewDocumentCommand cmd);
    Mono<DocumentCreateResult> uploadNewVersion(UploadNewVersionCommand cmd);
    Mono<BulkUploadResult> uploadBulk(BulkUploadCommand cmd);
}
