import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import type { CommonResponse } from "../types/ApiResponse";
import type { WorkspaceInit } from "../types/WorkspaceInit";

interface UseWorkspaceInitOptions {
    enabled: boolean;
    user: any;
}

export default function useWorkspaceInit({ enabled, user }: UseWorkspaceInitOptions) {
    const navigate = useNavigate();
    const { workspaceId } = useParams();

    const [loading, setLoading] = useState(true);
    const requestedRef = useRef(false);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        if (!user) {
            setLoading(false);
            return;
        }

        if (workspaceId) {
            setLoading(false);
            return;
        }

        if (requestedRef.current) {
            return;
        }

        requestedRef.current = true;

        let cancelled = false;

        const initWorkspace = async () => {
            try {
                setLoading(true);

                const res = await api.get<CommonResponse<WorkspaceInit>>(
                    "/api/workspaces/init"
                );

                const nextWorkspaceId = res.data.data.workspaceId;

                if (cancelled) return;

                if (nextWorkspaceId) {
                    navigate(`/workspace/${nextWorkspaceId}`, { replace: true });
                }
            } catch (error) {
                console.error("워크스페이스 초기화 실패:", error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void initWorkspace();

        return () => {
            cancelled = true;
        };
    }, [enabled, user, workspaceId, navigate]);

    return { loading };
}