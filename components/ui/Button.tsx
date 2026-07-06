import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "lime" | "primary" | "secondary" | "ghost";
};

const variants = {
  lime: "bg-lime text-ink hover:bg-lime-hover",
  primary: "bg-primary text-primary-ink hover:bg-primary-hover",
  secondary:
    "border border-border-strong bg-bg text-ink hover:bg-surface-2",
  ghost: "text-ink hover:bg-surface-2",
};

export function Button({ variant = "lime", className = "", ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center cursor-pointer justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-extrabold outline-none transition-colors focus-visible:shadow-[0_0_0_3px_var(--color-primary-soft)] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
