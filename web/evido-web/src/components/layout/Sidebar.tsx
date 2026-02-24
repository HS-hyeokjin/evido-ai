import { NavLink } from "react-router-dom";
import Logo from "../../assets/Logo1.png";
import useAuth from "../../hooks/useAuth";
import api from "../../api/client";
import { LayoutDashboard, Upload, MessageSquareText, Settings, HelpCircle, LogOut } from "lucide-react";
import {useEffect} from "react";

const linkBase = "group relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition";
const linkInactive = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";
const linkActive = "bg-primary-50 text-primary-700 before:absolute before:left-0 before:top-2 before:h-6 before:w-1 before:rounded-r-md before:bg-primary-600";

export default function Sidebar() {

    const { user, loading } = useAuth();
    useEffect(() => {
        console.log("user:", user);
    }, [user]);
    const isUser = user?.role === "ROLE_USER";
    const isGuest = user?.role === "ROLE_GUEST";
    const canUpload = user?.role === "ROLE_USER" || user?.role === "ROLE_GUEST";

    const handleLogout = async () => {
        try {
            await api.post("/api/auth/logout");
            window.location.reload();
        } catch (e) {
            console.error("로그아웃 실패", e);
        }
    };

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white p-4">
            <div className="mb-4">
                <div className="flex items-center gap-3">
                    <img
                        src={Logo}
                        alt="EVIDO Logo"
                        className="h-10 w-10 object-contain"
                    />
                    <div className="leading-tight">
                        <div className="flex items-baseline gap-1">
                            <span className="font-brand text-2xl font-extrabold tracking-tight text-primary-600">
                                EVIDO
                            </span>
                            <span className="text-sm font-semibold text-slate-400">AI</span>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-slate-400">
                            문서 기반 지식 엔진
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-3 border-t border-slate-200" />

            <nav className="space-y-1">
                <p className="px-3 pb-1 text-[11px] font-extrabold tracking-wider text-slate-400">
                    MAIN
                </p>

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `${linkBase} ${isActive ? linkActive : linkInactive}`
                    }
                >
                    <LayoutDashboard size={16} />
                    <span>대시보드</span>
                </NavLink>

                {canUpload && (
                    <NavLink
                        to="/documents/upload"
                        className={({ isActive }) =>
                            `${linkBase} ${isActive ? linkActive : linkInactive}`
                        }
                    >
                        <Upload size={16} />
                        <span>문서 업로드</span>
                    </NavLink>
                )}

                <NavLink
                    to="/ask"
                    className={({ isActive }) =>
                        `${linkBase} ${isActive ? linkActive : linkInactive}`
                    }
                >
                    <MessageSquareText size={16} />
                    <span>Chat</span>
                </NavLink>

                <div className="my-3 border-t border-slate-200" />

                <p className="px-3 pb-1 text-[11px] font-extrabold tracking-wider text-slate-400">
                    SUPPORT
                </p>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `${linkBase} ${isActive ? linkActive : linkInactive}`
                    }
                >
                    <Settings size={16} />
                    <span>설정</span>
                </NavLink>

                <NavLink
                    to="/help"
                    className={({ isActive }) =>
                        `${linkBase} ${isActive ? linkActive : linkInactive}`
                    }
                >
                    <HelpCircle size={16} />
                    <span>도움말</span>
                </NavLink>
            </nav>

            <div className="mt-auto pt-4">
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-4 shadow-sm">

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
                                    <div className="text-[11px] text-slate-500">
                                        일반 사용자
                                    </div>
                                </div>

                                <div className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600">
                                    ONLINE
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700 active:scale-[0.98]"
                            >
                                <LogOut size={14} />
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
                                href="http://localhost:8080/oauth2/authorization/google"
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