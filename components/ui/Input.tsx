import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  trailing?: ReactNode;
  variant?: "default" | "filled";
  uppercase?: boolean;
};

const activeWrapper =
  "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--color-primary-soft)]";

const activeField =
  "focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--color-primary-soft)]";

const variants = {
  default: "border border-border-strong bg-bg hover:bg-surface-2",
  filled: "border border-transparent bg-surface-2 hover:bg-border/40",
};

const fieldClass =
  "w-full bg-transparent text-sm font-extrabold text-ink outline-none placeholder:text-muted";

export function Input({
  icon,
  trailing,
  variant = "filled",
  uppercase = true,
  className = "",
  ...props
}: Props) {
  const placeholderClass = uppercase
    ? "placeholder:uppercase placeholder:tracking-wide"
    : "";

  const inputClass = `${fieldClass} ${placeholderClass}`;

  if (icon || trailing) {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3.5 transition-[border-color,box-shadow,background-color] ${variants[variant]} ${activeWrapper} ${className}`}
      >
        {icon}
        <input className={inputClass} autoCorrect="off" {...props} />
        {trailing}
      </div>
    );
  }

  return (
    <input
      className={`rounded-md px-3.5 py-2 outline-none transition-[border-color,box-shadow,background-color] ${variants[variant]} ${activeField} ${inputClass} ${className}`}
      autoCorrect="off"
      {...props}
    />
  );
}
