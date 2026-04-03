import Card from "../../components/common/Card";
import {
    FileText,
    MessageSquareText,
    Activity,
    Plus,
    Clock,
    Sparkles,
} from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-black text-slate-900">대시보드</h1>
                <p className="text-sm text-slate-500 mt-1">
                    문서 기반 AI 지식 시스템을 관리하세요
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-slate-400 font-bold">문서</div>
                            <div className="text-2xl font-black mt-1">128</div>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <FileText className="h-5 w-5 text-blue-600"/>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        총 업로드 문서
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-slate-400 font-bold">대화</div>
                            <div className="text-2xl font-black mt-1">42</div>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-xl">
                            <MessageSquareText className="h-5 w-5 text-purple-600"/>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        생성된 대화 수
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-slate-400 font-bold">사용량</div>
                            <div className="text-2xl font-black mt-1">1.2k</div>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <Activity className="h-5 w-5 text-emerald-600"/>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        이번 달 요청 수
                    </div>
                </Card>

            </div>

            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-black text-slate-800">
                            빠른 시작
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                            바로 작업을 시작해보세요
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 mt-4 md:grid-cols-3">

                    <button className="flex items-center gap-3 p-3 rounded-xl border hover:bg-slate-50 transition">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Plus className="h-4 w-4 text-blue-600"/>
                        </div>
                        <div className="text-sm font-bold">
                            문서 업로드
                        </div>
                    </button>

                    <button className="flex items-center gap-3 p-3 rounded-xl border hover:bg-slate-50 transition">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Sparkles className="h-4 w-4 text-purple-600"/>
                        </div>
                        <div className="text-sm font-bold">
                            새 대화 시작
                        </div>
                    </button>

                    <button className="flex items-center gap-3 p-3 rounded-xl border hover:bg-slate-50 transition">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <FileText className="h-4 w-4 text-emerald-600"/>
                        </div>
                        <div className="text-sm font-bold">
                            문서 관리
                        </div>
                    </button>

                </div>
            </Card>

            {/* RECENT ACTIVITY */}
            <Card>
                <div className="flex items-center gap-2 font-black text-slate-800">
                    <Clock className="h-4 w-4 text-slate-500"/>
                    최근 활동
                </div>

                <div className="mt-4 space-y-3">

                    <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-700">
                            📄 문서 "API 가이드.pdf" 업로드됨
                        </div>
                        <div className="text-xs text-slate-400">2분 전</div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-700">
                            💬 새로운 대화 생성
                        </div>
                        <div className="text-xs text-slate-400">10분 전</div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-700">
                            🤖 질문 처리 완료
                        </div>
                        <div className="text-xs text-slate-400">30분 전</div>
                    </div>

                </div>
            </Card>

            {/* RECENT CHATS */}
            <Card>
                <div className="font-black text-slate-800">
                    최근 대화
                </div>

                <div className="mt-4 space-y-2">

                    {["EVIDO 사용법", "문서 검색 기능", "RAG 구조 설명"].map((title, i) => (
                        <div
                            key={i}
                            className="p-3 rounded-xl border hover:bg-slate-50 cursor-pointer transition"
                        >
                            <div className="text-sm font-bold text-slate-800">
                                {title}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                마지막 활동: 방금 전
                            </div>
                        </div>
                    ))}

                </div>
            </Card>
        </div>
    );
}