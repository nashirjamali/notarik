"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MenuIcon, PlusIcon, BellIcon, LogOutIcon } from "@/components/icons";

type Props = {
  title: string;
  summary?: React.ReactNode;
  userEmail?: string;
  onOpenSidebar: () => void;
  onLogout: () => void;
};

export function Header({
  title,
  summary,
  userEmail,
  onOpenSidebar,
  onLogout,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (userEmail?.[0] ?? "N").toUpperCase();

  return (
    <header className="fixed right-0 left-0 top-0 z-30 flex h-20 items-center gap-4 border-b border-neutral-200 bg-white px-4 rail:left-24 wide:left-[300px] wide:px-6 x-up:left-[340px] x-up:h-24 x-up:px-10 dark:border-neutral-800 dark:bg-neutral-900">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className="grid size-10 place-items-center text-neutral-500 transition-colors hover:text-neutral-900 md:hidden dark:hover:text-white"
      >
        <MenuIcon />
      </button>

      <h1 className="text-title-1-s text-neutral-900 dark:text-white">{title}</h1>

      <div className="ml-auto flex items-center gap-3 wide:gap-5">
        {summary}

        <a href="#add" className="hidden sm:inline-flex">
          <Button size="small" iconLeft={<PlusIcon size={20} />}>
            Add receipt
          </Button>
        </a>

        <button
          type="button"
          aria-label="Notifications"
          className="relative grid size-10 place-items-center text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
        >
          <BellIcon />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-danger-500 dark:border-neutral-900" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Account menu"
            className="grid size-10 place-items-center rounded-full bg-primary-500 text-button-2 text-white"
          >
            {initial}
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-hidden
                tabIndex={-1}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <div className="absolute right-0 top-[calc(100%+12px)] z-20 w-56 rounded-2xl border border-neutral-200 bg-white p-2 shadow-dropdown dark:border-neutral-800 dark:bg-neutral-950">
                {userEmail ? (
                  <p className="truncate px-3 py-2 text-caption-1 text-neutral-500">
                    {userEmail}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
                >
                  <LogOutIcon size={20} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
