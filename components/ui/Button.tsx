import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "lime" | "primary" | "secondary" | "ghost" | "icon" | "icon-circle" | "profile" | "text";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  emphasis?: boolean;
};

const variants = {
  lime: "rounded-md bg-lime px-6 py-3.5 text-ink hover:bg-lime-hover",
  primary: "rounded-md bg-primary px-6 py-3.5 text-primary-ink hover:bg-primary-hover",
  secondary:
    "rounded-md border border-border-strong bg-bg px-6 py-3.5 text-ink hover:bg-surface-2",
  ghost: "rounded-md px-6 py-3.5 text-ink hover:bg-surface-2",
  icon: "rounded-md h-14 min-w-14 bg-surface-2 px-0 text-ink hover:bg-border",
  "icon-circle":
    "size-11 shrink-0 rounded-full border border-border-strong bg-bg p-0 text-muted hover:bg-surface-2 hover:text-ink",
  profile: "gap-2.5 rounded-full py-1 pl-1 pr-2 text-ink hover:bg-surface-2",
  text: "rounded-md bg-transparent px-0 py-0 text-sm font-extrabold",
};

export function Button({
  variant = "lime",
  icon,
  iconPosition = "left",
  emphasis = false,
  className = "",
  children,
  ...props
}: Props) {
  const textTone =
    variant === "text"
      ? emphasis
        ? "text-primary hover:text-primary-hover"
        : "text-muted hover:text-primary"
      : "";

  const labelWeight =
    variant === "text" || variant === "icon-circle" || variant === "profile"
      ? ""
      : "text-sm font-extrabold";

  const gap = variant === "icon-circle" ? "gap-0" : "gap-2";

  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center outline-none transition-colors focus-visible:shadow-[0_0_0_3px_var(--color-primary-soft)] disabled:pointer-events-none disabled:opacity-50 ${gap} ${variants[variant]} ${textTone} ${labelWeight} ${className}`}
      {...props}
    >
      {icon && iconPosition === "left" ? icon : null}
      {children}
      {icon && iconPosition === "right" ? icon : null}
    </button>
  );
}
