package com.evido.api.document.application.port.in;

import com.evido.api.document.application.dto.*;
import reactor.core.publisher.Mono;
import org.springframework.core.io.Resource;

public interface DocumentUseCase {

    Mono<BulkUploadResult> uploadBulk(BulkUploadCommand cmd);

    Mono<DocumentCreateResult> uploadNewDocument(UploadNewDocumentCommand cmd);

    Mono<DocumentCreateResult> uploadNewVersion(UploadNewVersionCommand cmd);

    Mono<PageResult<DocumentListItemResult>> listDocuments(ListDocumentsQuery query);

    Mono<Void> deleteDocument(DeleteDocumentCommand cmd);

    Mono<String> getDocumentDownloadUrl(GetDocumentFileQuery q);

    Mono<DocumentFileMetaResult> getDocumentFileMeta(GetDocumentFileQuery query);

    Mono<String> getDocumentTextContent(GetDocumentFileQuery query);
}
