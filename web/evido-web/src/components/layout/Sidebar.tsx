import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../assets/Logo1.png";
import useAuth from "../../hooks/useAuth";
import api from "../../api/client";
import {
    LayoutDashboard,
    Settings,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    MoreHorizontal,
    Trash2,
    Pencil
} from "lucide-react";
import type { Workspace } from "../../types/Workspace.ts";
import type { Conversation } from "../../types/Conversation.ts";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Sidebar() {
    const navigate = useNavigate();
    const { workspaceId, conversationId } = useParams();
    const { user, loading } = useAuth();

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [wsOpen, setWsOpen] = useState(true);
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const isUser = user?.role === "ROLE_USER";
    const isGuest = user?.role === "ROLE_GUEST";

    const fetchWorkspaces = async () => {
        const res = await api.get("/api/workspaces");
        setWorkspaces(res.data);
    };

    const fetchConversations = async (wsId: string) => {
        const res = await api.get(`/api/conversations/${wsId}/conversations`);
        setConversations(res.data);
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    useEffect(() => {
        if (workspaceId) {
            fetchConversations(workspaceId);
        }
    }, [workspaceId, conversationId]);

    useEffect(() => {
        const handleClick = (e: any) => {
            if (!menuRef.current?.contains(e.target)) {
                setMenuOpenId(null);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const deleteConversation = async (id: number) => {
        await api.delete(`/api/conversations/${id}`);
        setConversations(prev => prev.filter(c => c.id !== id));
    };

    const handleLogout = async () => {
        await api.post("/api/auth/logout");
        window.location.reload();
    };

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 py-5">

            <div
                onClick={() => navigate("/")}
                className="flex items-center gap-3 mb-4 cursor-pointer group"
            >
                <img src={Logo} className="h-11 w-11 transition group-hover:scale-105"/>

                <div>
                    <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-primary-600 tracking-tight">
                    EVIDO
                </span>
                        <span className="text-sm text-slate-400">AI</span>
                    </div>
                    <div className="text-xs text-slate-400">
                        문서 기반 지식 엔진
                    </div>
                </div>
            </div>

            <div className="mb-3 border-t border-slate-200" />

            <p className="px-3 text-[11px] font-bold text-slate-400 mb-2 tracking-wider">
                MAIN
            </p>

            <NavLink
                to="/"
                className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition 
            ${isActive
                        ? "bg-primary-100 text-primary-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
                }
            >
                <LayoutDashboard size={16}/> 대시보드
            </NavLink>

            <div className="mt-3">
                <button
                    onClick={() => setWsOpen(!wsOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-bold text-slate-400"
                >
                    WORKSPACES
                    {wsOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                </button>

                <AnimatePresence>
                    {wsOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-1 mt-1"
                        >
                            {workspaces.map(ws => (
                                <div
                                    key={ws.id}
                                    onClick={() => navigate(`/workspace/${ws.id}`)}
                                    className="px-3 py-2 text-sm rounded-xl cursor-pointer transition flex items-center gap-2
                                       hover:bg-primary-50 hover:text-primary-700"
                                >
                                    <div className="w-2 h-2 bg-primary-500 rounded-full"/>
                                    {ws.name}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {workspaceId && (
                <div className="mt-6 flex-1 overflow-y-auto pr-1">
                    <p className="px-3 text-[11px] font-bold text-slate-400 mb-2">
                        대화
                    </p>

                    {conversations.map(c => (
                        <div key={c.id} className="relative group">

                            <NavLink
                                to={`/workspace/${workspaceId}/conversation/${c.id}`}
                                className={({ isActive }) =>
                                    `flex items-center justify-between px-3 py-2 rounded-xl text-sm transition
                            ${isActive
                                        ? "bg-primary-100 text-primary-700"
                                        : "hover:bg-slate-100 text-slate-700"}`
                                }
                            >
                        <span className="truncate">
                            {c.title || "제목 없음"}
                        </span>

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setMenuOpenId(c.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition"
                                >
                                    <MoreHorizontal size={14}/>
                                </button>
                            </NavLink>

                            <AnimatePresence>
                                {menuOpenId === c.id && (
                                    <motion.div
                                        ref={menuRef}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute right-2 top-9 w-36 bg-white border rounded-xl shadow-lg"
                                    >
                                        <button className="flex gap-2 px-3 py-2 w-full hover:bg-slate-100">
                                            <Pencil size={14}/> 이름 변경
                                        </button>
                                        <button
                                            onClick={() => deleteConversation(c.id)}
                                            className="flex gap-2 px-3 py-2 w-full text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 size={14}/> 삭제
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}


            <div className="mt-auto pt-4">

                <div className="bg-white/60  p-2 space-y-1">

                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                ${isActive
                                ? "bg-primary-100 text-primary-700"
                                : "hover:bg-slate-100 text-slate-700"}`
                        }
                    >
                        <Settings size={16}/> 설정
                    </NavLink>

                    <NavLink
                        to="/help"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                ${isActive
                                ? "bg-primary-100 text-primary-700"
                                : "hover:bg-slate-100 text-slate-700"}`
                        }
                    >
                        <HelpCircle size={16}/> 도움말
                    </NavLink>

                </div>

                <div className="rounded-2xl border bg-white/80 backdrop-blur px-4 py-4 shadow-md">

                    {loading ? (
                        <div className="text-xs text-slate-400 animate-pulse">
                            인증 확인 중...
                        </div>

                    ) : isUser ? (
                        <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-slate-800">
                                        {user.principal}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Premium User
                                    </div>
                                </div>

                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="mt-4 w-full rounded-xl bg-red-500 py-2 text-xs font-bold text-white hover:bg-red-600 transition"
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-sm font-bold text-slate-700">
                                {isGuest ? "Guest 사용자" : "비로그인"}
                            </div>

                            <div className="mt-1 text-[11px] text-slate-500">
                                Google 로그인으로 업그레이드
                            </div>

                            <a
                                href={`${API_BASE}/oauth2/authorization/google`}
                                className="mt-3 inline-block w-full rounded-xl bg-primary-500 px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-primary-600 active:scale-[0.98]"
                            >
                                Google 로그인
                            </a>
                        </>
                    )}
                </div>
            </div>

        </aside>
    );
}