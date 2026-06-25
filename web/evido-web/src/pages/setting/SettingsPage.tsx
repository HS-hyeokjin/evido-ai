import type { ReactNode } from "react";
import {
    Check,
    Loader2,
    Monitor,
    Moon,
    Palette,
    RefreshCcw,
    Save,
    Sparkles,
    Sun,
    User,
} from "lucide-react";

import { useUserSettings } from "../../hooks/useUserSettings";
import {
    answerStyleOptions,
    evidenceModeOptions,
    getAnswerStyleLabel,
    getEvidenceModeLabel,
    getThemeModeLabel,
    type ThemeMode,
} from "../../types/userSettings";

const themeOptions: {
    value: ThemeMode;
    label: string;
    description: string;
    icon: ReactNode;
}[] = [
    {
        value: "SYSTEM",
        label: "시스템 설정",
        description: "기기 설정에 맞춰 화면 테마를 적용합니다.",
        icon: <Monitor size={18} />,
    },
    {
        value: "LIGHT",
        label: "라이트 모드",
        description: "밝은 화면으로 EVIDO를 사용합니다.",
        icon: <Sun size={18} />,
    },
    {
        value: "DARK",
        label: "다크 모드",
        description: "어두운 화면으로 EVIDO를 사용합니다.",
        icon: <Moon size={18} />,
    },
];

