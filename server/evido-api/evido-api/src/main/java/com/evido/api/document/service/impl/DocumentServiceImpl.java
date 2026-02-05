package com.evido.api.document.service.impl;

import com.evido.api.document.dto.response.DocumentCreateResponse;
import com.evido.api.document.entity.Document;
import com.evido.api.document.entity.DocumentVersion;
import com.evido.api.document.entity.FileObject;
import com.evido.api.document.repository.DocumentRepository;
import com.evido.api.document.repository.DocumentVersionRepository;
import com.evido.api.document.repository.FileObjectRepository;
import com.evido.api.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final FileObjectRepository fileObjectRepository;
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;

    //todo : 추후 분기 예정스
    private static final String STORAGE_PROVIDER_LOCAL = "LOCAL";

    //todo : 자리 잡으면 requestDTO 로 변경 예정
    @Override
    @Transactional
    public DocumentCreateResponse uploadNewDocument(Long orgId, Long userId, String title, MultipartFile file) {
        validateFile(file);

        String safeTitle = StringUtils.hasText(title) ? title : defaultTitle(file.getOriginalFilename());

        FileObject savedFile = saveFileObject(orgId, file);

        LocalDateTime now = LocalDateTime.now();
        Document doc = Document.builder()
                .orgId(orgId)
                .ownerUserId(userId)
                .title(safeTitle)
                .status("ACTIVE")
                .currentVersionId(null)
                .createdAt(now)
                .updatedAt(now)
                .build();
        Document savedDoc = documentRepository.save(doc);

        DocumentVersion ver = DocumentVersion.builder()
                .documentId(savedDoc.getDocumentId())
                .fileId(savedFile.getFileId())
                .versionNo(1)
                .extractedText(null)
                .createdAt(now)
                .build();
        DocumentVersion savedVer = documentVersionRepository.save(ver);

        savedDoc.setCurrentVersionId(savedVer.getVersionId());
        savedDoc.setUpdatedAt(LocalDateTime.now());
        documentRepository.save(savedDoc);

        return new DocumentCreateResponse(
                savedDoc.getDocumentId(),
                savedVer.getVersionId(),
                savedFile.getFileId(),
                savedDoc.getTitle(),
                savedDoc.getStatus()
        );
    }

    @Override
    @Transactional
    public DocumentCreateResponse uploadNewVersion(Long orgId, Long userId, Long documentId, MultipartFile file) {
        validateFile(file);

        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을수 없음 : " + documentId));

        if (!doc.getOrgId().equals(orgId)) {
            throw new IllegalArgumentException("금지 (different org)");
        }

        FileObject savedFile = saveFileObject(orgId, file);

        int maxNo = documentVersionRepository.findMaxVersionNo(documentId);
        int nextNo = maxNo + 1;

        LocalDateTime now = LocalDateTime.now();
        DocumentVersion ver = DocumentVersion.builder()
                .documentId(documentId)
                .fileId(savedFile.getFileId())
                .versionNo(nextNo)
                .extractedText(null)
                .createdAt(now)
                .build();
        DocumentVersion savedVer = documentVersionRepository.save(ver);

        doc.setCurrentVersionId(savedVer.getVersionId());
        doc.setUpdatedAt(now);
        documentRepository.save(doc);

        return new DocumentCreateResponse(
                doc.getDocumentId(),
                savedVer.getVersionId(),
                savedFile.getFileId(),
                doc.getTitle(),
                doc.getStatus()
        );
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("file is required");
        }
        if (file.getOriginalFilename() == null) {
            throw new IllegalArgumentException("original filename is required");
        }
    }

    private String defaultTitle(String originalFilename) {
        int dot = originalFilename.lastIndexOf('.');
        return (dot > 0) ? originalFilename.substring(0, dot) : originalFilename;
    }

    private FileObject saveFileObject(Long orgId, MultipartFile file) {
        try {
            Path baseDir = Paths.get("uploads", "org-" + orgId);
            Files.createDirectories(baseDir);

            String storedName = UUID.randomUUID() + "_" + sanitize(file.getOriginalFilename());
            Path storedPath = baseDir.resolve(storedName);

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, storedPath, StandardCopyOption.REPLACE_EXISTING);
            }

            String sha256 = sha256Hex(storedPath);

            LocalDateTime now = LocalDateTime.now();
            FileObject fo = FileObject.builder()
                    .orgId(orgId)
                    .storageProvider(STORAGE_PROVIDER_LOCAL)
                    .storageKey(storedPath.toString().replace("\\", "/"))
                    .originalName(file.getOriginalFilename())
                    .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .sizeBytes(file.getSize())
                    .checksumSha256(sha256)
                    .createdAt(now)
                    .build();

            return fileObjectRepository.save(fo);
        } catch (Exception e) {
            throw new IllegalStateException("failed to store file", e);
        }
    }

    private String sanitize(String name) {
        return name.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private String sha256Hex(Path path) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] buf = new byte[8192];
        try (InputStream in = Files.newInputStream(path)) {
            int n;
            while ((n = in.read(buf)) > 0) {
                digest.update(buf, 0, n);
            }
        }
        return HexFormat.of().formatHex(digest.digest());
    }
}
