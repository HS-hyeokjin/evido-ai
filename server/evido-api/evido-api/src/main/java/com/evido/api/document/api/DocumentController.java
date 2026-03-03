package com.evido.api.document.api;

import com.evido.api.document.api.dto.request.*;
import com.evido.api.document.api.dto.response.*;
import com.evido.api.document.api.mapper.DocumentResponseMapper;
import com.evido.api.document.application.dto.*;
import com.evido.api.document.application.port.in.DocumentUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.nio.charset.StandardCharsets;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentUseCase documentUseCase;

    // TODO
    private Long workspaceId() {
        return 1L;
    }

    private Long userId() {
        return 1L;
    }

    @GetMapping(value = "/{documentId}/content", produces = MediaType.TEXT_PLAIN_VALUE)
    public Mono<ResponseEntity<String>> getTextContent(@PathVariable Long documentId, @ModelAttribute DocumentContentRequest req) {

        var cmd = new GetDocumentFileQuery(
                workspaceId(),
                userId(),
                documentId,
                req.versionId()
        );

        return documentUseCase.getDocumentTextContent(cmd).map(this::textResponse);
    }

    @GetMapping("/{documentId}/download")
    public Mono<ResponseEntity<String>> getDownloadUrl(
            @PathVariable Long documentId,
            @ModelAttribute DownloadDocumentRequest req) {

        var query = new GetDocumentFileQuery(
                workspaceId(),
                userId(),
                documentId,
                req.versionId()
        );

        return documentUseCase.getDocumentDownloadUrl(query)
                .map(ResponseEntity::ok);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<DocumentCreateResponse> upload(@ModelAttribute UploadDocumentRequest req) {

        var cmd = new UploadNewDocumentCommand(
                workspaceId(),
                userId(),
                req.title(),
                req.file()
        );

        return documentUseCase.uploadNewDocument(cmd).map(DocumentResponseMapper::from);
    }

    @PostMapping(value = "/{documentId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<DocumentCreateResponse> uploadVersion(@PathVariable Long documentId, @ModelAttribute UploadDocumentVersionRequest req) {

        var cmd = new UploadNewVersionCommand(
                workspaceId(),
                userId(),
                documentId,
                req.file()
        );

        return documentUseCase.uploadNewVersion(cmd).map(DocumentResponseMapper::from);
    }

    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<BulkUploadResponse> uploadBulk(@ModelAttribute BulkUploadRequest req) {

        var cmd = new BulkUploadCommand(
                workspaceId(),
                userId(),
                req.titlePrefix(),
                req.files()
        );

        return documentUseCase.uploadBulk(cmd).map(DocumentResponseMapper::from);
    }

    @GetMapping
    public Mono<PageResponse<DocumentListItemResponse>> list(@ModelAttribute ListDocumentsRequest req) {

        Sort sort = parseSort(req.sortOrDefault());

        var cmd = new ListDocumentsQuery(
                workspaceId(),
                userId(),
                req.q(),
                req.pageOrDefault(),
                req.sizeOrDefault(),
                sort
        );

        return documentUseCase.listDocuments(cmd).map(DocumentResponseMapper::from);
    }

    @DeleteMapping("/{documentId}")
    public Mono<Void> delete(@PathVariable Long documentId) {

        var cmd = new DeleteDocumentCommand(
                workspaceId(),
                userId(),
                documentId
        );

        return documentUseCase.deleteDocument(cmd);
    }

    private ResponseEntity<String> textResponse(String body) {
        return ResponseEntity.ok()
                .contentType(new MediaType("text", "plain", StandardCharsets.UTF_8))
                .body(body);
    }

    private Sort parseSort(String sort) {

        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String[] parts = sort.split(",");
        String property = parts[0].trim();

        Sort.Direction direction =
                (parts.length >= 2 && "asc".equalsIgnoreCase(parts[1].trim())) ? Sort.Direction.ASC : Sort.Direction.DESC;

        return Sort.by(direction, property);
    }
}