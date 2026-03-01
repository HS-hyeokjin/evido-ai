package com.evido.api.document.application.port.out;

import com.evido.api.document.application.dto.StoredFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface FileStoragePort {

    StoredFile store(Long workspaceId, MultipartFile file);

    InputStream load(String storageKey);

    void delete(String storageKey);

    String generatePresignedUrl(String storageKey, int expireSeconds);
}