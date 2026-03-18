package com.evido.api.workspace.domain;

import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
public class Workspace {

    private Long id;
    private String name;
    private LocalDateTime createdAt;
    private final List<WorkspaceMember> members = new ArrayList<>();

    private Workspace(String name) {
        this.name = name;
        this.createdAt = LocalDateTime.now();
    }

    public Workspace(Long id, String name, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
    }

    public static Workspace create(String name, String ownerUserId) {
        Workspace workspace = new Workspace(name);

        workspace.members.add(
                WorkspaceMember.createOwner(ownerUserId, null)
        );

        return workspace;
    }

    public void addMember(WorkspaceMember member) {
        members.add(member);
    }

    public boolean isMember(String userId) {
        return members.stream()
                .anyMatch(m -> m.getUserId().equals(userId));
    }

}