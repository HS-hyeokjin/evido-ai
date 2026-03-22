package com.evido.api.workspace.api;

import com.evido.api.workspace.api.dto.response.WorkspaceInitResponse;
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

        if (userId == null) {
            throw new RuntimeException("인증 필요");
        }

        WorkspaceInitResult result = workspaceInitUseCase.init(userId);

        return new WorkspaceInitResponse(
                result.workspaceId(),
                result.conversationId()
        );
    }
}