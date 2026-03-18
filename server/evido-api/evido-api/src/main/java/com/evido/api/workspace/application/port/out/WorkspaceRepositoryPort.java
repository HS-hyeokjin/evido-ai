package com.evido.api.workspace.application.port.out;

import com.evido.api.workspace.domain.Workspace;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceRepositoryPort {

    Workspace save(Workspace workspace);

    Optional<Workspace> findById(Long workspaceId);

    List<Workspace> findAllByUserId(String userId);
}