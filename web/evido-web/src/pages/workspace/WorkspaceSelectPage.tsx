import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

interface Workspace {
    id: number;
    name: string;
}

export default function WorkspaceSelectPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const res = await api.get("/api/workspaces");
            setWorkspaces(res.data);
        } catch (e) {
            console.error("workspace 조회 실패", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWorkspace = async () => {
        const name = prompt("워크스페이스 이름을 입력하세요");
        if (!name) return;

        try {
            const res = await api.post("/api/workspaces", { name });
            navigate(`/workspace/${res.data.id}`);
        } catch (e) {
            console.error("workspace 생성 실패", e);
        }
    };

    const enterWorkspace = (id: number) => {
        navigate(`/workspace/${id}`);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-slate-400">
                워크스페이스 불러오는 중...
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50">

            <div className="w-[420px] rounded-2xl bg-white p-8 shadow-lg">

                <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                    워크스페이스 선택
                </h1>

                <div className="space-y-3">

                    {workspaces.map((ws) => (
                        <button
                            key={ws.id}
                            onClick={() => enterWorkspace(ws.id)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            {ws.name}
                        </button>
                    ))}

                </div>

                <button
                    onClick={handleCreateWorkspace}
                    className="mt-6 w-full rounded-xl bg-primary-500 px-4 py-3 font-bold text-white transition hover:bg-primary-600"
                >
                    + 새 워크스페이스 만들기
                </button>

            </div>

        </div>
    );
}