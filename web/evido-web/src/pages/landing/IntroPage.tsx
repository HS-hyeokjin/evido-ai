import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const PREVIEW_IMAGE = "/evido-preview.png";

const POINTS = ["문서 기반 답변", "실시간 스트리밍 응답", "근거 출처 확인"];

export default function IntroPage() {
    return (
        <main className="min-h-screen overflow-hidden bg-white text-slate-950">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_75%_20%,rgba(124,58,237,0.18),transparent_32%),radial-gradient(circle_at_18%_75%,rgba(99,102,241,0.12),transparent_30%)]" />

            <header className="relative z-10 border-b border-slate-100 bg-white/75 backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-8 lg:px-12 xl:px-16">
                    <Link
                        to="/intro"
                        className="text-3xl font-black tracking-tight text-slate-950"
                    >
                        evido
                    </Link>

                    <Link
                        to="/app"
                        className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700"
                    >
                        시작하기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </header>

            <section className="relative">
                <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1600px] grid-cols-1 items-center gap-16 px-8 py-12 lg:grid-cols-[minmax(460px,0.85fr)_minmax(720px,1.15fr)] lg:px-12 lg:py-0 xl:px-16">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-black text-violet-700">
                            <Sparkles className="h-4 w-4" />
                            문서 기반 AI 워크스페이스
                        </div>

                        <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-tight text-slate-950 md:text-6xl xl:text-7xl">
                            문서를 이해하고,
                            <br />
                            <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                                바로 답을 찾는 AI
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 xl:text-xl xl:leading-9">
                            EVIDO는 문서를 업로드하고 질문하면 AI가 관련 근거를 찾아
                            실시간으로 답변하는 RAG 기반 문서 AI 서비스입니다.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                to="/app"
                                className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700"
                            >
                                시작하기
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="mt-9 flex flex-wrap gap-3">
                            {POINTS.map((point) => (
                                <div
                                    key={point}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-violet-600" />
                                    {point}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-200/50 blur-3xl" />
                        <div className="absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-indigo-200/50 blur-3xl" />

                        <div className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-white/90 p-3 shadow-[0_35px_110px_rgba(79,70,229,0.16)] backdrop-blur">
                            <img
                                src={PREVIEW_IMAGE}
                                alt="EVIDO 문서 기반 AI 서비스 화면"
                                className="h-auto w-full rounded-[32px] object-cover lg:min-w-[680px]"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}