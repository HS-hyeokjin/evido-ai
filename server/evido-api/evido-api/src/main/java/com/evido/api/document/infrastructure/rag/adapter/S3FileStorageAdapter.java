package com.evido.api.document.infrastructure.rag.adapter;

import com.evido.api.document.application.dto.StoredFile;
import com.evido.api.document.application.port.out.FileStoragePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.*;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.*;
import software.amazon.awssdk.services.s3.presigner.model.*;

import java.io.InputStream;
import java.time.Duration;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class S3FileStorageAdapter implements FileStoragePort {

    private final S3Client s3Client;
    private final S3Presigner presigner;

    private final String bucketName = System.getenv("AWS_S3_BUCKET");

    @Override
    public StoredFile store(Long workspaceId, MultipartFile file) {
        try {
            String key = "ws-" + workspaceId + "/" +
                    UUID.randomUUID() + "_" + file.getOriginalFilename();

            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(request,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return new StoredFile(
                    "S3",
                    key,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize()
            );

        } catch (Exception e) {
            throw new IllegalStateException("S3 업로드 실패", e);
        }
    }

    @Override
    public InputStream load(String storageKey) {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(storageKey)
                .build();

        return s3Client.getObject(request);
    }

    @Override
    public void delete(String storageKey) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(storageKey)
                .build();
        s3Client.deleteObject(request);
    }

    @Override
    public String generatePresignedUrl(String storageKey, int expireSeconds) {

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(storageKey)
                .build();

        GetObjectPresignRequest presignRequest =
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofSeconds(expireSeconds))
                        .getObjectRequest(getObjectRequest)
                        .build();

        return presigner.presignGetObject(presignRequest)
                .url()
                .toString();
    }
}