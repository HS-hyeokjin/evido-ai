package com.evido.api.document.api.dto.request;

import org.springframework.web.multipart.MultipartFile;

public record UploadDocumentVersionRequest(
        Long documentId,
        MultipartFile file
) {}