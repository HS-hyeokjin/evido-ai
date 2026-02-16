package com.evido.api.document.api;

import com.evido.api.document.api.dto.response.BulkUploadResponse;
import com.evido.api.document.api.dto.response.DocumentCreateResponse;
import com.evido.api.document.api.mapper.DocumentResponseMapper;
import com.evido.api.document.application.dto.*;
import com.evido.api.document.application.port.in.DocumentUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentUseCase documentUseCase;

    // TODO: 임시 id (나중에 인증 붙이면 교체)
    private Long orgId() { return 1L; }
    private Long userId() { return 1L; }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<DocumentCreateResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "title", required = false) String title
    ) {
        var cmd = new UploadNewDocumentCommand(orgId(), userId(), title, file);
        return documentUseCase.uploadNewDocument(cmd)
                .map(DocumentResponseMapper::from);
    }

    @PostMapping(value = "/{documentId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<DocumentCreateResponse> uploadVersion(
            @PathVariable Long documentId,
            @RequestPart("file") MultipartFile file
    ) {
        var cmd = new UploadNewVersionCommand(orgId(), userId(), documentId, file);
        return documentUseCase.uploadNewVersion(cmd)
                .map(DocumentResponseMapper::from);
    }

    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<BulkUploadResponse> uploadBulk(
            @RequestPart("files") List<MultipartFile> files,
            @RequestPart(value = "title", required = false) String titlePrefix
    ) {
        var cmd = new BulkUploadCommand(orgId(), userId(), titlePrefix, files);
        return documentUseCase.uploadBulk(cmd)
                .map(DocumentResponseMapper::from);
    }
}
