package com.evido.api.conversation.application.port.out;

public interface WorkspaceAccessPort {

    boolean hasAccess(Long workspaceId, String userId);

    default void validateAccess(Long workspaceId, String userId) {
        if (!hasAccess(workspaceId, userId)) {
            throw new RuntimeException("워크스페이스 접근 권한이 없습니다.");
        }
    }
}
