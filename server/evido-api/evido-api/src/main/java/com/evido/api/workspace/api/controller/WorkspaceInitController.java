package com.evido.api.workspace.api.controller;

import com.evido.api.workspace.api.dto.response.WorkspaceInitResponse;
import com.evido.api.workspace.api.mapper.WorkspaceInitResponseMapper;
import com.evido.api.workspace.application.dto.WorkspaceInitResult;
import com.evido.api.workspace.application.port.in.WorkspaceInitUseCase;
import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workspaces")
public class WorkspaceInitController {

    private final WorkspaceInitUseCase workspaceInitUseCase;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/init")
    public WorkspaceInitResponse init(Authentication authentication) {

        String userId = currentUserProvider.getUserId(authentication);

        WorkspaceInitResult result = workspaceInitUseCase.init(userId);

        return WorkspaceInitResponseMapper.from(result);
    }
}