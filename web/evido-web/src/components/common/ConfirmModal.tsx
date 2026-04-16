import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

export default function ConfirmModal({
    open,
    title,
    description,
    confirmText = "삭제",
    cancelText = "취소",
    danger = true,
    loading = false,
    onClose,
    onConfirm,
}: ConfirmModalProps) {
    const confirmButtonClass = danger
        ? "bg-red-500 hover:bg-red-600"
        : "bg-primary-600 hover:bg-primary-700";

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
                            <div className="flex gap-3">
                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                                    <AlertTriangle size={18} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                                    {description && (
                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                            {description}
                                        </p>
                                    )}
                                </div>
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

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {cancelText}
                            </button>

                            <button
                                onClick={() => void onConfirm()}
                                disabled={loading}
                                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${confirmButtonClass}`}
                            >
                                {loading ? "처리 중..." : confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}