import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={`w-full rounded-md border border-border-strong bg-bg px-3.5 py-2 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted hover:bg-surface-2 focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--color-primary-soft)] ${className}`}
      {...props}
    />
  );
}
