import { useNavigate } from "react-router-dom";
import { Lock, Home } from "lucide-react";

export default function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FCFAFF] px-4">
            <div className="w-full max-w-md rounded-[28px] border border-[#EEE7FB] bg-white p-8 text-center shadow-[0_12px_30px_rgba(124,106,166,0.08)]">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4EEFF] text-[#8A72B8]">
                    <Lock size={24} />
                </div>

                <h1 className="text-2xl font-black text-slate-900">
                    접근 권한이 없습니다
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#8B84A0]">
                    이 워크스페이스 또는 페이지에 접근할 권한이 없습니다.
                </p>

                <button
                    onClick={() => navigate("/")}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#BFA8F8] px-4 py-3 text-sm font-bold text-white hover:bg-[#B397F4]"
                >
                    <Home size={16} />
                    홈으로 이동
                </button>
            </div>
        </div>
    );
}