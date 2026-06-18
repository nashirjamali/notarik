"use client";

import { useEffect } from "react";
import { CheckIcon } from "./icons";

type Props = {
  message: string;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [onDismiss, message]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="toast pointer-events-none fixed inset-x-0 bottom-5 z-[var(--z-toast)] flex justify-center px-4"
    >
      <div className="pointer-events-auto inline-flex items-center gap-2.5 rounded-full border border-border bg-ink px-4 py-2.5 text-sm font-medium text-bg shadow-lg">
        <span className="grid size-5 place-items-center rounded-full bg-success text-bg">
          <CheckIcon size={14} />
        </span>
        {message}
      </div>
      <style>{`
        .toast > div { animation: toast-in 0.32s var(--ease-out-quint); }
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .toast > div { animation: none; }
        }
      `}</style>
    </div>
  );
}
