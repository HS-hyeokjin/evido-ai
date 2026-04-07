package com.evido.api.document.application.port.in.command;

import org.springframework.web.multipart.MultipartFile;

public record UploadNewVersionCommand(
        Long workspaceId,
        Long userId,
        Long documentId,
        MultipartFile file
) {}
