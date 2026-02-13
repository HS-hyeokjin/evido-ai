import React from "react";

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
      focus:border-primary-400 focus:ring-4 focus:ring-primary-100 ${props.className ?? ""}`}
        />
    );
}
