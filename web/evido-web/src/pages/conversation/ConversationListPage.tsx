import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { motion } from "framer-motion";
import {
    MessageSquareText,
    Plus,
    UploadCloud,
    FileText,
    Sparkles,
    ChevronRight,
    FolderOpen,
} from "lucide-react";

interface Conversation {
    id: number;
    title: string;
    createdAt: string;
}

interface Document {
    documentId: number;
    title: string;
    createdAt: string;
}

export default function ConversationListPage() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, [workspaceId]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [conversationRes, docRes] = await Promise.all([
                api.get(`/api/conversations/${workspaceId}/conversations`),
                api.get(`/api/documents?page=0&size=5`)
            ]);

            setConversations(conversationRes.data ?? []);
            setDocuments(docRes.data.content ?? []);
        } catch (e) {
            console.error("대화/문서 조회 실패", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateConversation = () => {
        navigate(`/workspace/${workspaceId}/conversation/new`);
    };

    return (
        <div className="min-h-screen bg-white px-1 py-2 text-slate-800">
            <div className="space-y-6">
                <div className="relative overflow-hidden rounded-[22px] border border-[#EEE7FB] bg-gradient-to-br from-white via-[#FCFAFF] to-[#F7F2FF] p-5 shadow-[0_8px_24px_rgba(124,106,166,0.06)]">
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#EDE2FF]/60 blur-3xl" />
                    <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-[#F3ECFF] blur-3xl" />

                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E9DFFB] bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#8A72B8]">
                                <Sparkles size={12} />
                                EVIDO Workspace
                            </div>

                            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                                워크스페이스
                            </h1>

                            <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#7B728D]">
                                문서를 정리하고, 대화를 이어가고, AI와 함께 작업을 시작해보세요.
                            </p>
                        </div>

                        <button
                            onClick={handleCreateConversation}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#BFA8F8] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_18px_rgba(191,168,248,0.28)] transition hover:-translate-y-0.5 hover:bg-[#B397F4]"
                        >
                            <Plus size={15} />
                            새 대화
                        </button>
                    </div>

                    <div className="relative mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        <div className="rounded-xl border border-[#EEE7FB] bg-white/75 px-3.5 py-3 backdrop-blur">
                            <div className="text-[11px] font-semibold text-[#9A8CB8]">대화</div>
                            <div className="mt-1 text-xl font-black text-slate-900">
                                {conversations.length}
                            </div>
                        </div>
                        <div className="rounded-xl border border-[#EEE7FB] bg-white/75 px-3.5 py-3 backdrop-blur">
                            <div className="text-[11px] font-semibold text-[#9A8CB8]">문서</div>
                            <div className="mt-1 text-xl font-black text-slate-900">
                                {documents.length}
                            </div>
                        </div>
                        <div className="rounded-xl border border-[#EEE7FB] bg-white/75 px-3.5 py-3 backdrop-blur">
                            <div className="text-[11px] font-semibold text-[#9A8CB8]">상태</div>
                            <div className="mt-1 text-xs font-bold text-[#7C63B8]">
                                {loading ? "불러오는 중" : "준비 완료"}
                            </div>
                        </div>
                    </div>
                </div>

                <section className="rounded-[22px] border border-[#F0E9FC] bg-white p-5 shadow-[0_8px_24px_rgba(100,90,140,0.04)]">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#8A72B8]">
                                <MessageSquareText size={18} />
                            </div>
                            <div>
                                <div className="text-base font-black text-slate-900">대화</div>
                                <div className="text-xs text-[#8B84A0]">
                                    최근 대화를 이어가거나 새로 시작해보세요
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-32 items-center justify-center rounded-2xl border border-[#EEE7FB] bg-[#FCFAFF] text-xs font-medium text-[#9A93AD]">
                            불러오는 중...
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E9DFFB] bg-gradient-to-b from-[#FFFEFF] to-[#F9F5FF] text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4EEFF] text-[#AA93D8] shadow-inner">
                                <MessageSquareText size={24} />
                            </div>

                            <div className="text-base font-bold text-slate-700">
                                아직 대화가 없습니다
                            </div>

                            <div className="mt-1.5 text-xs text-[#9A93AD]">
                                첫 질문을 시작하면 새로운 대화가 만들어져요
                            </div>

                            <button
                                onClick={handleCreateConversation}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#BFA8F8] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_18px_rgba(191,168,248,0.28)] transition hover:-translate-y-0.5 hover:bg-[#B397F4]"
                            >
                                <Plus size={15} />
                                첫 대화 시작하기
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {conversations.map((conversation, index) => (
                                <motion.div
                                    key={conversation.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    onClick={() =>
                                        navigate(`/workspace/${workspaceId}/conversation/${conversation.id}`)
                                    }
                                    className="group cursor-pointer rounded-2xl border border-[#EEE7FB] bg-gradient-to-b from-white to-[#FCFAFF] p-4 shadow-[0_6px_18px_rgba(132,107,184,0.05)] transition hover:border-[#DCCBFA] hover:shadow-[0_10px_22px_rgba(132,107,184,0.10)]"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#8A72B8]">
                                            <MessageSquareText size={16} />
                                        </div>

                                        <ChevronRight
                                            size={14}
                                            className="mt-1 text-[#C5B6E6] transition group-hover:translate-x-0.5 group-hover:text-[#9F86D8]"
                                        />
                                    </div>

                                    <div className="truncate text-sm font-bold text-slate-800">
                                        {conversation.title || "제목 없음"}
                                    </div>

                                    <div className="mt-2 text-[11px] text-[#9A93AD]">
                                        {new Date(conversation.createdAt).toLocaleString()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-[22px] border border-[#F0E9FC] bg-white p-5 shadow-[0_8px_24px_rgba(100,90,140,0.04)]">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#8A72B8]">
                                <FileText size={18} />
                            </div>
                            <div>
                                <div className="text-base font-black text-slate-900">문서</div>
                                <div className="text-xs text-[#8B84A0]">
                                    최근 업로드한 문서
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                navigate(`/workspace/${workspaceId}/documents/upload`)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E9DFFB] bg-[#FCFAFF] px-3 py-2 text-xs font-semibold text-[#7C63B8] transition hover:bg-[#F7F1FF]"
                        >
                            <UploadCloud size={14} />
                            업로드
                        </button>
                    </div>

                    {documents.length === 0 ? (
                        <div className="flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E9DFFB] bg-gradient-to-b from-[#FEFDFF] to-[#FAF7FF] text-center">
                            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#B19AD8]">
                                <FolderOpen size={22} />
                            </div>
                            <div className="text-sm font-semibold text-slate-700">
                                아직 업로드된 문서가 없습니다
                            </div>
                            <div className="mt-1 text-xs text-[#9A93AD]">
                                문서를 업로드해보세요
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {documents.map((doc, index) => (
                                <motion.button
                                    key={doc.documentId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    whileHover={{ y: -3, scale: 1.01 }}
                                    className="group rounded-2xl border border-[#EEE7FB] bg-gradient-to-b from-white to-[#FCFAFF] p-4 text-left shadow-[0_6px_18px_rgba(132,107,184,0.05)] transition hover:border-[#DCCBFA] hover:shadow-[0_10px_22px_rgba(132,107,184,0.10)]"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#8A72B8]">
                                            <FileText size={16} />
                                        </div>
                                        <ChevronRight
                                            size={14}
                                            className="mt-1 text-[#C5B6E6] transition group-hover:translate-x-0.5 group-hover:text-[#9F86D8]"
                                        />
                                    </div>

                                    <div className="truncate text-sm font-bold text-slate-800">
                                        {doc.title || "문서"}
                                    </div>

                                    <div className="mt-2 text-[11px] text-[#9A93AD]">
                                        {new Date(doc.createdAt).toLocaleDateString()}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}