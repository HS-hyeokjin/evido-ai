package com.evido.api.workspace.api.mapper;

import com.evido.api.workspace.api.dto.response.WorkspaceResponse;
import com.evido.api.workspace.application.dto.WorkspaceResult;

public class WorkspaceResponseMapper {

    public static WorkspaceResponse from(WorkspaceResult result) {
        return new WorkspaceResponse(
                result.id(),
                result.name(),
                result.createdAt()
        );
    }
}