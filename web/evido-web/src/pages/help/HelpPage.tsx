import {
    BookOpen,
    Upload,
    MessageSquareText,
    AlertTriangle,
    Mail
} from "lucide-react";

export default function HelpPage() {

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            <div>
                <h1 className="text-2xl font-extrabold text-slate-800">
                    도움말
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    EVIDO 사용 방법과 문제 해결 가이드를 제공합니다
                </p>
            </div>


            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={18} className="text-primary-600"/>
                    <h2 className="font-bold text-slate-800">
                        시작하기
                    </h2>
                </div>

                <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-2">
                    <li>Google 계정으로 로그인합니다.</li>
                    <li>문서를 업로드합니다.</li>
                    <li>문서가 자동으로 인덱싱됩니다.</li>
                    <li>Conversation에서 질문을 입력하면 문서를 기반으로 답변합니다.</li>
                </ol>
            </div>


            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Upload size={18} className="text-primary-600"/>
                    <h2 className="font-bold text-slate-800">
                        문서 업로드
                    </h2>
                </div>

                <p className="text-sm text-slate-600 mb-2">
                    다음 형식의 문서를 업로드할 수 있습니다.
                </p>

                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                    <li>PDF</li>
                    <li>DOCX</li>
                    <li>TXT</li>
                    <li>Markdown (MD)</li>
                </ul>

                <p className="text-xs text-slate-500 mt-3">
                    업로드된 문서는 자동으로 Chunking → Embedding → Vector DB에 저장됩니다.
                </p>
            </div>


            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <MessageSquareText size={18} className="text-primary-600"/>
                    <h2 className="font-bold text-slate-800">
                        질문하기 (RAG)
                    </h2>
                </div>

                <p className="text-sm text-slate-600 mb-2">
                    Conversation 메뉴에서 질문을 입력하면 다음 과정을 통해 답변이 생성됩니다.
                </p>

                <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-2">
                    <li>질문을 Embedding 벡터로 변환</li>
                    <li>Vector DB(Qdrant)에서 관련 문서 검색</li>
                    <li>LLM이 근거 기반 답변 생성</li>
                </ol>

                <p className="text-xs text-slate-500 mt-3">
                    답변에는 근거 문서가 함께 제공됩니다.
                </p>
            </div>


            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={18} className="text-primary-600"/>
                    <h2 className="font-bold text-slate-800">
                        문제 해결
                    </h2>
                </div>

                <div className="space-y-3 text-sm text-slate-600">

                    <div>
                        <p className="font-semibold text-slate-700">
                            문서가 검색되지 않습니다
                        </p>
                        <p className="text-xs text-slate-500">
                            문서 인덱싱이 완료되었는지 확인하세요.
                        </p>
                    </div>

                    <div>
                        <p className="font-semibold text-slate-700">
                            답변이 정확하지 않습니다
                        </p>
                        <p className="text-xs text-slate-500">
                            질문을 더 구체적으로 작성해보세요.
                        </p>
                    </div>

                    <div>
                        <p className="font-semibold text-slate-700">
                            파일 업로드 오류
                        </p>
                        <p className="text-xs text-slate-500">
                            파일 크기 제한 또는 형식을 확인하세요.
                        </p>
                    </div>

                </div>
            </div>


            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-2 mb-4">
                    <Mail size={18} className="text-primary-600"/>
                    <h2 className="font-bold text-slate-800">
                        문의하기
                    </h2>
                </div>

                <p className="text-sm text-slate-600 mb-3">
                    문제가 해결되지 않으면 문의해주세요.
                </p>

                <div className="text-sm text-slate-700 font-semibold">
                    youngurwls@gmail.com
                </div>

            </div>

        </div>
    );
}