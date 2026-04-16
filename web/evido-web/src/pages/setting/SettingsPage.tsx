import { useState } from "react";
import { User, KeyRound, Database, Trash2 } from "lucide-react";

export default function SettingsPage() {
    const [name, setName] = useState("사용자");
    const [email] = useState("user@email.com");

    const handleSave = () => {
        alert("설정이 저장되었습니다.");
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-800">설정</h1>
                <p className="mt-1 text-sm text-slate-500">
                    EVIDO 계정 및 시스템 설정을 관리합니다
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <User size={18} className="text-primary-600" />
                    <h2 className="font-bold text-slate-800">계정 정보</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-500">이름</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-500">이메일</label>
                        <input
                            value={email}
                            disabled
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="mt-4 rounded-xl bg-primary-500 px-4 py-2 text-sm font-bold text-white hover:bg-primary-600"
                >
                    저장
                </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <KeyRound size={18} className="text-primary-600" />
                    <h2 className="font-bold text-slate-800">API 설정</h2>
                </div>

                <div>
                    <label className="text-xs text-slate-500">RAG 서버 주소</label>
                    <input
                        defaultValue=""
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                </div>

                <div className="mt-3">
                    <label className="text-xs text-slate-500">Embedding 모델</label>
                    <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                        <option>all-MiniLM-L12-v2</option>
                        <option>bge-small</option>
                        <option>e5-small</option>
                    </select>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Database size={18} className="text-primary-600" />
                    <h2 className="font-bold text-slate-800">데이터 관리</h2>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            모든 문서 삭제
                        </p>
                        <p className="text-xs text-slate-500">
                            업로드된 모든 문서와 벡터 인덱스가 삭제됩니다
                        </p>
                    </div>

                    <button className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100">
                        <Trash2 size={14} />
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}