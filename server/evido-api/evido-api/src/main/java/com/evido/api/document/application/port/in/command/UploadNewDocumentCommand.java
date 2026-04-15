package com.evido.api.document.application.port.in.command;

import org.springframework.web.multipart.MultipartFile;

public record UploadNewDocumentCommand(
        Long workspaceId,
        String userId,
        String title,
        MultipartFile file
) {}
