package com.evido.api.workspace.application.port.in;

import com.evido.api.workspace.application.dto.WorkspaceInitResult;

public interface WorkspaceInitUseCase {

    WorkspaceInitResult init(String userId);
}