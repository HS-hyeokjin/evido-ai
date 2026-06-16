import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Workspace } from "../../types/Workspace";
import api from "../../api/client";
import type { CommonResponse } from "../../types/ApiResponse";
import { unwrapResponse } from "../../types/ApiResponse";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

export default function WorkspaceSelectPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const res = await api.get<CommonResponse<Workspace[]>>(
                "/api/workspaces"
            );

            const data = unwrapResponse(res.data);

            setWorkspaces(data ?? []);
        } catch (e) {
            console.error("workspace 조회 실패", e);
            setErrorMessage(getApiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWorkspace = async () => {
        const inputName = prompt("워크스페이스 이름을 입력하세요");

        if (!inputName) return;

        const name = inputName.trim();

        if (!name) {
            setErrorMessage("워크스페이스 이름을 입력해주세요.");
            return;
        }

        try {
            setCreating(true);
            setErrorMessage("");

            const res = await api.post<CommonResponse<Workspace>>(
                "/api/workspaces",
                { name }
            );

            const createdWorkspace = unwrapResponse(res.data);

            if (!createdWorkspace) {
                setErrorMessage("워크스페이스 생성 결과를 확인할 수 없습니다.");
                return;
            }

            navigate(`/workspace/${createdWorkspace.id}`);
        } catch (e) {
            console.error("workspace 생성 실패", e);
            setErrorMessage(getApiErrorMessage(e));
        } finally {
            setCreating(false);
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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
            <div className="w-full max-w-xl rounded-3xl bg-white/90 backdrop-blur p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        워크스페이스 선택
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        작업할 공간을 선택하거나 새로 생성하세요
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {errorMessage}
                    </div>
                )}

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {workspaces.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                            아직 생성된 워크스페이스가 없습니다.
                        </div>
                    ) : (
                        workspaces.map((ws) => (
                            <button
                                key={ws.id}
                                onClick={() => enterWorkspace(ws.id)}
                                className="group w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition
                                           hover:border-primary-300 hover:bg-primary-50 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 font-bold">
                                            {ws.name?.charAt(0) || "W"}
                                        </div>

                                        <div>
                                            <div className="font-semibold text-slate-800 group-hover:text-primary-700">
                                                {ws.name}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                워크스페이스
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-slate-300 group-hover:text-primary-400 transition">
                                        →
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <button
                    onClick={handleCreateWorkspace}
                    disabled={creating}
                    className="mt-6 w-full rounded-2xl bg-primary-300 px-4 py-4 font-bold text-white shadow-md transition
                               hover:bg-primary-600 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {creating ? "생성 중..." : "+ 새 워크스페이스 만들기"}
                </button>
            </div>
        </div>
    );
}