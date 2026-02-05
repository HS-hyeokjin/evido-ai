package com.evido.api.document.service;

import com.evido.api.document.dto.response.DocumentCreateResponse;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentService {
    DocumentCreateResponse uploadNewDocument(Long orgId, Long userId, String title, MultipartFile file);
    DocumentCreateResponse uploadNewVersion(Long orgId, Long userId, Long documentId, MultipartFile file);
}