export default function SettingsPage() {
    const {
        settings,
        saved,
        loading,
        saving,
        error,
        updateSetting,
        saveSettings,
        resetSettings,
    } = useUserSettings();

    const selectedAnswerStyleLabel = getAnswerStyleLabel(settings.answerStyle);
    const selectedEvidenceModeLabel = getEvidenceModeLabel(settings.evidenceMode);
    const selectedThemeLabel = getThemeModeLabel(settings.theme);

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-gradient-to-br from-primary-50 via-white to-slate-50 px-6 py-7">
                    <p className="text-sm font-bold text-primary-600">
                        사용자 설정
                    </p>

                    <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-950">
                                EVIDO 사용 환경을 설정하세요
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                답변 스타일, 근거 표시 방식, 화면 테마를 사용자에게 맞게 설정할 수 있습니다.
                                저장한 설정은 브라우저에 보관되어 새로고침 후에도 유지됩니다.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-primary-100 bg-white/80 px-4 py-3 shadow-sm">
                            <p className="text-xs font-bold text-slate-400">
                                현재 설정
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-800">
                                {selectedAnswerStyleLabel} · {selectedEvidenceModeLabel} · {selectedThemeLabel}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <SectionCard
                        icon={<User size={21} />}
                        title="프로필 설정"
                        description="서비스에서 표시될 기본 정보를 설정합니다."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-xs font-bold text-slate-500">
                                    표시 이름
                                </label>

                                <input
                                    value={settings.displayName}
                                    onChange={(event) =>
                                        updateSetting("displayName", event.target.value)
                                    }
                                    placeholder="표시 이름을 입력하세요"
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-300 focus:ring-4 focus:ring-primary-50"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500">
                                    이메일
                                </label>

                                <input
                                    value={settings.email}
                                    readOnly
                                    className="mt-2 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 outline-none"
                                />
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={<Sparkles size={21} />}
                        title="AI 답변 설정"
                        description="문서 기반 답변을 어떤 방식으로 받을지 설정합니다."
                    >
                        <div className="space-y-7">
                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500">
                                        답변 스타일
                                    </label>

                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                        {selectedAnswerStyleLabel}
                                    </span>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    {answerStyleOptions.map((option) => (
                                        <OptionCard
                                            key={option.value}
                                            selected={settings.answerStyle === option.value}
                                            label={option.label}
                                            badge={option.badge}
                                            description={option.description}
                                            example={option.example}
                                            onClick={() =>
                                                updateSetting("answerStyle", option.value)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500">
                                        근거 표시 방식
                                    </label>

                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                        {selectedEvidenceModeLabel}
                                    </span>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    {evidenceModeOptions.map((option) => (
                                        <OptionCard
                                            key={option.value}
                                            selected={settings.evidenceMode === option.value}
                                            label={option.label}
                                            badge={option.badge}
                                            description={option.description}
                                            example={option.example}
                                            onClick={() =>
                                                updateSetting("evidenceMode", option.value)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={<Palette size={21} />}
                        title="화면 설정"
                        description="EVIDO 화면 테마를 설정합니다."
                    >
                        <div className="grid gap-3 md:grid-cols-3">
                            {themeOptions.map((option) => (
                                <OptionCard
                                    key={option.value}
                                    selected={settings.theme === option.value}
                                    label={option.label}
                                    description={option.description}
                                    icon={option.icon}
                                    onClick={() =>
                                        updateSetting("theme", option.value)
                                    }
                                />
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <aside className="space-y-4">
                    <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-black text-slate-900">
                            설정 요약
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            저장한 설정은 현재 브라우저에 유지됩니다.
                        </p>

                        <div className="mt-5 space-y-3">
                            <SummaryItem
                                label="표시 이름"
                                value={settings.displayName || "미입력"}
                            />

                            <SummaryItem
                                label="답변 스타일"
                                value={selectedAnswerStyleLabel}
                            />

                            <SummaryItem
                                label="근거 표시"
                                value={selectedEvidenceModeLabel}
                            />

                            <SummaryItem
                                label="테마"
                                value={selectedThemeLabel}
                            />
                        </div>

                        {loading ? (
                            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                                <Loader2 size={16} className="animate-spin" />
                                설정을 불러오는 중입니다.
                            </div>
                        ) : error ? (
                            <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold leading-6 text-rose-700">
                                {error}
                            </div>
                        ) : saved ? (
                            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                                설정이 저장되었습니다.
                            </div>
                        ) : (
                            <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                                저장되지 않은 변경사항이 있습니다.
                            </div>
                        )}

                        <div className="mt-5 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={resetSettings}
                                disabled={loading || saving}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCcw size={15} />
                                초기화
                            </button>

                            <button
                                type="button"
                                onClick={() => void saveSettings()}
                                disabled={loading || saving || saved}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-primary-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                {saving ? "저장 중" : "저장"}
                            </button>
                        </div>

                    </div>
                </aside>
            </div>
        </div>
    );
}

function SectionCard({
                         icon,
                         title,
                         description,
                         children,
                     }: {
    icon: ReactNode;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                    {icon}
                </div>

                <div>
                    <h2 className="text-base font-black text-slate-900">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </section>
    );
}

function OptionCard({
                        selected,
                        label,
                        badge,
                        description,
                        example,
                        icon,
                        onClick,
                    }: {
    selected: boolean;
    label: string;
    badge?: string;
    description: string;
    example?: string;
    icon?: ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "group relative rounded-2xl border p-4 text-left transition",
                selected
                    ? "border-primary-300 bg-primary-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                    {icon ? (
                        <div
                            className={[
                                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                selected
                                    ? "bg-white text-primary-600"
                                    : "bg-slate-100 text-slate-500 group-hover:text-slate-700",
                            ].join(" ")}
                        >
                            {icon}
                        </div>
                    ) : null}

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <div
                                className={[
                                    "font-bold",
                                    selected ? "text-primary-700" : "text-slate-800",
                                ].join(" ")}
                            >
                                {label}
                            </div>

                            {badge ? (
                                <span
                                    className={[
                                        "rounded-full px-2 py-0.5 text-[11px] font-black",
                                        selected
                                            ? "bg-white text-primary-600"
                                            : "bg-slate-100 text-slate-500",
                                    ].join(" ")}
                                >
                                    {badge}
                                </span>
                            ) : null}
                        </div>

                        <p
                            className={[
                                "mt-1 text-sm leading-6",
                                selected ? "text-primary-700/80" : "text-slate-500",
                            ].join(" ")}
                        >
                            {description}
                        </p>

                        {example ? (
                            <p
                                className={[
                                    "mt-2 rounded-xl px-3 py-2 text-xs leading-5",
                                    selected
                                        ? "bg-white/80 text-primary-700"
                                        : "bg-slate-50 text-slate-400",
                                ].join(" ")}
                            >
                                {example}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div
                    className={[
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
                        selected
                            ? "border-primary-500 bg-primary-500 text-white"
                            : "border-slate-200 bg-white text-transparent",
                    ].join(" ")}
                >
                    <Check size={14} strokeWidth={3} />
                </div>
            </div>
        </button>
    );
}

function SummaryItem({
                         label,
                         value,
                     }: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-xs font-bold text-slate-400">
                {label}
            </span>

            <span className="text-sm font-black text-slate-800">
                {value}
            </span>
        </div>
    );
}