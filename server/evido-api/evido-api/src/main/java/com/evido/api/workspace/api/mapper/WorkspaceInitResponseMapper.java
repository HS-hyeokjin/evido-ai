package com.evido.api.workspace.api.mapper;

import com.evido.api.workspace.api.dto.response.WorkspaceInitResponse;
import com.evido.api.workspace.application.dto.WorkspaceInitResult;

public class WorkspaceInitResponseMapper {

    public static WorkspaceInitResponse from(WorkspaceInitResult result) {
        return new WorkspaceInitResponse(
                result.workspaceId(),
                result.conversationId()
        );
    }
}
