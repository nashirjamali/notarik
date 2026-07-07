"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

type Props = {
  title: string;
  userName: string;
  children?: ReactNode;
};

export function DashboardShell({ title, userName, children }: Props) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-dvh w-full bg-bg">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="min-w-0 flex-1 px-6 py-8 sm:px-10 lg:px-12">
        <Topbar title={title} userName={userName} onMenuClick={() => setNavOpen(true)} />

        <main className="mt-8">{children}</main>
      </div>
    </div>
  );
}
