import { deleteData, getData, patchData, postData } from "./http";
import type { Workspace } from "../types/Workspace";
import type { WorkspaceInit } from "../types/WorkspaceInit";

export function listWorkspaces(): Promise<Workspace[]> {
    return getData<Workspace[]>("/api/workspaces");
}

export function initWorkspace(): Promise<WorkspaceInit> {
    return getData<WorkspaceInit>("/api/workspaces/init");
}

export function createWorkspace(name: string): Promise<Workspace> {
    return postData<Workspace, { name: string }>("/api/workspaces", { name });
}

export function renameWorkspace(
    workspaceId: number,
    name: string
): Promise<Workspace> {
    return patchData<Workspace, { name: string }>(
        `/api/workspaces/${workspaceId}`,
        { name }
    );
}

export function removeWorkspace(workspaceId: number): Promise<void> {
    return deleteData(`/api/workspaces/${workspaceId}`);
}