package com.evido.api.document.application.dto;

import org.springframework.web.multipart.MultipartFile;

public record UploadNewVersionCommand(
        Long workspaceId,
        Long userId,
        Long documentId,
        MultipartFile file
) {}
