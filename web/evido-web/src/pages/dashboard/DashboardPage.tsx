import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import TextInputModal from "../../components/common/TextInputModal";
import api from "../../api/client";

import {
    BookOpen,
    ChevronRight,
    HelpCircle,
    Layers,
    MessageSquareText,
    Plus,
    Sparkles,
} from "lucide-react";

type GuideCardProps = {
    icon: LucideIcon;
    title: string;
    desc: string;
};

type ActionButtonProps = {
    icon: LucideIcon;
    title: string;
    desc: string;
    onClick: () => void;
    disabled?: boolean;
};

type StepItemProps = {
    number: string;
    title: string;
    desc: string;
};

export default function WorkspaceHomePage() {
    const navigate = useNavigate();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const openCreateWorkspaceModal = () => {
        setCreateModalOpen(true);
    };

    const handleCreateWorkspace = async (value: string) => {
        const name = value.trim();

        if (!name) {
            alert("워크스페이스 이름을 입력해주세요.");
            return;
        }

        try {
            setModalLoading(true);

            const res = await api.post("/api/workspaces", { name });
            const createdWorkspaceId = res.data?.id;

            setCreateModalOpen(false);

            if (createdWorkspaceId) {
                navigate(`/workspace/${createdWorkspaceId}`);
                return;
            }

            navigate("/");
        } catch (error) {
            console.error(error);
            alert("워크스페이스 생성에 실패했습니다.");
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-white px-1 py-2 text-slate-800">
                <div className="space-y-6">
                    <section className="relative overflow-hidden rounded-[22px] border border-[#EEE7FB] bg-gradient-to-br from-white via-[#FCFAFF] to-[#F7F2FF] p-5 shadow-[0_8px_24px_rgba(124,106,166,0.06)]">
                        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#EDE2FF]/60 blur-3xl" />
                        <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-[#F3ECFF] blur-3xl" />

                        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E9DFFB] bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#8A72B8]">
                                    <Sparkles size={12} />
                                    EVIDO Workspace
                                </div>

                                <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                                    새 워크스페이스를 만들고 AI 작업을 시작하세요
                                </h1>

                                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#7B728D]">
                                    워크스페이스는 문서, 대화, 설정을 프로젝트별로 나누어 관리하는 공간입니다.
                                    업무별 워크스페이스를 만들고 문서 기반 AI 작업을 시작해보세요.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={openCreateWorkspaceModal}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#BFA8F8] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_18px_rgba(191,168,248,0.28)] transition hover:-translate-y-0.5 hover:bg-[#B397F4]"
                            >
                                <Plus size={15} />
                                워크스페이스 생성
                            </button>
                        </div>

                        <div className="relative mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            <MiniStatusCard
                                title="STEP 1"
                                value="생성"
                                desc="업무 공간 만들기"
                            />
                            <MiniStatusCard
                                title="STEP 2"
                                value="정리"
                                desc="문서와 대화 모으기"
                            />
                            <MiniStatusCard
                                title="STEP 3"
                                value="질문"
                                desc="AI 지식 공간 활용"
                            />
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-3">
                        <GuideCard
                            icon={Layers}
                            title="1. 워크스페이스 생성"
                            desc="프로젝트, 업무, 팀 단위로 워크스페이스를 만들어 작업 공간을 분리합니다."
                        />

                        <GuideCard
                            icon={BookOpen}
                            title="2. 문서와 지식 정리"
                            desc="각 워크스페이스 안에서 필요한 문서와 대화를 모아 지식 공간을 구성합니다."
                        />

                        <GuideCard
                            icon={MessageSquareText}
                            title="3. AI 대화 시작"
                            desc="워크스페이스 안에서 문서 기반 질문을 하고 답변과 근거를 확인합니다."
                        />
                    </section>

                    <section className="grid gap-6 xl:grid-cols-3">
                        <div className="xl:col-span-2 rounded-[22px] border border-[#F0E9FC] bg-white p-5 shadow-[0_8px_24px_rgba(100,90,140,0.04)]">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#8A72B8]">
                                    <Plus size={18} />
                                </div>

                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        빠른 시작
                                    </h2>
                                    <p className="mt-0.5 text-xs leading-5 text-[#8B84A0]">
                                        현재 화면에서 바로 새 작업 공간을 만들거나 도움말로 이동할 수 있습니다.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                                <ActionButton
                                    icon={Plus}
                                    title="워크스페이스 생성"
                                    desc="새 프로젝트나 업무를 위한 작업 공간을 만듭니다."
                                    onClick={openCreateWorkspaceModal}
                                />

                                <ActionButton
                                    icon={HelpCircle}
                                    title="도움말"
                                    desc="EVIDO 사용 방법과 주요 기능을 확인하세요."
                                    onClick={() => navigate("/help")}
                                />
                            </div>
                        </div>

                        <div className="rounded-[22px] border border-[#F0E9FC] bg-white p-5 shadow-[0_8px_24px_rgba(100,90,140,0.04)]">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#8A72B8]">
                                    <Sparkles size={18} />
                                </div>

                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        추천 사용 순서
                                    </h2>
                                    <p className="mt-0.5 text-xs leading-5 text-[#8B84A0]">
                                        처음 사용하는 경우 아래 순서대로 진행하세요.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                <StepItem
                                    number="1"
                                    title="워크스페이스 만들기"
                                    desc="업무나 프로젝트 단위로 새 공간을 생성합니다."
                                />

                                <StepItem
                                    number="2"
                                    title="문서와 대화 관리"
                                    desc="생성한 워크스페이스 안에서 문서와 AI 대화를 관리합니다."
                                />

                                <StepItem
                                    number="3"
                                    title="AI 지식 공간 확장"
                                    desc="대화와 문서가 쌓이면 나중에 대시보드로 확장할 수 있습니다."
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <TextInputModal
                open={createModalOpen}
                title="새 워크스페이스 만들기"
                placeholder="예: EVIDO 프로젝트"
                submitText="생성"
                initialValue=""
                loading={modalLoading}
                onClose={() => {
                    if (modalLoading) return;
                    setCreateModalOpen(false);
                }}
                onSubmit={handleCreateWorkspace}
            />
        </>
    );
}

function MiniStatusCard({
                            title,
                            value,
                            desc,
                        }: {
    title: string;
    value: string;
    desc: string;
}) {
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

function ActionButton({
                          icon: Icon,
                          title,
                          desc,
                          onClick,
                          disabled = false,
                      }: ActionButtonProps) {
    return (
        <motion.button
            type="button"
            whileHover={disabled ? undefined : { y: -4, scale: 1.01 }}
            onClick={onClick}
            disabled={disabled}
            className="group rounded-2xl border border-[#EEE7FB] bg-gradient-to-b from-white to-[#FCFAFF] p-4 text-left shadow-[0_6px_18px_rgba(132,107,184,0.05)] transition hover:border-[#DCCBFA] hover:shadow-[0_10px_22px_rgba(132,107,184,0.10)] disabled:cursor-not-allowed disabled:opacity-50"
        >
            <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#8A72B8]">
                    <Icon size={17} />
                </div>

                <ChevronRight
                    size={14}
                    className="text-[#C5B6E6] transition group-hover:translate-x-0.5 group-hover:text-[#9F86D8]"
                />
            </div>

            <div className="text-sm font-black text-slate-800">
                {title}
            </div>

            <p className="mt-1 text-xs leading-5 text-[#8B84A0]">
                {desc}
            </p>
        </motion.button>
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