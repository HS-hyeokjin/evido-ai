package com.evido.api.conversation.application.port.out;

import com.evido.api.common.exception.BusinessException;
import com.evido.api.common.exception.ErrorCode;

public interface WorkspaceAccessPort {

    boolean hasAccess(Long workspaceId, String userId);

    default void validateAccess(Long workspaceId, String userId) {
        if (!hasAccess(workspaceId, userId)) {
            throw new BusinessException(ErrorCode.WORKSPACE_ACCESS_DENIED);        }
    }
}
