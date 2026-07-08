"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: ReactNode;
};

export function Switch({ label, className = "", ...props }: Props) {
  return (
    <label
      className={`inline-flex cursor-pointer select-none items-center gap-3 ${className}`}
    >
      <span className="relative inline-block">
        <input type="checkbox" className="peer sr-only" {...props} />
        <span className="block h-6 w-12 rounded-full bg-neutral-100 transition-colors peer-checked:bg-primary-500 dark:bg-neutral-950" />
        <span className="pointer-events-none absolute left-0.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-neutral-50 shadow-[0px_2px_4px_rgba(0,0,0,0.2),inset_0px_2px_2px_#FFFFFF,inset_0px_-1px_1px_rgba(0,0,0,0.1)] transition-transform peer-checked:translate-x-6" />
      </span>
      {label ? (
        <span className="text-base-1-s text-neutral-900 dark:text-white">
          {label}
        </span>
      ) : null}
    </label>
  );
}
