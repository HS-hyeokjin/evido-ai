import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FCFAFF] px-4">
            <div className="w-full max-w-md rounded-[28px] border border-[#EEE7FB] bg-white p-8 text-center shadow-[0_12px_30px_rgba(124,106,166,0.08)]">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4EEFF] text-[#8A72B8]">
                    404
                </div>

                <h1 className="text-2xl font-black text-slate-900">
                    페이지를 찾을 수 없습니다
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#8B84A0]">
                    주소가 잘못되었거나, 더 이상 존재하지 않는 페이지입니다.
                </p>

                <div className="mt-6 flex gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E9DFFB] bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-[#FCFAFF]"
                    >
                        <ArrowLeft size={16} />
                        이전
                    </button>

                    <button
                        onClick={() => navigate("/dashboard")}
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