import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import Logo from "../../assets/Logo1.png";
import { Plus, MessageSquareText, Settings } from "lucide-react";

interface Workspace {
    id: number;
    name: string;
}

interface Chat {
    id: number;
    title: string;
}

export default function Sidebar() {
    const { workspaceId, chatId } = useParams();
    const navigate = useNavigate();

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    useEffect(() => {
        if (workspaceId) {
            fetchChats(workspaceId);
        }
    }, [workspaceId]);

    const fetchWorkspaces = async () => {
        const res = await api.get("/api/workspaces");
        setWorkspaces(res.data);
    };

    const fetchChats = async (workspaceId: string) => {
        const res = await api.get(`/api/workspaces/${workspaceId}/chats`);
        setChats(res.data);
    };

    const createWorkspace = async () => {
        const name = prompt("워크스페이스 이름");
        if (!name) return;

        const res = await api.post("/api/workspaces", { name });
        navigate(`/workspace/${res.data.id}/chat/default`);
    };

    const createChat = async () => {
        const res = await api.post(`/api/workspaces/${workspaceId}/chats`);
        navigate(`/workspace/${workspaceId}/chat/${res.data.id}`);
    };

    return (
        <aside className="w-64 border-r p-4 flex flex-col">

            <div className="flex items-center gap-2 mb-6">
                <img src={Logo} className="w-8 h-8" />
                <span className="font-bold text-lg text-primary-600">EVIDO</span>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">WORKSPACE</span>
                    <button onClick={createWorkspace}>
                        <Plus size={14} />
                    </button>
                </div>

                {workspaces.map(ws => (
                    <div
                        key={ws.id}
                        onClick={() => navigate(`/workspace/${ws.id}/chat/default`)}
                        className={`cursor-pointer px-2 py-1 rounded ${
                            ws.id.toString() === workspaceId ? "bg-slate-100" : ""
                        }`}
                    >
                        {ws.name}
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">CHATS</span>
                    <button onClick={createChat}>
                        <Plus size={14} />
                    </button>
                </div>

                {chats.map(chat => (
                    <NavLink
                        key={chat.id}
                        to={`/workspace/${workspaceId}/chat/${chat.id}`}
                        className={({ isActive }) =>
                            `block px-2 py-1 rounded ${
                                isActive ? "bg-primary-50 text-primary-600" : ""
                            }`
                        }
                    >
                        <MessageSquareText size={14} className="inline mr-1" />
                        {chat.title || "새 채팅"}
                    </NavLink>
                ))}
            </div>

            <NavLink
                to={`/workspace/${workspaceId}/settings`}
                className="mt-4 text-sm flex items-center gap-2"
            >
                <Settings size={14} />
                설정
            </NavLink>

        </aside>
    );
}