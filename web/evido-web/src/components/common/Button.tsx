import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost";
};

export default function Button({ variant = "primary", className = "", ...props }: Props) {
    const base =
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";

    const variants: Record<string, string> = {
        primary: "bg-primary-500 text-white hover:bg-primary-600 shadow-sm",
        ghost: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    };

    return <button {...props} className={`${base} ${variants[variant]} ${className}`} />;
}
