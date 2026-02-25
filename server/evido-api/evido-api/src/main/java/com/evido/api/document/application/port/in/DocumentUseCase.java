package com.evido.api.document.application.port.in;

import com.evido.api.document.application.dto.*;
import reactor.core.publisher.Mono;
import org.springframework.core.io.Resource;

public interface DocumentUseCase {

    Mono<DocumentCreateResult> uploadNewDocument(UploadNewDocumentCommand cmd);

    Mono<DocumentCreateResult> uploadNewVersion(UploadNewVersionCommand cmd);

    Mono<BulkUploadResult> uploadBulk(BulkUploadCommand cmd);

    Mono<PageResult<DocumentListItemResult>> listDocuments(ListDocumentsQuery query);

    Mono<Void> deleteDocument(DeleteDocumentCommand cmd);

    Mono<String> getDocumentTextContent(GetDocumentTextContentQuery q);

    Mono<Resource> getDocumentFileResource(GetDocumentFileQuery query);

    Mono<DocumentFileMetaResult> getDocumentFileMeta(GetDocumentFileQuery query);

}
