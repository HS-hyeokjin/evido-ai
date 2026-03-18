package com.evido.api.workspace.infrastructure.persistence;

import com.evido.api.workspace.infrastructure.persistence.entity.WorkspaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceJpaRepository extends JpaRepository<WorkspaceEntity, Long> {
}