export default function AppLoading() {
    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-violet-50 via-white to-slate-100">
            <main className="flex flex-1 items-center justify-center px-6 py-6">
                <div className="w-full max-w-2xl">
                    <div className="rounded-[28px] border border-white/60 bg-white/80 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                                <div className="absolute h-20 w-20 rounded-full bg-violet-100 blur-xl" />
                                <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                EVIDO 준비 중입니다
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                인증 정보와 워크스페이스를 확인하고
                                <br />
                                대화 화면을 불러오고 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}