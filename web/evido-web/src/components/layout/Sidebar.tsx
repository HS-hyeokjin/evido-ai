import { NavLink } from "react-router-dom";
import Logo from "../../assets/Logo1.png";

const linkBase = "block rounded-xl px-3 py-2 text-sm font-bold border transition";
const linkInactive = "border-slate-200 bg-white hover:bg-slate-50";
const linkActive = "border-transparent bg-primary-100 text-primary-700";

export default function Sidebar() {
    return (
        <aside className="w-64 border-r border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center gap-2 text-lg font-black">

                <img
                    src={Logo}
                    alt="EVIDO Logo"
                    className="h-10 w-10 object-contain"
                />

                <span className="font-brand text-primary-600 text-2xl font-extrabold"> EVIDO </span>
                <span className="text-slate-400"> · AI</span>
            </div>

            <nav className="space-y-2">
                <NavLink to="/" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    대시보드
                </NavLink>

                <NavLink to="/documents/upload" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    문서 업로드
                </NavLink>

                <NavLink to="/ask" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    질문/답변
                </NavLink>

                <NavLink to="/login" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    로그인
                </NavLink>
            </nav>
        </aside>
    );
}