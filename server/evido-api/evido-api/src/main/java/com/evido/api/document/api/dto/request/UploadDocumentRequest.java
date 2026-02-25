package com.evido.api.document.api.dto.request;

import org.springframework.web.multipart.MultipartFile;

public record UploadDocumentRequest(
        String title,
        MultipartFile file
) {}