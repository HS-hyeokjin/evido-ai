import { useEffect, useState } from "react";
import api from "../api/client";
import type {WorkspaceInit} from "../types/WorkspaceInit.ts";

export default function useWorkspaceInit() {
    const [data, setData] = useState<WorkspaceInit | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                const res = await api.get<WorkspaceInit>("/api/workspaces/init");

                if (mounted) {
                    setData(res.data);
                }
            } catch (e) {
                console.error("workspace init 실패", e);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        init();

        return () => {
            mounted = false;
        };
    }, []);

    return { data, loading };
}