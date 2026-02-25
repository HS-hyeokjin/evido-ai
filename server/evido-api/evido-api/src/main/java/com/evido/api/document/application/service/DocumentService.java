package com.evido.api.document.application.service;

import com.evido.api.document.application.dto.*;
import com.evido.api.document.application.port.in.DocumentUseCase;
import com.evido.api.document.application.port.out.DocumentProcessPort;
import com.evido.api.document.application.port.out.VectorIndexPort;
import com.evido.api.document.entity.*;
import com.evido.api.document.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.*;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;

import java.io.InputStream;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService implements DocumentUseCase {

    private final FileObjectRepository fileObjectRepository;
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final TransactionTemplate txTemplate;
    private final DocumentProcessPort documentProcessPort;
    private final DocumentChunkRepository documentChunkRepository;
    private final VectorIndexPort vectorIndexPort;

    private static final String STORAGE_PROVIDER_LOCAL = "LOCAL";

    @Override
    @Transactional
    public Mono<DocumentCreateResult> uploadNewDocument(UploadNewDocumentCommand cmd) {
        MultipartFile file = cmd.file();
        validateFile(file);

        String safeTitle = StringUtils.hasText(cmd.title())
                ? cmd.title()
                : defaultTitle(file.getOriginalFilename());

        FileObject savedFile = saveFileObject(cmd.workspaceId(), file);
        LocalDateTime now = LocalDateTime.now();

        Document doc = Document.builder()
                .workspaceId(cmd.workspaceId())
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

        if (!Objects.equals(doc.getWorkspaceId(), cmd.workspaceId())) {
            throw new IllegalArgumentException("금지 (different workspace)");
        }

        FileObject savedFile = saveFileObject(cmd.workspaceId(), file);

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
                    return uploadNewDocument(new UploadNewDocumentCommand(
                            cmd.workspaceId(), cmd.userId(), title, f
                    )).block();
                });
                success.add(res);
            } catch (Exception e) {
                failed.add(new BulkUploadResult.BulkUploadFailedItemResult(filename, toUserReason(e)));
            }
        }

        return Mono.just(new BulkUploadResult(success, failed));
    }

    @Override
    @Transactional(readOnly = true)
    public Mono<PageResult<DocumentListItemResult>> listDocuments(ListDocumentsQuery query) {
        Pageable pageable = PageRequest.of(
                Math.max(query.page(), 0),
                Math.min(Math.max(query.size(), 1), 200),
                query.sort()
        );

        var page = (StringUtils.hasText(query.q()))
                ? documentRepository.findByWorkspaceIdAndTitleContainingIgnoreCase(
                query.workspaceId(), query.q().trim(), pageable
        )
                : documentRepository.findByWorkspaceId(query.workspaceId(), pageable);

        List<Long> versionIds = page.getContent().stream()
                .map(Document::getCurrentVersionId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, DocumentVersion> verById = versionIds.isEmpty()
                ? Map.of()
                : documentVersionRepository.findByVersionIdIn(versionIds).stream()
                .collect(Collectors.toMap(DocumentVersion::getVersionId, Function.identity()));

        List<Long> fileIds = verById.values().stream()
                .map(DocumentVersion::getFileId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, FileObject> fileById = fileIds.isEmpty()
                ? Map.of()
                : fileObjectRepository.findByFileIdIn(fileIds).stream()
                .collect(Collectors.toMap(FileObject::getFileId, Function.identity()));

        List<DocumentListItemResult> content = page.getContent().stream()
                .map(doc -> {
                    Long vid = doc.getCurrentVersionId();
                    DocumentVersion ver = (vid != null) ? verById.get(vid) : null;
                    Long fid = (ver != null) ? ver.getFileId() : null;
                    FileObject fo = (fid != null) ? fileById.get(fid) : null;

                    return new DocumentListItemResult(
                            doc.getDocumentId(),
                            doc.getTitle(),
                            vid,
                            fid,
                            fo != null ? fo.getOriginalName() : null,
                            doc.getCreatedAt(),
                            doc.getStatus()
                    );
                })
                .toList();

        return Mono.just(new PageResult<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        ));
    }

    @Override
    @Transactional
    public Mono<Void> deleteDocument(DeleteDocumentCommand cmd) {
        Document doc = documentRepository.findById(cmd.documentId())
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을수 없음 : " + cmd.documentId()));

        if (!Objects.equals(doc.getWorkspaceId(), cmd.workspaceId())) {
            throw new IllegalArgumentException("금지 (different workspace)");
        }

        if ("DELETED".equalsIgnoreCase(doc.getStatus())) {
            return Mono.empty();
        }

        doc.setStatus("DELETED");
        doc.setUpdatedAt(LocalDateTime.now());
        documentRepository.save(doc);

        afterCommit(() -> cleanupDeletedDocument(doc.getDocumentId()));

        return Mono.empty();
    }

    @Override
    @Transactional(readOnly = true)
    public Mono<String> getDocumentTextContent(GetDocumentTextContentQuery q) {
        Document doc = documentRepository.findById(q.documentId())
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을수 없음 : " + q.documentId()));

        if (!Objects.equals(doc.getWorkspaceId(), q.workspaceId())) {
            throw new IllegalArgumentException("금지 (different workspace)");
        }

        if ("DELETED".equalsIgnoreCase(doc.getStatus())) {
            throw new IllegalArgumentException("삭제된 문서입니다.");
        }

        Long targetVersionId = (q.versionId() != null) ? q.versionId() : doc.getCurrentVersionId();
        if (targetVersionId == null) {
            throw new IllegalArgumentException("조회할 버전이 없습니다.");
        }

        DocumentVersion ver = documentVersionRepository.findById(targetVersionId)
                .orElseThrow(() -> new IllegalArgumentException("버전을 찾을수 없음 : " + targetVersionId));

        if (!Objects.equals(ver.getDocumentId(), doc.getDocumentId())) {
            throw new IllegalArgumentException("금지 (version does not belong to document)");
        }

        Long fileId = ver.getFileId();
        if (fileId == null) {
            throw new IllegalArgumentException("파일이 연결되지 않았습니다.");
        }

        FileObject fo = fileObjectRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을수 없음 : " + fileId));

        String originalName = fo.getOriginalName();
        String ext = getExt(originalName);
        if (!isTextExt(ext)) {
            throw new IllegalArgumentException("텍스트 미리보기는 TXT/MD만 지원합니다. (현재: " + (ext.isBlank() ? "unknown" : ext) + ")");
        }

        if (!STORAGE_PROVIDER_LOCAL.equalsIgnoreCase(fo.getStorageProvider())) {
            throw new IllegalArgumentException("현재 LOCAL 저장소만 지원합니다.");
        }

        if (!StringUtils.hasText(fo.getStorageKey())) {
            throw new IllegalArgumentException("storageKey가 비어있습니다.");
        }

        Path path = Paths.get(fo.getStorageKey());
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("파일이 존재하지 않습니다.");
        }

        long size = safeFileSize(path);
        long max = 2 * 1024 * 1024;
        if (size > max) {
            throw new IllegalArgumentException("텍스트 파일이 너무 큽니다. (" + prettySize(size) + " > " + prettySize(max) + ")");
        }

        try {
            String body = Files.readString(path, java.nio.charset.StandardCharsets.UTF_8);
            return Mono.just(body);
        } catch (Exception e) {
            throw new IllegalStateException("텍스트 파일 읽기 실패", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Mono<Resource> getDocumentFileResource(GetDocumentFileQuery q) {
        FileObject fo = resolveFileObject(q);
        if (!STORAGE_PROVIDER_LOCAL.equalsIgnoreCase(fo.getStorageProvider())) {
            throw new IllegalArgumentException("현재 LOCAL 저장소만 지원합니다.");
        }
        if (!StringUtils.hasText(fo.getStorageKey())) {
            throw new IllegalArgumentException("storageKey가 비어있습니다.");
        }

        Path path = Paths.get(fo.getStorageKey());
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("파일이 존재하지 않습니다.");
        }

        try {
            return Mono.just(new UrlResource(path.toUri()));
        } catch (MalformedURLException e) {
            throw new IllegalStateException("파일 리소스 생성 실패", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Mono<DocumentFileMetaResult> getDocumentFileMeta(GetDocumentFileQuery q) {
        FileObject fo = resolveFileObject(q);

        String filename = (fo.getOriginalName() != null) ? fo.getOriginalName() : ("document-" + q.documentId());
        String ext = getExt(filename);

        String contentType = fo.getContentType();
        if (!StringUtils.hasText(contentType)) contentType = "application/octet-stream";

        boolean inline = "pdf".equals(ext);

        if (inline && !"application/pdf".equalsIgnoreCase(contentType)) {
            contentType = "application/pdf";
        }

        return Mono.just(new DocumentFileMetaResult(filename, contentType, inline));
    }

    private FileObject resolveFileObject(GetDocumentFileQuery q) {
        Document doc = documentRepository.findById(q.documentId())
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을수 없음 : " + q.documentId()));

        if (!Objects.equals(doc.getWorkspaceId(), q.workspaceId())) {
            throw new IllegalArgumentException("금지 (different workspace)");
        }
        if ("DELETED".equalsIgnoreCase(doc.getStatus())) {
            throw new IllegalArgumentException("삭제된 문서입니다.");
        }

        Long targetVersionId = (q.versionId() != null) ? q.versionId() : doc.getCurrentVersionId();
        if (targetVersionId == null) {
            throw new IllegalArgumentException("조회할 버전이 없습니다.");
        }

        DocumentVersion ver = documentVersionRepository.findById(targetVersionId)
                .orElseThrow(() -> new IllegalArgumentException("버전을 찾을수 없음 : " + targetVersionId));

        if (!Objects.equals(ver.getDocumentId(), doc.getDocumentId())) {
            throw new IllegalArgumentException("금지 (version does not belong to document)");
        }

        Long fileId = ver.getFileId();
        if (fileId == null) throw new IllegalArgumentException("파일이 연결되지 않았습니다.");

        return fileObjectRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을수 없음 : " + fileId));
    }

    private String getExt(String name) {
        if (name == null) return "";
        int dot = name.lastIndexOf('.');
        return (dot >= 0) ? name.substring(dot + 1).toLowerCase() : "";
    }

    private boolean isTextExt(String ext) {
        return "txt".equals(ext) || "md".equals(ext) || "markdown".equals(ext);
    }

    private long safeFileSize(Path p) {
        try {
            return Files.size(p);
        } catch (Exception e) {
            return -1L;
        }
    }

    private String prettySize(long bytes) {
        if (bytes < 0) return "?";
        if (bytes < 1024) return bytes + " B";
        double kb = bytes / 1024.0;
        if (kb < 1024) return String.format(java.util.Locale.US, "%.0f KB", kb);
        double mb = kb / 1024.0;
        return String.format(java.util.Locale.US, "%.1f MB", mb);
    }

    private void afterCommit(Runnable r) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            r.run();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() { r.run(); }
        });
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
        try {
            documentProcessPort.process(documentId, versionId);
        } catch (Exception ignored) { }
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

    private FileObject saveFileObject(Long workspaceId, MultipartFile file) {
        try {
            // ✅ org 폴더 -> ws 폴더
            Path baseDir = Paths.get("uploads", "ws-" + workspaceId);
            Files.createDirectories(baseDir);

            String storedName = UUID.randomUUID() + "_" + sanitize(file.getOriginalFilename());
            Path storedPath = baseDir.resolve(storedName);

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, storedPath, StandardCopyOption.REPLACE_EXISTING);
            }

            String sha256 = sha256Hex(storedPath);
            LocalDateTime now = LocalDateTime.now();

            FileObject fo = FileObject.builder()
                    .workspaceId(workspaceId)
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

    private void cleanupDeletedDocument(Long documentId) {
        try {
            documentChunkRepository.deleteByDocumentId(documentId);
        } catch (Exception ignored) { }

        try {
            vectorIndexPort.deleteByDocument(documentId);
        } catch (Exception ignored) { }

        try {
            List<DocumentVersion> versions = documentVersionRepository.findByDocumentId(documentId);

            for (DocumentVersion v : versions) {
                Long fileId = v.getFileId();
                if (fileId == null) continue;

                fileObjectRepository.findById(fileId).ifPresent(fo -> {
                    try {
                        if ("LOCAL".equalsIgnoreCase(fo.getStorageProvider()) && fo.getStorageKey() != null) {
                            Files.deleteIfExists(Paths.get(fo.getStorageKey()));
                        }
                    } catch (Exception ignored) { }

                    try {
                        fileObjectRepository.delete(fo);
                    } catch (Exception ignored) { }
                });
            }

            try {
                documentVersionRepository.deleteAll(versions);
            } catch (Exception ignored) { }

        } catch (Exception ignored) { }
    }
}