import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    FileText,
    HelpCircle,
    Layers,
    Mail,
    MessageSquareText,
    Sparkles,
    UploadCloud,
} from "lucide-react";

type GuideCardProps = {
    icon: LucideIcon;
    title: string;
    desc: string;
};

type StepItemProps = {
    number: string;
    title: string;
    desc: string;
};


export default function HelpPage() {
    return (
        <div className="min-h-screen bg-white px-1 py-2 text-slate-800">
            <div className="mx-auto max-w-6xl space-y-6">
                <section className="relative overflow-hidden rounded-[22px] border border-[#EEE7FB] bg-gradient-to-br from-white via-[#FCFAFF] to-[#F7F2FF] p-5 shadow-[0_8px_24px_rgba(124,106,166,0.06)]">
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#EDE2FF]/60 blur-3xl" />
                    <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-[#F3ECFF] blur-3xl" />

                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E9DFFB] bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#8A72B8]">
                                <Sparkles size={12} />
                                EVIDO Guide
                            </div>

                            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                                도움말
                            </h1>

                            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#7B728D]">
                                워크스페이스를 만들고, 문서를 업로드하고, AI에게 질문하는 흐름을
                                한눈에 확인해보세요.
                            </p>
                        </div>

                        <a
                            href="mailto:youngurwls@gmail.com"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#BFA8F8] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_18px_rgba(191,168,248,0.28)] transition hover:-translate-y-0.5 hover:bg-[#B397F4]"
                        >
                            <Mail size={15} />
                            문의하기
                        </a>
                    </div>

                    <div className="relative mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        <MiniStatusCard
                            title="핵심 흐름"
                            value="3단계"
                            desc="워크스페이스 → 문서 → 대화"
                        />
                        <MiniStatusCard
                            title="문서 기반"
                            value="RAG"
                            desc="근거를 찾고 답변 생성"
                        />
                        <MiniStatusCard
                            title="문의"
                            value="Email"
                            desc="문제 발생 시 연락"
                        />
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <GuideCard
                        icon={Layers}
                        title="워크스페이스"
                        desc="프로젝트나 업무 단위로 문서와 대화를 분리해서 관리할 수 있습니다."
                    />

                    <GuideCard
                        icon={UploadCloud}
                        title="문서 업로드"
                        desc="PDF, TXT, MD 같은 문서를 업로드해 AI가 참고할 자료를 준비합니다."
                    />

                    <GuideCard
                        icon={MessageSquareText}
                        title="AI 대화"
                        desc="업로드한 문서를 기반으로 질문하고, 답변과 근거를 함께 확인합니다."
                    />
                </section>

                <section className="grid gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2 rounded-[22px] border border-[#F0E9FC] bg-white p-5 shadow-[0_8px_24px_rgba(100,90,140,0.04)]">
                        <SectionTitle
                            icon={BookOpen}
                            title="시작하기"
                            desc="처음 사용하는 경우 아래 순서대로 진행하면 됩니다."
                        />

                        <div className="mt-5 space-y-3">
                            <StepItem
                                number="1"
                                title="워크스페이스 생성"
                                desc="업무나 프로젝트 단위로 새 워크스페이스를 만듭니다."
                            />

                            <StepItem
                                number="2"
                                title="문서 업로드"
                                desc="AI가 참고할 문서를 워크스페이스 안에 업로드합니다."
                            />

                            <StepItem
                                number="3"
                                title="AI에게 질문"
                                desc="대화 화면에서 문서 내용에 대해 궁금한 점을 질문합니다."
                            />

                            <StepItem
                                number="4"
                                title="근거 확인"
                                desc="답변에 사용된 문서 근거를 확인해 답변의 출처를 검토합니다."
                            />
                        </div>
                    </div>

                    <div className="rounded-[22px] border border-[#F0E9FC] bg-white p-5 shadow-[0_8px_24px_rgba(100,90,140,0.04)]">
                        <SectionTitle
                            icon={CheckCircle2}
                            title="권장 사용 방식"
                            desc="답변 품질을 높이기 위한 팁입니다."
                        />

                        <div className="mt-5 space-y-2.5">
                            <Tip text="워크스페이스는 업무나 프로젝트별로 나누는 것이 좋습니다." />
                            <Tip text="문서 제목은 나중에 찾기 쉽게 명확하게 작성하세요." />
                            <Tip text="질문할 때 원하는 조건과 출력 형식을 함께 적어보세요." />
                            <Tip text="AI 답변은 근거 문서와 함께 확인하는 것을 권장합니다." />
                        </div>
                    </div>
                </section>

                <section className="rounded-[22px] border border-[#F0E9FC] bg-white p-5 shadow-[0_8px_24px_rgba(100,90,140,0.04)]">
                    <SectionTitle
                        icon={FileText}
                        title="지원 문서 형식"
                        desc="업로드한 문서는 텍스트 추출과 검색 과정을 거쳐 AI 답변에 활용됩니다."
                    />

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <FileTypeBadge title="PDF" desc="매뉴얼, 보고서" />
                        <FileTypeBadge title="TXT" desc="텍스트 문서" />
                        <FileTypeBadge title="MD" desc="Markdown 문서" />
                        <FileTypeBadge title="DOCX" desc="문서 파일" />
                    </div>
                </section>

                <section className="relative overflow-hidden rounded-[22px] border border-[#EEE7FB] bg-gradient-to-br from-white via-[#FCFAFF] to-[#F7F2FF] p-5 shadow-[0_8px_24px_rgba(124,106,166,0.06)]">
                    <div className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-[#EDE2FF]/70 blur-3xl" />

                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#8A72B8]">
                                    <HelpCircle size={18} />
                                </div>

                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        더 도움이 필요하신가요?
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 text-[#7B728D]">
                                        문제가 해결되지 않거나 기능 개선 의견이 있다면 문의해주세요.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 text-sm font-bold text-[#7C63B8]">
                                youngurwls@gmail.com
                            </div>
                        </div>

                        <a
                            href="mailto:youngurwls@gmail.com"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#BFA8F8] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_18px_rgba(191,168,248,0.28)] transition hover:-translate-y-0.5 hover:bg-[#B397F4]"
                        >
                            문의 메일 보내기
                            <ArrowRight size={15} />
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}

function MiniStatusCard({ title, value, desc }: { title: string; value: string; desc: string }) {
    return (
        <div className="rounded-xl border border-[#EEE7FB] bg-white/75 px-3.5 py-3 backdrop-blur">
            <div className="text-[11px] font-semibold text-[#9A8CB8]">
                {title}
            </div>
            <div className="mt-1 text-xl font-black text-slate-900">
                {value}
            </div>
            <div className="mt-1 text-[11px] text-[#9A93AD]">
                {desc}
            </div>
        </div>
    );
}

function SectionTitle({
                          icon: Icon,
                          title,
                          desc,
                      }: {
    icon: LucideIcon;
    title: string;
    desc: string;
}) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#8A72B8]">
                <Icon size={18} />
            </div>

            <div>
                <h2 className="text-base font-black text-slate-900">
                    {title}
                </h2>
                <p className="mt-0.5 text-xs leading-5 text-[#8B84A0]">
                    {desc}
                </p>
            </div>
        </div>
    );
}

function GuideCard({ icon: Icon, title, desc }: GuideCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            className="rounded-[22px] border border-[#EEE7FB] bg-gradient-to-b from-white to-[#FCFAFF] p-5 shadow-[0_6px_18px_rgba(132,107,184,0.05)] transition hover:border-[#DCCBFA] hover:shadow-[0_10px_22px_rgba(132,107,184,0.10)]"
        >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#8A72B8]">
                <Icon size={18} />
            </div>

            <div className="text-sm font-black text-slate-900">
                {title}
            </div>

            <p className="mt-2 text-xs leading-5 text-[#8B84A0]">
                {desc}
            </p>
        </motion.div>
    );
}

function StepItem({ number, title, desc }: StepItemProps) {
    return (
        <div className="flex gap-3 rounded-2xl border border-[#EEE7FB] bg-[#FCFAFF] p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#BFA8F8] text-sm font-black text-white shadow-[0_8px_14px_rgba(191,168,248,0.24)]">
                {number}
            </div>

            <div>
                <div className="text-sm font-black text-slate-800">
                    {title}
                </div>

                <p className="mt-1 text-xs leading-5 text-[#8B84A0]">
                    {desc}
                </p>
            </div>
        </div>
    );
}

function Tip({ text }: { text: string }) {
    return (
        <div className="flex gap-2.5 rounded-2xl border border-[#EEE7FB] bg-[#FCFAFF] p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8A72B8]" />
            <p className="text-xs leading-5 text-[#7B728D]">
                {text}
            </p>
        </div>
    );
}

function FileTypeBadge({ title, desc }: { title: string; desc: string }) {
    return (
        <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            className="rounded-2xl border border-[#EEE7FB] bg-gradient-to-b from-white to-[#FCFAFF] p-4 shadow-[0_6px_18px_rgba(132,107,184,0.04)]"
        >
            <div className="text-lg font-black text-slate-900">
                {title}
            </div>

            <div className="mt-1 text-xs text-[#9A93AD]">
                {desc}
            </div>
        </motion.div>
    );

}