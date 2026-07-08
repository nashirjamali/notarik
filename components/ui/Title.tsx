import type { ReactNode } from "react";

type Variant = "blue" | "red" | "purple" | "yellow" | "green";

const bars: Record<Variant, string> = {
  blue: "before:bg-primary-100",
  red: "before:bg-danger-100",
  purple: "before:bg-accent-100",
  yellow: "before:bg-warning-100",
  green: "before:bg-success-100",
};

type Props = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

export function Title({ variant = "blue", className = "", children }: Props) {
  return (
    <div
      className={`relative inline-block pl-8 text-title-1-s text-neutral-900 before:absolute before:left-0 before:top-1/2 before:h-8 before:w-4 before:-translate-y-1/2 before:rounded-sm before:content-[''] dark:text-white ${bars[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
