package com.evido.api.document.application.port.in;

import com.evido.api.document.application.dto.*;
import com.evido.api.document.application.port.in.command.BulkUploadCommand;
import com.evido.api.document.application.port.in.command.DeleteDocumentCommand;
import com.evido.api.document.application.port.in.command.UploadNewDocumentCommand;
import com.evido.api.document.application.port.in.command.UploadNewVersionCommand;
import com.evido.api.document.application.port.in.query.GetDocumentFileQuery;
import com.evido.api.document.application.port.in.query.ListDocumentsQuery;
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

    Mono<Resource> getDocumentInlineResource(GetDocumentFileQuery q);
}
