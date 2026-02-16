package com.evido.api.document.application.dto;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public record BulkUploadCommand(
        Long orgId,
        Long userId,
        String titlePrefix,
        List<MultipartFile> files
) {}
