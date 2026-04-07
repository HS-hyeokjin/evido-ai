package com.evido.api.document.application.port.in.command;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public record BulkUploadCommand(
        Long workspaceId,
        Long userId,
        String titlePrefix,
        List<MultipartFile> files
) {}
