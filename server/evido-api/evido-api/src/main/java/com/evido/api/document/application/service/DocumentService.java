package com.evido.api.document.application.service;

import com.evido.api.document.application.dto.*;
import com.evido.api.document.application.port.in.DocumentUseCase;
import com.evido.api.document.application.port.out.DocumentProcessPort;
import com.evido.api.document.entity.*;
import com.evido.api.document.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.InputStream;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DocumentService implements DocumentUseCase {

    private final FileObjectRepository fileObjectRepository;
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final TransactionTemplate txTemplate;
    private final DocumentProcessPort documentProcessPort;

    private static final String STORAGE_PROVIDER_LOCAL = "LOCAL";

    @Override
    @Transactional
    public Mono<DocumentCreateResult> uploadNewDocument(UploadNewDocumentCommand cmd) {
        MultipartFile file = cmd.file();
        validateFile(file);

        String safeTitle = StringUtils.hasText(cmd.title()) ? cmd.title() : defaultTitle(file.getOriginalFilename());
        FileObject savedFile = saveFileObject(cmd.orgId(), file);
        LocalDateTime now = LocalDateTime.now();

        Document doc = Document.builder()
                .orgId(cmd.orgId())
                .ownerUserId(cmd.userId())
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

        triggerProcessAfterCommit(savedDoc.getDocumentId(), savedVer.getVersionId());

        return Mono.just(new DocumentCreateResult(
                savedDoc.getDocumentId(),
                savedVer.getVersionId(),
                savedFile.getFileId(),
                savedDoc.getTitle(),
                savedDoc.getStatus()
        ));
    }

    @Override
    @Transactional
    public Mono<DocumentCreateResult> uploadNewVersion(UploadNewVersionCommand cmd) {
        MultipartFile file = cmd.file();
        validateFile(file);

        Document doc = documentRepository.findById(cmd.documentId())
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을수 없음 : " + cmd.documentId()));

        if (!doc.getOrgId().equals(cmd.orgId())) {
            throw new IllegalArgumentException("금지 (different org)");
        }

        FileObject savedFile = saveFileObject(cmd.orgId(), file);

        int maxNo = documentVersionRepository.findMaxVersionNo(cmd.documentId());
        int nextNo = maxNo + 1;

        LocalDateTime now = LocalDateTime.now();
        DocumentVersion ver = DocumentVersion.builder()
                .documentId(cmd.documentId())
                .fileId(savedFile.getFileId())
                .versionNo(nextNo)
                .extractedText(null)
                .createdAt(now)
                .build();

        DocumentVersion savedVer = documentVersionRepository.save(ver);

        doc.setCurrentVersionId(savedVer.getVersionId());
        doc.setUpdatedAt(now);
        documentRepository.save(doc);

        triggerProcessAfterCommit(doc.getDocumentId(), savedVer.getVersionId());

        return Mono.just(new DocumentCreateResult(
                doc.getDocumentId(),
                savedVer.getVersionId(),
                savedFile.getFileId(),
                doc.getTitle(),
                doc.getStatus()
        ));
    }

    @Override
    public Mono<BulkUploadResult> uploadBulk(BulkUploadCommand cmd) {
        List<MultipartFile> files = cmd.files();
        if (files == null || files.isEmpty()) {
            return Mono.just(new BulkUploadResult(
                    List.of(),
                    List.of(new BulkUploadResult.BulkUploadFailedItemResult("-", "files is required"))
            ));
        }

        List<DocumentCreateResult> success = new ArrayList<>();
        List<BulkUploadResult.BulkUploadFailedItemResult> failed = new ArrayList<>();

        for (MultipartFile f : files) {
            String filename = (f != null && f.getOriginalFilename() != null) ? f.getOriginalFilename() : "(unknown)";
            try {
                DocumentCreateResult res = txTemplate.execute(status -> {
                    String title = buildTitle(cmd.titlePrefix(), filename);
                    return uploadNewDocument(new UploadNewDocumentCommand(cmd.orgId(), cmd.userId(), title, f)).block();
                });
                success.add(res);
            } catch (Exception e) {
                failed.add(new BulkUploadResult.BulkUploadFailedItemResult(filename, toUserReason(e)));
            }
        }

        return Mono.just(new BulkUploadResult(success, failed));
    }

    private void triggerProcessAfterCommit(Long documentId, Long versionId) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            safeTrigger(documentId, versionId);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() { safeTrigger(documentId, versionId); }
        });
    }

    private void safeTrigger(Long documentId, Long versionId) {
        try { documentProcessPort.process(documentId, versionId); }
        catch (Exception ignored) { }
    }

    private String buildTitle(String titlePrefix, String filename) {
        String base = defaultTitle(filename);
        if (!StringUtils.hasText(titlePrefix)) return base;
        return titlePrefix + " - " + base;
    }

    private String toUserReason(Exception e) {
        if (e instanceof IllegalArgumentException) return e.getMessage();
        return "업로드 실패";
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("file is required");
        if (file.getOriginalFilename() == null) throw new IllegalArgumentException("original filename is required");
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
            while ((n = in.read(buf)) > 0) digest.update(buf, 0, n);
        }
        return HexFormat.of().formatHex(digest.digest());
    }
}
