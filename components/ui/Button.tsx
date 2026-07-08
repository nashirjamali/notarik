"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "stroke" | "white" | "stroke-red";
type Size = "default" | "small";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl text-center transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  default: "h-12 px-5 text-button-1",
  small: "h-10 rounded-lg px-4 text-button-2",
};

const variants: Record<Variant, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600",
  stroke:
    "bg-transparent text-neutral-900 shadow-stroke hover:shadow-[inset_0_0_0_2px_var(--color-neutral-900)] dark:text-white",
  white:
    "bg-neutral-50 text-neutral-900 shadow-stroke hover:bg-white hover:shadow-[inset_0_0_0_2px_var(--color-neutral-900)]",
  "stroke-red":
    "bg-transparent text-danger-500 shadow-stroke hover:bg-danger-500 hover:text-white hover:shadow-[inset_0_0_0_2px_var(--color-danger-500)]",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "default",
  iconLeft,
  iconRight,
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
