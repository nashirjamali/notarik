"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

type Props = {
  title: string;
  summary?: React.ReactNode;
  userEmail?: string;
  onLogout: () => void;
  children: React.ReactNode;
};

export function DashboardShell({
  title,
  summary,
  userEmail,
  onLogout,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.body.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = document.body.classList.toggle("dark");
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  return (
    <div className="min-h-dvh bg-neutral-100 dark:bg-neutral-950">
      {open ? (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-neutral-900/50 md:hidden"
        />
      ) : null}

      <Sidebar
        open={open}
        dark={dark}
        onClose={() => setOpen(false)}
        onToggleTheme={toggleTheme}
      />

      <Header
        title={title}
        summary={summary}
        userEmail={userEmail}
        onOpenSidebar={() => setOpen(true)}
        onLogout={onLogout}
      />

      <main className="pl-0 pt-20 rail:pl-24 wide:pl-[300px] x-up:pl-[340px] x-up:pt-24">
        <div className="mx-auto max-w-[1280px] px-4 py-6 wide:px-6 x-up:px-10 x-up:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
