package com.evido.api.document.application.port.in;

public interface DefaultDocumentProvisionUseCase {
    void provisionGuideForWorkspace(Long workspaceId, String userId);
}