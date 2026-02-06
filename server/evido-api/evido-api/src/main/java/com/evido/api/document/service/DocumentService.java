package com.evido.api.document.service;

import com.evido.api.document.dto.response.BulkUploadResponse;
import com.evido.api.document.dto.response.DocumentCreateResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {
    DocumentCreateResponse uploadNewDocument(Long orgId, Long userId, String title, MultipartFile file);
    DocumentCreateResponse uploadNewVersion(Long orgId, Long userId, Long documentId, MultipartFile file);
    BulkUploadResponse uploadNewDocuments(Long orgId, Long userId, String titlePrefix, List<MultipartFile> files);

}
