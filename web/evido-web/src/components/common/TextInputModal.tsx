import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface TextInputModalProps {
    open: boolean;
    title: string;
    description?: string;
    placeholder?: string;
    submitText?: string;
    initialValue?: string;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void | Promise<void>;
}

export default function TextInputModal({
                                           open,
                                           title,
                                           description,
                                           placeholder = "이름을 입력하세요.",
                                           submitText = "확인",
                                           initialValue = "",
                                           loading = false,
                                           onClose,
                                           onSubmit,
                                       }: TextInputModalProps) {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (open) {
            setValue(initialValue);
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 0);
        }
    }, [open, initialValue]);

    const handleSubmit = async () => {
        const trimmed = value.trim();
        if (!trimmed || loading) return;
        await onSubmit(trimmed);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-[2px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={loading ? undefined : onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                                {description && (
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        {description}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="닫기"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div>
                            <input
                                ref={inputRef}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        void handleSubmit();
                                    }
                                }}
                                placeholder={placeholder}
                                disabled={loading}
                                maxLength={60}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-300 focus:bg-white focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                취소
                            </button>

                            <button
                                onClick={() => void handleSubmit()}
                                disabled={!value.trim() || loading}
                                className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "처리 중..." : submitText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}