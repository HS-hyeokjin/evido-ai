package com.evido.api.workspace.application.port.in;

import com.evido.api.workspace.application.port.in.command.WorkspaceCreateCommand;
import com.evido.api.workspace.application.dto.WorkspaceResult;
import com.evido.api.workspace.application.port.in.command.WorkspaceDeleteCommand;
import com.evido.api.workspace.application.port.in.command.WorkspaceUpdateCommand;

import java.util.List;

public interface WorkspaceUseCase {

    WorkspaceResult create(WorkspaceCreateCommand command);

    List<WorkspaceResult> findAll(String userId);

    WorkspaceResult findById(Long workspaceId, String userId);

    WorkspaceResult update(WorkspaceUpdateCommand command);

    void delete(WorkspaceDeleteCommand command);
}