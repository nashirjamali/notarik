"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  icon?: ReactNode;
  error?: string;
  wrapClassName?: string;
};

export function Field({
  label,
  icon,
  error,
  className = "",
  wrapClassName = "",
  id,
  ...props
}: Props) {
  const invalid = Boolean(error);

  return (
    <div className={wrapClassName}>
      {label ? (
        <label
          htmlFor={id}
          className="mb-3.5 block text-base-2 text-neutral-700 dark:text-neutral-200"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-neutral-500">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={invalid || undefined}
          className={`h-12 w-full rounded-xl border-2 text-base-1-s text-neutral-900 outline-none transition-colors placeholder:text-neutral-500 dark:text-white ${
            icon ? "pl-12 pr-2.5" : "px-2.5"
          } ${
            invalid
              ? "border-transparent bg-danger-100/25 text-danger-500 placeholder:text-danger-500 focus:border-danger-500"
              : "border-transparent bg-neutral-100 focus:border-neutral-400 focus:bg-white dark:border-neutral-800 dark:bg-neutral-800 dark:focus:border-neutral-700"
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-2 text-caption-2 text-danger-500">{error}</p>
      ) : null}
    </div>
  );
}
