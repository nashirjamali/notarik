import type { ReactNode } from "react";

type Props = {
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export function Card({ title, action, className = "", children }: Props) {
  return (
    <div
      className={`relative rounded-lg bg-white p-6 m:p-4 dark:bg-neutral-900 ${className}`}
    >
      {(title || action) && (
        <div className="mb-8 flex min-h-10 items-center gap-4 m:mb-6">
          {title ? (
            <div className="mr-auto text-title-1-s text-neutral-900 dark:text-white">
              {title}
            </div>
          ) : null}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
