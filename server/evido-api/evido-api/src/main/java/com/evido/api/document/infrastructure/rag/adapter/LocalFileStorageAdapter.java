package com.evido.api.document.infrastructure.rag.adapter;

import com.evido.api.document.application.dto.StoredFile;
import com.evido.api.document.application.port.out.FileStoragePort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.UUID;

@Component
@Profile("dev")
public class LocalFileStorageAdapter implements FileStoragePort {

    @Value("${app.storage.local.base-path}")
    private String basePath;

    @Override
    public StoredFile store(Long workspaceId, MultipartFile file) {

        try {
            String dirPath = basePath + "/ws-" + workspaceId;
            Files.createDirectories(Paths.get(dirPath));

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path fullPath = Paths.get(dirPath, fileName);

            Files.copy(file.getInputStream(), fullPath, StandardCopyOption.REPLACE_EXISTING);

            return new StoredFile(
                    "LOCAL",
                    fullPath.toString(),
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize()
            );

        } catch (Exception e) {
            throw new IllegalStateException("LOCAL 파일 저장 실패", e);
        }
    }

    @Override
    public InputStream load(String storageKey) {
        try {
            return Files.newInputStream(Paths.get(storageKey));
        } catch (IOException e) {
            throw new IllegalArgumentException("파일이 존재하지 않습니다: " + storageKey);
        }
    }

    @Override
    public String loadAsString(String storageKey) {

        try {
            return Files.readString(
                    Paths.get(storageKey),
                    StandardCharsets.UTF_8
            );
        } catch (IOException e) {
            throw new IllegalStateException("LOCAL 파일 읽기 실패", e);
        }
    }

    @Override
    public void delete(String storageKey) {

        try {
            Files.deleteIfExists(Paths.get(storageKey));
        } catch (IOException e) {
            throw new IllegalStateException("LOCAL 파일 삭제 실패", e);
        }
    }

    @Override
    public String generatePresignedUrl(String storageKey, int expireSeconds) {

        throw new UnsupportedOperationException("LOCAL 저장소는 presigned URL을 지원하지 않습니다.");
    }
}