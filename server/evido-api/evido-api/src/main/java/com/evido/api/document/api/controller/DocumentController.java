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
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    @Operation(
            summary = "텍스트 문서 내용 조회",
            description = "문서의 내용을 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "문서 내용 조회 성공",
                    content = @Content(
                            mediaType = "text/plain",
                            schema = @Schema(type = "string", example = "문서 본문 내용...")
                    )
            ),
            @ApiResponse(responseCode = "400", description = "텍스트 미리보기를 지원하지 않는 문서 형식"),
            @ApiResponse(responseCode = "403", description = "문서 접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "문서 또는 버전을 찾을 수 없음")
    })
    @GetMapping(value = "/{documentId}/content", produces = MediaType.TEXT_PLAIN_VALUE)
    public Mono<ResponseEntity<String>> getTextContent(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId,

            @Parameter(description = "문서 ID", example = "10")
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

    @Operation(
            summary = "문서 파일 열기",
            description = "PDF 같은 인라인 문서는 바로 열고, 그 외 파일은 다운로드 가능한 URL로 리다이렉트합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "인라인 문서 열기 성공"),
            @ApiResponse(responseCode = "302", description = "다운로드 URL로 리다이렉트"),
            @ApiResponse(responseCode = "403", description = "문서 접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "문서 또는 버전을 찾을 수 없음")
    })
    @GetMapping("/{documentId}/file")
    public Mono<ResponseEntity<?>> getFile(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId,

            @Parameter(description = "문서 ID", example = "10")
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

    @Operation(
            summary = "문서 다운로드 URL 조회",
            description = "문서 다운로드에 사용할 URL을 반환합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "다운로드 URL 조회 성공",
                    content = @Content(schema = @Schema(implementation = CommonResponse.class))
            ),
            @ApiResponse(responseCode = "403", description = "문서 접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "문서 또는 버전을 찾을 수 없음")
    })
    @GetMapping("/{documentId}/download")
    public Mono<CommonResponse<String>> getDownloadUrl(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId,

            @Parameter(description = "문서 ID", example = "10")
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
                .map(url -> CommonResponse.success("문서 다운로드 URL 조회에 성공했습니다.", url));
    }

    @Operation(
            summary = "문서 업로드",
            description = "워크스페이스에 새 문서를 업로드합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "문서 업로드 성공",
                    content = @Content(schema = @Schema(implementation = CommonResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 파일 또는 요청"),
            @ApiResponse(responseCode = "403", description = "워크스페이스 접근 권한 없음")
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<CommonResponse<DocumentCreateResponse>> upload(
            @Parameter(description = "워크스페이스 ID", example = "1")
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

    @Operation(
            summary = "문서 새 버전 업로드",
            description = "기존 문서에 새 버전을 업로드합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "문서 버전 업로드 성공",
                    content = @Content(schema = @Schema(implementation = CommonResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 파일 또는 요청"),
            @ApiResponse(responseCode = "403", description = "문서 접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "문서를 찾을 수 없음")
    })
    @PostMapping(value = "/{documentId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<CommonResponse<DocumentCreateResponse>> uploadVersion(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId,

            @Parameter(description = "문서 ID", example = "10")
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

    @Operation(
            summary = "문서 일괄 업로드",
            description = "여러 문서를 한 번에 업로드합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "일괄 업로드 처리 완료",
                    content = @Content(schema = @Schema(implementation = CommonResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 파일 또는 요청"),
            @ApiResponse(responseCode = "403", description = "워크스페이스 접근 권한 없음")
    })
    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<CommonResponse<BulkUploadResponse>> uploadBulk(
            @Parameter(description = "워크스페이스 ID", example = "1")
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

    @Operation(
            summary = "문서 목록 조회",
            description = "워크스페이스의 문서 목록을 페이지 단위로 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "문서 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = CommonResponse.class))
            ),
            @ApiResponse(responseCode = "403", description = "워크스페이스 접근 권한 없음")
    })
    @GetMapping
    public Mono<CommonResponse<PageResponse<DocumentListItemResponse>>> list(
            @Parameter(description = "워크스페이스 ID", example = "1")
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
                .map(response -> CommonResponse.success(response));
    }

    @Operation(
            summary = "문서 삭제",
            description = "문서를 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "문서 삭제 성공"),
            @ApiResponse(responseCode = "403", description = "문서 접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "문서를 찾을 수 없음")
    })
    @DeleteMapping("/{documentId}")
    public Mono<CommonResponse<Void>> delete(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId,

            @Parameter(description = "문서 ID", example = "10")
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