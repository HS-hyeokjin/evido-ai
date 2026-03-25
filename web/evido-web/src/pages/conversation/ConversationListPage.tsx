import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { motion } from "framer-motion";
import {
    MessageSquareText,
    Plus,
    UploadCloud,
    FileText
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
                api.get(`/api/workspaces/${workspaceId}/conversations`),
                api.get(`/api/documents?page=0&size=5`)
            ]);

            setConversations(conversationRes.data);
            setDocuments(docRes.data.content || []);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateConversation = async () => {
        const res = await api.post(`/api/workspaces/${workspaceId}/conversations`);
        navigate(`/workspace/${workspaceId}/conversation/${res.data.id}`);
    };

    return (
        <div className="space-y-10">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">
                        워크스페이스
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        대화와 문서를 관리하고 AI와 협업하세요
                    </p>
                </div>

                <button
                    onClick={handleCreateConversation}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl shadow-sm hover:bg-primary-700 hover:shadow-md transition"
                >
                    <Plus size={16}/> 새 대화
                </button>
            </div>

            <div className="space-y-4">

                <div className="flex items-center justify-between">
                    <div className="text-lg font-black flex items-center gap-2">
                        <FileText size={18}/> 문서
                    </div>

                    <button
                        onClick={() =>
                            navigate(`/workspace/${workspaceId}/documents/upload`)
                        }
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 transition"
                    >
                        <UploadCloud size={14}/> 업로드
                    </button>
                </div>

                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 border rounded-xl bg-slate-50">
                        <FileText size={30} className="text-slate-300 mb-2"/>
                        <div className="text-sm text-slate-400">
                            아직 업로드된 문서가 없습니다
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map(doc => (
                            <motion.div
                                key={doc.documentId}
                                whileHover={{ y: -4 }}
                                className="p-4 rounded-xl border bg-white hover:shadow-md transition cursor-pointer"
                            >
                                <div className="font-semibold truncate">
                                    {doc.title || "문서"}
                                </div>

                                <div className="text-xs text-slate-400 mt-2">
                                    {new Date(doc.createdAt).toLocaleDateString()}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-4">

                <div className="text-lg font-black flex items-center gap-2">
                    <MessageSquareText size={18}/> 대화
                </div>

                {loading ? (
                    <div className="text-slate-400">불러오는 중...</div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border rounded-2xl bg-gradient-to-b from-slate-50 to-white">

                        <MessageSquareText size={42} className="text-slate-300 mb-3"/>

                        <div className="text-slate-600 font-semibold">
                            아직 대화가 없습니다
                        </div>

                        <div className="text-sm text-slate-400 mt-1">
                            AI에게 첫 질문을 시작해보세요
                        </div>

                        <button
                            onClick={handleCreateConversation}
                            className="mt-5 px-5 py-2.5 bg-primary-600 text-white rounded-xl shadow hover:bg-primary-700 transition"
                        >
                            첫 대화 시작하기
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                        {conversations.map(conversation => (
                            <motion.div
                                key={conversation.id}
                                whileHover={{ y: -5, scale: 1.02 }}
                                onClick={() =>
                                    navigate(`/workspace/${workspaceId}/conversation/${conversation.id}`)
                                }
                                className="cursor-pointer p-5 rounded-2xl border bg-white hover:shadow-lg hover:border-primary-300 transition"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <MessageSquareText size={16}/>
                                    <div className="font-semibold truncate">
                                        {conversation.title || "제목 없음"}
                                    </div>
                                </div>

                                <div className="text-xs text-slate-400">
                                    {new Date(conversation.createdAt).toLocaleString()}
                                </div>
                            </motion.div>
                        ))}

                    </div>
                )}
            </div>
        </div>
    );
}