import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
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
        navigate(`/workspace/${workspaceId}/conversations/${res.data.id}`);
    };

    return (
        <div className="space-y-8">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">워크스페이스</h1>
                    <p className="text-sm text-slate-500">
                        대화와 문서를 관리하세요
                    </p>
                </div>

                <button
                    onClick={handleCreateConversation}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
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
                        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-slate-50"
                    >
                        <UploadCloud size={14}/> 업로드
                    </button>
                </div>

                {documents.length === 0 ? (
                    <div className="text-sm text-slate-400">
                        등록된 문서가 없습니다
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                        {documents.map(doc => (
                            <div
                                key={doc.documentId}
                                className="p-3 border rounded-lg text-sm bg-white hover:shadow-sm"
                            >
                                <div className="font-semibold truncate">
                                    {doc.title || "문서"}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {new Date(doc.createdAt).toLocaleDateString()}
                                </div>
                            </div>
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
                    <div className="flex flex-col items-center justify-center h-60 border rounded-xl">
                        <MessageSquareText size={40} className="text-slate-300 mb-2"/>
                        <div className="text-slate-500">대화가 없습니다</div>

                        <button
                            onClick={handleCreateConversation}
                            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                        >
                            첫 대화 시작하기
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {conversations.map(conversation => (
                            <div
                                key={conversation.id}
                                onClick={() =>
                                    navigate(`/workspace/${workspaceId}/conversation/${conversation.id}`)
                                }
                                className="cursor-pointer p-4 border rounded-xl hover:shadow-md hover:border-primary-300 transition"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquareText size={16}/>
                                    <div className="font-semibold truncate">
                                        {conversation.title || "새 대화"}
                                    </div>
                                </div>

                                <div className="text-xs text-slate-400">
                                    {new Date(conversation.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}