package com.evido.api.document.api.dto.request;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public record BulkUploadRequest(
        String titlePrefix,
        List<MultipartFile> files
) {}