package com.evido.api.document.application.dto;

import org.springframework.web.multipart.MultipartFile;

public record UploadNewDocumentCommand(
        Long workspaceId,
        Long userId,
        String title,
        MultipartFile file
) {}
