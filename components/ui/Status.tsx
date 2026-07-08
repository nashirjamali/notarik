import type { HTMLAttributes, ReactNode } from "react";

type Variant = "green" | "red" | "purple" | "blue" | "yellow";

const variants: Record<Variant, string> = {
  green: "bg-[#EAFAE5] text-success-500 dark:bg-success-500/15",
  red: "bg-[#FFE7E4] text-danger-500 dark:bg-danger-500/15",
  purple: "bg-accent-100 text-accent-500",
  blue: "bg-primary-100 text-primary-500",
  yellow: "bg-warning-100 text-neutral-900",
};

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

export function Status({ variant = "green", className = "", children, ...props }: Props) {
  return (
    <span
      className={`inline-block rounded-md px-2 text-caption-2 leading-6 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
