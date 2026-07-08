"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
};

export function Checkbox({ label, className = "", ...props }: Props) {
  return (
    <label
      className={`group inline-flex cursor-pointer select-none items-center ${className}`}
    >
      <span className="relative inline-flex size-6 shrink-0 items-center justify-center rounded-md border-2 border-neutral-500/40 transition-colors hover:border-primary-500 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-500">
        <input
          type="checkbox"
          className="peer absolute inset-0 cursor-pointer opacity-0"
          {...props}
        />
        <svg
          viewBox="0 0 17 12"
          className="h-3 w-[17px] opacity-0 transition-opacity peer-checked:opacity-100"
          aria-hidden="true"
        >
          <path
            d="M16.707.293a1 1 0 0 1 0 1.414l-8.586 8.586a3 3 0 0 1-4.243 0L.293 6.707A1 1 0 0 1 .735 5.02a1 1 0 0 1 .973.273l3.586 3.586a1 1 0 0 0 1.414 0L15.293.293a1 1 0 0 1 1.414 0z"
            fillRule="evenodd"
            fill="#fcfcfc"
          />
        </svg>
      </span>
      {label ? (
        <span className="grow pl-4 text-base-1-s text-neutral-900 dark:text-white">
          {label}
        </span>
      ) : null}
    </label>
  );
}
