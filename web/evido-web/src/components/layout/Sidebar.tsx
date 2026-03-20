import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import Logo from "../../assets/Logo1.png";
import api from "../../api/client";
import {
    LayoutDashboard,
    MessageSquareText,
    Settings,
    HelpCircle,
    LogOut,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

export default function Sidebar() {

    const navigate = useNavigate();
    const { workspaceId } = useParams();

    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [chats, setChats] = useState<any[]>([]);
    const [wsOpen, setWsOpen] = useState(true);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    useEffect(() => {
        if (workspaceId) fetchChats(workspaceId);
    }, [workspaceId]);

    const fetchWorkspaces = async () => {
        const res = await api.get("/api/workspaces");
        setWorkspaces(res.data);
    };

    const fetchChats = async (wsId: string) => {
        const res = await api.get(`/api/workspaces/${wsId}/chats`);
        setChats(res.data);
    };

    const handleWorkspaceClick = (wsId: number) => {
        setChats([]);
        navigate(`/workspace/${wsId}`);
    };
    return (
        <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-md p-4">

            {/* LOGO */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary-50">
                    <img src={Logo} className="h-6 w-6"/>
                </div>
                <div>
                    <div className="text-lg font-extrabold text-primary-600">EVIDO</div>
                    <div className="text-[11px] text-slate-400">AI Assistant</div>
                </div>
            </div>

            {/* DASHBOARD */}
            <NavLink
                to="/"
                end
                className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${
                        isActive
                            ? "bg-primary-50 text-primary-600 shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                    }`
                }
            >
                <LayoutDashboard size={16}/>
                대시보드
            </NavLink>

            {/* WORKSPACE */}
            <div className="mt-6">

                <button
                    onClick={() => setWsOpen(!wsOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-bold text-slate-400 tracking-wider"
                >
                    WORKSPACES
                    {wsOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                </button>

                {wsOpen && (
                    <div className="mt-2 space-y-1">
                        {workspaces.map(ws => (
                            <div
                                key={ws.id}
                                onClick={() => handleWorkspaceClick(ws.id)}
                                className={`group flex items-center px-3 py-2 rounded-lg text-sm cursor-pointer transition-all
                                ${
                                    ws.id.toString() === workspaceId
                                        ? "bg-primary-50 text-primary-600"
                                        : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                <div className="w-2 h-2 rounded-full bg-primary-400 mr-2 opacity-60 group-hover:opacity-100"/>
                                {ws.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CHATS */}
            {workspaceId && (
                <div className="mt-6">

                    <div className="px-3 text-[11px] text-slate-400 mb-2 font-bold tracking-wider">
                        CHATS
                    </div>

                    <div className="space-y-1">
                        {chats.map(chat => (
                            <NavLink
                                key={chat.id}
                                to={`/workspace/${workspaceId}/chat/${chat.id}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                                    ${
                                        isActive
                                            ? "bg-primary-50 text-primary-600"
                                            : "text-slate-600 hover:bg-slate-100"
                                    }`
                                }
                            >
                                <MessageSquareText size={14}/>
                                <span className="truncate">
                                    {chat.title || "새 채팅"}
                                </span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}

            {/* BOTTOM */}
            <div className="mt-auto pt-6 border-t border-slate-200 space-y-1">

                <NavLink
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                    <Settings size={14}/> 설정
                </NavLink>

                <NavLink
                    to="/help"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                    <HelpCircle size={14}/> 도움말
                </NavLink>

                <button
                    onClick={async () => {
                        await api.post("/api/auth/logout");
                        window.location.reload();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                    <LogOut size={14}/> 로그아웃
                </button>
            </div>
        </aside>
    );
}