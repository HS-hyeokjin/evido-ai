package com.evido.api.document.application.port.in.command;

import org.springframework.web.multipart.MultipartFile;

public record UploadNewVersionCommand(
        Long workspaceId,
        String userId,
        Long documentId,
        MultipartFile file
) {}
