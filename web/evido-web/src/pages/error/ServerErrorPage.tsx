import { useNavigate } from "react-router-dom";
import { RefreshCw, Home } from "lucide-react";

export default function ServerErrorPage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FCFAFF] px-4">
            <div className="w-full max-w-md rounded-[28px] border border-[#EEE7FB] bg-white p-8 text-center shadow-[0_12px_30px_rgba(124,106,166,0.08)]">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1F2] text-rose-500">
                    500
                </div>

                <h1 className="text-2xl font-black text-slate-900">
                    서버 오류가 발생했습니다
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#8B84A0]">
                    일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
                </p>

                <div className="mt-6 flex gap-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E9DFFB] bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-[#FCFAFF]"
                    >
                        <RefreshCw size={16} />
                        새로고침
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#BFA8F8] px-4 py-3 text-sm font-bold text-white hover:bg-[#B397F4]"
                    >
                        <Home size={16} />
                        홈으로
                    </button>
                </div>
            </div>
        </div>
    );
}