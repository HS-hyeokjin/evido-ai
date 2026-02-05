package com.evido.api.document.controller;

import com.evido.api.document.dto.response.DocumentCreateResponse;
import com.evido.api.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    private Long orgId() { return 1L; }
    private Long userId() { return 1L; }

    // 문서 신규 업로드 = document + version(1) + file_object 생성
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentCreateResponse upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "title", required = false) String title
    ) {
        return documentService.uploadNewDocument(orgId(), userId(), title, file);
    }

    // 기존 문서에 새 버전 업로드
    @PostMapping(value = "/{documentId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentCreateResponse uploadVersion(
            @PathVariable Long documentId,
            @RequestPart("file") MultipartFile file
    ) {
        return documentService.uploadNewVersion(orgId(), userId(), documentId, file);
    }
}
