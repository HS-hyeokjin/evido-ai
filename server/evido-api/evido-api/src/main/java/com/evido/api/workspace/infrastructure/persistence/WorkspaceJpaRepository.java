package com.evido.api.workspace.infrastructure.persistence;

import com.evido.api.workspace.infrastructure.persistence.entity.WorkspaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WorkspaceJpaRepository extends JpaRepository<WorkspaceEntity, Long> {

    @Query("""
        select distinct w
        from WorkspaceEntity w
        join w.members m
        where m.userId = :userId
        order by w.createdAt desc
    """)
    List<WorkspaceEntity> findAllByUserId(String userId);

    @Query("""
        select distinct w
        from WorkspaceEntity w
        left join fetch w.members m
        where w.id = :workspaceId
    """)
    Optional<WorkspaceEntity> findByIdWithMembers(Long workspaceId);
}