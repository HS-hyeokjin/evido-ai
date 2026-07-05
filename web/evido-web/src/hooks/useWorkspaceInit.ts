import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { initWorkspace } from "../api/workspaces";

interface UseWorkspaceInitOptions {
    enabled: boolean;
    user: unknown;
}

export default function useWorkspaceInit({
                                             enabled,
                                             user,
                                         }: UseWorkspaceInitOptions) {
    const navigate = useNavigate();
    const location = useLocation();
    const { workspaceId } = useParams();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        if (!user) {
            setLoading(false);
            return;
        }

        if (workspaceId) {
            setLoading(false);
            return;
        }

        if (location.pathname !== "/app") {
            setLoading(false);
            return;
        }

        let cancelled = false;

        const initWorkspaceAndMove = async () => {
            try {
                setLoading(true);

                const workspace = await initWorkspace();
                const nextWorkspaceId = workspace.workspaceId;

                if (cancelled) return;

                if (nextWorkspaceId) {
                    navigate(`/workspace/${nextWorkspaceId}`, {
                        replace: true,
                    });
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("워크스페이스 초기화 실패:", error);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void initWorkspaceAndMove();

        return () => {
            cancelled = true;
        };
    }, [enabled, user, workspaceId, location.pathname, navigate]);

    return { loading };
}