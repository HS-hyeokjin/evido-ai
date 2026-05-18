import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "../../assets/Logo1.png";
import useAuth from "../../hooks/useAuth";
import api from "../../api/client";
import {
    LayoutDashboard,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    MoreHorizontal,
    Trash2,
    Pencil,
    Plus,
    MessageSquarePlus,
} from "lucide-react";
import type { Workspace } from "../../types/Workspace";
import type { Conversation } from "../../types/Conversation";
import TextInputModal from "../common/TextInputModal";
import ConfirmModal from "../common/ConfirmModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type InputModalState =
    | { open: false }
    | {
    open: true;
    mode: "createWorkspace" | "renameWorkspace" | "renameConversation";
    title: string;
    description?: string;
    placeholder?: string;
    submitText?: string;
    initialValue?: string;
    workspace?: Workspace;
    conversation?: Conversation;
};

type ConfirmModalState =
    | { open: false }
    | {
    open: true;
    mode: "deleteWorkspace" | "deleteConversation";
    title: string;
    description?: string;
    confirmText?: string;
    workspace?: Workspace;
    conversation?: Conversation;
};

export default function Sidebar() {
    const navigate = useNavigate();
    const { workspaceId, conversationId } = useParams();
    const { user, loading } = useAuth();

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [wsOpen, setWsOpen] = useState(true);

    const [workspaceMenuOpenId, setWorkspaceMenuOpenId] = useState<number | null>(null);
    const [conversationMenuOpenId, setConversationMenuOpenId] = useState<string | null>(null);

    const [inputModal, setInputModal] = useState<InputModalState>({ open: false });
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ open: false });
    const [modalLoading, setModalLoading] = useState(false);

    const isUser = user?.role === "ROLE_USER";
    const isGuest = user?.role === "ROLE_GUEST";

    const closeAllMenus = () => {
        setWorkspaceMenuOpenId(null);
        setConversationMenuOpenId(null);
    };

    const fetchWorkspaces = async (): Promise<Workspace[]> => {
        const res = await api.get("/api/workspaces");
        setWorkspaces(res.data);
        return res.data;
    };

    const fetchConversations = async (wsId: string): Promise<Conversation[]> => {
        const res = await api.get(`/api/conversations/${wsId}/conversations`);
        setConversations(res.data);
        return res.data;
    };

    const moveToWorkspace = (wsId: number | string) => {
        navigate(`/workspace/${wsId}`);
    };

    useEffect(() => {
        void fetchWorkspaces();
    }, []);

    useEffect(() => {
        if (workspaceId) {
            void fetchConversations(workspaceId);
        } else {
            setConversations([]);
        }
    }, [workspaceId]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest("[data-sidebar-menu]")) {
                closeAllMenus();
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const openCreateWorkspaceModal = () => {
        closeAllMenus();
        setInputModal({
            open: true,
            mode: "createWorkspace",
            title: "새 워크스페이스 만들기",
            placeholder: "예: 프로젝트 A",
            submitText: "생성",
            initialValue: "",
        });
    };

    const openRenameWorkspaceModal = (ws: Workspace) => {
        closeAllMenus();
        setInputModal({
            open: true,
            mode: "renameWorkspace",
            title: "워크스페이스 이름 변경",
            placeholder: "워크스페이스 이름",
            submitText: "변경",
            initialValue: ws.name,
            workspace: ws,
        });
    };

    const openRenameConversationModal = (conversation: Conversation) => {
        closeAllMenus();
        setInputModal({
            open: true,
            mode: "renameConversation",
            title: "대화 이름 변경",
            placeholder: "대화 이름",
            submitText: "변경",
            initialValue: conversation.title || "",
            conversation,
        });
    };

    const openDeleteWorkspaceModal = (ws: Workspace) => {
        closeAllMenus();
        setConfirmModal({
            open: true,
            mode: "deleteWorkspace",
            title: "워크스페이스를 삭제할까요?",
            description: `'${ws.name}' 워크스페이스를 삭제하면 대화와 문서도 같이 삭제됩니다.`,
            confirmText: "삭제",
            workspace: ws,
        });
    };

    const openDeleteConversationModal = (conversation: Conversation) => {
        closeAllMenus();
        setConfirmModal({
            open: true,
            mode: "deleteConversation",
            title: "대화를 삭제할까요?",
            description: `'${conversation.title || "제목 없음"}' 대화를 삭제하면 되돌릴 수 없어.`,
            confirmText: "삭제",
            conversation,
        });
    };

    const handleInputModalSubmit = async (value: string) => {
        if (!inputModal.open) return;

        try {
            setModalLoading(true);

            if (inputModal.mode === "createWorkspace") {
                const res = await api.post("/api/workspaces", { name: value });
                const createdWorkspaceId = res.data?.id;

                await fetchWorkspaces();
                setInputModal({ open: false });

                if (createdWorkspaceId) {
                    await moveToWorkspace(createdWorkspaceId);
                }
                return;
            }

            if (inputModal.mode === "renameWorkspace" && inputModal.workspace) {
                await api.patch(`/api/workspaces/${inputModal.workspace.id}`, {
                    name: value,
                });

                setWorkspaces((prev) =>
                    prev.map((item) =>
                        item.id === inputModal.workspace!.id ? { ...item, name: value } : item
                    )
                );

                setInputModal({ open: false });
                return;
            }

            if (inputModal.mode === "renameConversation" && inputModal.conversation) {
                await api.patch(`/api/conversations/${inputModal.conversation.id}`, {
                    title: value,
                });

                setConversations((prev) =>
                    prev.map((item) =>
                        item.id === inputModal.conversation!.id ? { ...item, title: value } : item
                    )
                );

                setInputModal({ open: false });
            }
        } catch (error) {
            console.error(error);
            alert("요청 처리에 실패했습니다.");
        } finally {
            setModalLoading(false);
        }
    };

    const handleConfirmModalSubmit = async () => {
        if (!confirmModal.open) return;

        try {
            setModalLoading(true);

            if (confirmModal.mode === "deleteConversation" && confirmModal.conversation) {
                const targetConversationId = confirmModal.conversation.id;

                await api.delete(`/api/conversations/${targetConversationId}`);

                const nextConversations = conversations.filter(
                    (item) => item.id !== targetConversationId
                );
                setConversations(nextConversations);
                setConfirmModal({ open: false });

                const isCurrentConversation = String(targetConversationId) === conversationId;

                if (isCurrentConversation) {
                    if (nextConversations.length > 0 && workspaceId) {
                        navigate(
                            `/workspace/${workspaceId}/conversation/${nextConversations[0].id}`
                        );
                    } else if (workspaceId) {
                        navigate(`/workspace/${workspaceId}`);
                    }
                }

                return;
            }

            if (confirmModal.mode === "deleteWorkspace" && confirmModal.workspace) {
                const targetWorkspaceId = confirmModal.workspace.id;

                await api.delete(`/api/workspaces/${targetWorkspaceId}`);

                const remaining = workspaces.filter((item) => item.id !== targetWorkspaceId);
                setWorkspaces(remaining);
                setConfirmModal({ open: false });

                const isCurrentWorkspace = String(targetWorkspaceId) === workspaceId;

                if (!isCurrentWorkspace) {
                    return;
                }

                if (remaining.length > 0) {
                    await moveToWorkspace(remaining[0].id);
                    return;
                }

                const initRes = await api.get("/api/workspaces/init");
                const initWorkspaceId = initRes.data?.workspaceId;
                const initConversationId = initRes.data?.conversationId ?? initRes.data?.chatId;

                await fetchWorkspaces();

                if (initWorkspaceId && initConversationId) {
                    navigate(`/workspace/${initWorkspaceId}/conversation/${initConversationId}`);
                    return;
                }

                if (initWorkspaceId) {
                    navigate(`/workspace/${initWorkspaceId}`);
                    return;
                }

                navigate("/");
            }
        } catch (error) {
            console.error(error);
            alert("삭제 처리에 실패했습니다.");
        } finally {
            setModalLoading(false);
        }
    };

    const createConversation = async () => {
        if (!workspaceId) return;

        try {
            const res = await api.post(`/api/conversations/${workspaceId}/conversations`);
            const createdConversationId = res.data?.id;

            const nextConversations = await fetchConversations(workspaceId);

            if (createdConversationId) {
                navigate(`/workspace/${workspaceId}/conversation/${createdConversationId}`);
                return;
            }

            if (nextConversations.length > 0) {
                navigate(`/workspace/${workspaceId}/conversation/${nextConversations[0].id}`);
            }
        } catch (error) {
            console.error(error);
            alert("대화 생성에 실패했습니다.");
        }
    };

    const handleLogout = async () => {
        await api.post("/api/auth/logout");
        window.location.reload();
    };

    return (
        <>
            <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 py-5">
                <div
                    onClick={() => navigate("/")}
                    className="group mb-4 flex cursor-pointer items-center gap-3"
                >
                    <img
                        src={Logo}
                        className="h-11 w-11 transition group-hover:scale-105"
                        alt="EVIDO Logo"
                    />

                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold tracking-tight text-primary-600">
                                EVIDO
                            </span>
                            <span className="text-sm text-slate-400">AI</span>
                        </div>
                        <div className="text-xs text-slate-400">문서 기반 지식 엔진</div>
                    </div>
                </div>

                <div className="mb-3 border-t border-slate-200" />

                <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                    MAIN
                </p>

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                            isActive
                                ? "bg-primary-100 text-primary-700 shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`
                    }
                >
                    <LayoutDashboard size={16} />
                    대시보드
                </NavLink>

                <div className="mt-4">
                    <div className="flex items-center justify-between px-1">
                        <button
                            type="button"
                            onClick={() => setWsOpen((prev) => !prev)}
                            className="flex flex-1 items-center justify-between rounded-lg px-2 py-2 text-[11px] font-bold text-slate-400 transition hover:bg-slate-100"
                        >
                            WORKSPACES
                            {wsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        <button
                            type="button"
                            onClick={openCreateWorkspaceModal}
                            className="ml-1 rounded-lg p-2 text-slate-400 transition hover:bg-primary-50 hover:text-primary-600"
                            title="워크스페이스 생성"
                        >
                            <Plus size={15} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {wsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-1 space-y-1"
                            >
                                {workspaces.map((ws) => {
                                    const isActiveWorkspace = String(ws.id) === workspaceId;

                                    return (
                                        <div
                                            key={ws.id}
                                            className="group relative flex items-center gap-2"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => void moveToWorkspace(ws.id)}
                                                className={`flex min-w-0 flex-1 items-center rounded-2xl px-3 py-2.5 text-sm transition ${
                                                    isActiveWorkspace
                                                        ? "bg-primary-100 text-primary-700 shadow-sm"
                                                        : "text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                                                }`}
                                            >
                                                <span className="flex min-w-0 items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-primary-500" />
                                                    <span className="truncate">{ws.name}</span>
                                                </span>
                                            </button>

                                            <div
                                                data-sidebar-menu
                                                className="relative flex shrink-0 items-center"
                                            >
                                                <button
                                                    type="button"
                                                    data-sidebar-menu
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConversationMenuOpenId(null);
                                                        setWorkspaceMenuOpenId((prev) =>
                                                            prev === ws.id ? null : ws.id
                                                        );
                                                    }}
                                                    className={`rounded-lg p-1.5 transition ${
                                                        workspaceMenuOpenId === ws.id
                                                            ? "bg-white text-slate-700 shadow-sm"
                                                            : "text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-slate-700"
                                                    }`}
                                                >
                                                    <MoreHorizontal size={14} />
                                                </button>

                                                <AnimatePresence>
                                                    {workspaceMenuOpenId === ws.id && (
                                                        <motion.div
                                                            data-sidebar-menu
                                                            initial={{
                                                                opacity: 0,
                                                                scale: 0.95,
                                                                y: -4,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                scale: 1,
                                                                y: 0,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                scale: 0.95,
                                                                y: -4,
                                                            }}
                                                            className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openRenameWorkspaceModal(ws)
                                                                }
                                                                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                            >
                                                                <Pencil size={14} />
                                                                이름 변경
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDeleteWorkspaceModal(ws)
                                                                }
                                                                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50"
                                                            >
                                                                <Trash2 size={14} />
                                                                삭제
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {workspaceId && (
                    <div className="mt-6 flex-1 overflow-y-auto pr-1">
                        <div className="mb-2 flex items-center justify-between px-1">
                            <p className="px-2 text-[11px] font-bold text-slate-400">대화</p>

                            <button
                                type="button"
                                onClick={createConversation}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-primary-50 hover:text-primary-600"
                                title="새 대화"
                            >
                                <MessageSquarePlus size={15} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            {conversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    className="group relative flex items-center gap-2"
                                >
                                    <NavLink
                                        to={`/workspace/${workspaceId}/conversation/${conversation.id}`}
                                        className={({ isActive }) =>
                                            `flex min-w-0 flex-1 items-center rounded-2xl px-3 py-2.5 text-sm transition ${
                                                isActive
                                                    ? "bg-primary-100 text-primary-700 shadow-sm"
                                                    : "text-slate-700 hover:bg-slate-100"
                                            }`
                                        }
                                    >
                                        <span className="truncate">
                                            {conversation.title || "제목 없음"}
                                        </span>
                                    </NavLink>

                                    <div
                                        data-sidebar-menu
                                        className="relative flex shrink-0 items-center"
                                    >
                                        <button
                                            type="button"
                                            data-sidebar-menu
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setWorkspaceMenuOpenId(null);
                                                setConversationMenuOpenId((prev) =>
                                                    prev === conversation.id
                                                        ? null
                                                        : conversation.id
                                                );
                                            }}
                                            className={`rounded-lg p-1.5 transition ${
                                                conversationMenuOpenId === conversation.id
                                                    ? "bg-white text-slate-700 shadow-sm"
                                                    : "text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-slate-700"
                                            }`}
                                        >
                                            <MoreHorizontal size={14} />
                                        </button>

                                        <AnimatePresence>
                                            {conversationMenuOpenId === conversation.id && (
                                                <motion.div
                                                    data-sidebar-menu
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.95,
                                                        y: -4,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.95,
                                                        y: -4,
                                                    }}
                                                    className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openRenameConversationModal(
                                                                conversation
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <Pencil size={14} />
                                                        이름 변경
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openDeleteConversationModal(
                                                                conversation
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} />
                                                        삭제
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4">
                    <div className="space-y-1 bg-white/60 p-2">

                        <NavLink
                            to="/help"
                            className={({ isActive }) =>
                                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                                    isActive
                                        ? "bg-primary-100 text-primary-700"
                                        : "text-slate-700 hover:bg-slate-100"
                                }`
                            }
                        >
                            <HelpCircle size={16} />
                            도움말
                        </NavLink>
                    </div>

                    <div className="rounded-2xl border bg-white/80 px-4 py-4 shadow-md backdrop-blur">
                        {loading ? (
                            <div className="animate-pulse text-xs text-slate-400">
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

                                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="mt-4 w-full rounded-xl bg-red-500 py-2 text-xs font-bold text-white transition hover:bg-red-600"
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

            <TextInputModal
                open={inputModal.open}
                title={inputModal.open ? inputModal.title : ""}
                description={inputModal.open ? inputModal.description : undefined}
                placeholder={inputModal.open ? inputModal.placeholder : undefined}
                submitText={inputModal.open ? inputModal.submitText : undefined}
                initialValue={inputModal.open ? inputModal.initialValue : ""}
                loading={modalLoading}
                onClose={() => {
                    if (modalLoading) return;
                    setInputModal({ open: false });
                }}
                onSubmit={handleInputModalSubmit}
            />

            <ConfirmModal
                open={confirmModal.open}
                title={confirmModal.open ? confirmModal.title : ""}
                description={confirmModal.open ? confirmModal.description : undefined}
                confirmText={confirmModal.open ? confirmModal.confirmText : undefined}
                loading={modalLoading}
                onClose={() => {
                    if (modalLoading) return;
                    setConfirmModal({ open: false });
                }}
                onConfirm={handleConfirmModalSubmit}
            />
        </>
    );
}