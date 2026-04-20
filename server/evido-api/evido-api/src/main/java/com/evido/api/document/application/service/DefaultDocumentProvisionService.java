package com.evido.api.document.application.service;

import com.evido.api.document.api.dto.support.ByteArrayMultipartFile;
import com.evido.api.document.application.port.in.DefaultDocumentProvisionUseCase;
import com.evido.api.document.application.port.in.DocumentUseCase;
import com.evido.api.document.application.port.in.command.UploadNewDocumentCommand;
import com.evido.api.document.infrastructure.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class DefaultDocumentProvisionService implements DefaultDocumentProvisionUseCase {

    private static final String GUIDE_RESOURCE_PATH = "classpath:bootstrap/evido-guide.txt";
    private static final String GUIDE_TITLE = "EVIDO 사용 설명서";
    private static final String GUIDE_FILENAME = "evido-guide.txt";
    private static final String GUIDE_CONTENT_TYPE = "text/plain";

    private final DocumentUseCase documentUseCase;
    private final DocumentRepository documentRepository;
    private final ResourceLoader resourceLoader;

    @Override
    @Transactional
    public void provisionGuideForWorkspace(Long workspaceId, String userId) {

        boolean alreadyExists =
                documentRepository.existsByWorkspaceIdAndOwnerUserIdAndStatusAndTitle(
                        workspaceId,
                        userId,
                        "ACTIVE",
                        GUIDE_TITLE
                );

        if (alreadyExists) {
            return;
        }

        Resource resource = resourceLoader.getResource(GUIDE_RESOURCE_PATH);

        if (!resource.exists()) {
            throw new IllegalStateException("기본 가이드 파일이 없습니다: " + GUIDE_RESOURCE_PATH);
        }

        byte[] bytes;
        try (InputStream in = resource.getInputStream()) {
            bytes = in.readAllBytes();
        } catch (Exception e) {
            throw new IllegalStateException("기본 가이드 파일 읽기 실패", e);
        }

        MultipartFile multipartFile = new ByteArrayMultipartFile(
                GUIDE_FILENAME,
                GUIDE_FILENAME,
                GUIDE_CONTENT_TYPE,
                bytes
        );

        documentUseCase.uploadNewDocument(
                new UploadNewDocumentCommand(
                        workspaceId,
                        userId,
                        GUIDE_TITLE,
                        multipartFile
                )
        ).block();
    }
}