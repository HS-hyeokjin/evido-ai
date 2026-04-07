package com.evido.api.workspace.application.port.in;

import com.evido.api.workspace.application.port.in.command.WorkspaceCreateCommand;
import com.evido.api.workspace.application.dto.WorkspaceResult;

import java.util.List;

public interface WorkspaceUseCase {

    WorkspaceResult create(WorkspaceCreateCommand command);

    List<WorkspaceResult> findAll(String userId);

    WorkspaceResult findById(Long workspaceId, String userId);
}