package com.evido.api.document.api.controller;

import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import com.evido.api.common.response.CommonResponse;
import com.evido.api.document.api.dto.request.*;
import com.evido.api.document.api.dto.response.*;
import com.evido.api.document.api.mapper.DocumentResponseMapper;
import com.evido.api.document.application.port.in.DocumentUseCase;
import com.evido.api.document.application.port.in.command.BulkUploadCommand;
import com.evido.api.document.application.port.in.command.DeleteDocumentCommand;
import com.evido.api.document.application.port.in.command.UploadNewDocumentCommand;
import com.evido.api.document.application.port.in.command.UploadNewVersionCommand;
import com.evido.api.document.application.port.in.query.GetDocumentFileQuery;
import com.evido.api.document.application.port.in.query.ListDocumentsQuery;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.nio.charset.StandardCharsets;

@Tag(name = "Document", description = "문서 업로드, 조회, 다운로드, 삭제 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workspaces/{workspaceId}/documents")
public class DocumentController {

    private final DocumentUseCase documentUseCase;
    private final CurrentUserProvider currentUserProvider;

    @Operation(summary = "텍스트 문서 내용 조회")
    @GetMapping(value = "/{documentId}/content", produces = MediaType.TEXT_PLAIN_VALUE)
    public Mono<ResponseEntity<String>> getTextContent(
            @PathVariable Long workspaceId,
            @PathVariable Long documentId,

            @ParameterObject
            @ModelAttribute DocumentContentRequest req,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var query = new GetDocumentFileQuery(
                workspaceId,
                userId,
                documentId,
                req.versionId()
        );

        return documentUseCase.getDocumentTextContent(query)
                .map(this::textResponse);
    }

    @Operation(summary = "문서 파일 열기")
    @GetMapping("/{documentId}/file")
    public Mono<ResponseEntity<?>> getFile(
            @PathVariable Long workspaceId,
            @PathVariable Long documentId,

            @ParameterObject
            @ModelAttribute DownloadDocumentRequest req,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var query = new GetDocumentFileQuery(
                workspaceId,
                userId,
                documentId,
                req.versionId()
        );

        return documentUseCase.getDocumentFileMeta(query)
                .flatMap(meta -> {
                    if (meta.inline()) {
                        return documentUseCase.getDocumentInlineResource(query)
                                .map(resource -> ResponseEntity.ok()
                                        .contentType(MediaType.parseMediaType(meta.contentType()))
                                        .header(
                                                HttpHeaders.CONTENT_DISPOSITION,
                                                "inline; filename=\"" + meta.filename() + "\""
                                        )
                                        .body(resource));
                    }

                    return documentUseCase.getDocumentDownloadUrl(query)
                            .map(url -> ResponseEntity.status(HttpStatus.FOUND)
                                    .location(URI.create(url))
                                    .build());
                });
    }

    @Operation(summary = "문서 다운로드 URL 조회")
    @GetMapping("/{documentId}/download")
    public Mono<CommonResponse<String>> getDownloadUrl(
            @PathVariable Long workspaceId,
            @PathVariable Long documentId,

            @ParameterObject
            @ModelAttribute DownloadDocumentRequest req,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var query = new GetDocumentFileQuery(
                workspaceId,
                userId,
                documentId,
                req.versionId()
        );

        return documentUseCase.getDocumentDownloadUrl(query)
                .map(url -> CommonResponse.success(
                        "문서 다운로드 URL 조회에 성공했습니다.",
                        url
                ));
    }

    @Operation(summary = "문서 업로드")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<CommonResponse<DocumentCreateResponse>> upload(
            @PathVariable Long workspaceId,

            @ParameterObject
            @ModelAttribute UploadDocumentRequest req,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var cmd = new UploadNewDocumentCommand(
                workspaceId,
                userId,
                req.title(),
                req.file()
        );

        return documentUseCase.uploadNewDocument(cmd)
                .map(DocumentResponseMapper::from)
                .map(response -> CommonResponse.success(
                        "문서 업로드가 완료되었습니다.",
                        response
                ));
    }

    @Operation(summary = "문서 새 버전 업로드")
    @PostMapping(value = "/{documentId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<CommonResponse<DocumentCreateResponse>> uploadVersion(
            @PathVariable Long workspaceId,
            @PathVariable Long documentId,

            @ParameterObject
            @ModelAttribute UploadDocumentVersionRequest req,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var cmd = new UploadNewVersionCommand(
                workspaceId,
                userId,
                documentId,
                req.file()
        );

        return documentUseCase.uploadNewVersion(cmd)
                .map(DocumentResponseMapper::from)
                .map(response -> CommonResponse.success(
                        "문서 새 버전 업로드가 완료되었습니다.",
                        response
                ));
    }

    @Operation(summary = "문서 일괄 업로드")
    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<CommonResponse<BulkUploadResponse>> uploadBulk(
            @PathVariable Long workspaceId,

            @ParameterObject
            @ModelAttribute BulkUploadRequest req,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var cmd = new BulkUploadCommand(
                workspaceId,
                userId,
                req.titlePrefix(),
                req.files()
        );

        return documentUseCase.uploadBulk(cmd)
                .map(DocumentResponseMapper::from)
                .map(response -> CommonResponse.success(
                        "문서 일괄 업로드 처리가 완료되었습니다.",
                        response
                ));
    }

    @Operation(summary = "문서 목록 조회")
    @GetMapping
    public Mono<CommonResponse<PageResponse<DocumentListItemResponse>>> list(
            @PathVariable Long workspaceId,

            @ParameterObject
            @ModelAttribute ListDocumentsRequest req,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);
        Sort sort = parseSort(req.sortOrDefault());

        var query = new ListDocumentsQuery(
                workspaceId,
                userId,
                req.q(),
                req.pageOrDefault(),
                req.sizeOrDefault(),
                sort
        );

        return documentUseCase.listDocuments(query)
                .map(DocumentResponseMapper::from)
                .map(CommonResponse::success);
    }

    @Operation(summary = "문서 삭제")
    @DeleteMapping("/{documentId}")
    public Mono<CommonResponse<Void>> delete(
            @PathVariable Long workspaceId,
            @PathVariable Long documentId,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var cmd = new DeleteDocumentCommand(
                workspaceId,
                userId,
                documentId
        );

        return documentUseCase.deleteDocument(cmd)
                .thenReturn(CommonResponse.<Void>success(
                        "문서가 삭제되었습니다.",
                        null
                ));
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
                (parts.length >= 2 && "asc".equalsIgnoreCase(parts[1].trim()))
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        return Sort.by(direction, property);
    }
}