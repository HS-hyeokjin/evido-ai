package com.evido.api.document.controller;

import com.evido.api.document.dto.response.BulkUploadResponse;
import com.evido.api.document.dto.response.DocumentCreateResponse;
import com.evido.api.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    //todo : 임시 id
    private Long orgId() {
        return 1L;
    }

    private Long userId() {
        return 1L;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentCreateResponse upload(@RequestPart("file") MultipartFile file, @RequestPart(value = "title", required = false) String title) {
        return documentService.uploadNewDocument(orgId(), userId(), title, file);
    }

    @PostMapping(value = "/{documentId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentCreateResponse uploadVersion(@PathVariable Long documentId, @RequestPart("file") MultipartFile file) {
        return documentService.uploadNewVersion(orgId(), userId(), documentId, file);
    }

    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BulkUploadResponse uploadBulk(@RequestPart("files") List<MultipartFile> files, @RequestPart(value = "title", required = false) String titlePrefix) {
        return documentService.uploadNewDocuments(orgId(), userId(), titlePrefix, files);
    }
}
