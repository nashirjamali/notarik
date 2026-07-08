"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/auth/BrandMark";
import {
  HomeIcon,
  TrendIcon,
  WalletIcon,
  ReceiptIcon,
  HelpIcon,
  SunIcon,
  MoonIcon,
  XIcon,
} from "@/components/icons";

const NAV = [
  { label: "Overview", href: "/", icon: HomeIcon },
  { label: "Recap", href: "/#recap", icon: TrendIcon },
  { label: "Budget", href: "/#budget", icon: WalletIcon },
  { label: "Transactions", href: "/#transactions", icon: ReceiptIcon },
];

const itemBase =
  "group flex h-12 items-center gap-3 rounded-xl px-3 text-base-1-s transition-colors rail:w-12 rail:justify-center rail:gap-0 rail:px-0 rail:mx-auto";
const itemIdle =
  "text-neutral-500 hover:text-neutral-900 dark:hover:text-white";

type Props = {
  open: boolean;
  dark: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
};

export function Sidebar({ open, dark, onClose, onToggleTheme }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col overflow-y-auto bg-white p-4 transition-transform duration-300 md:translate-x-0 rail:w-24 wide:w-[300px] x-up:w-[340px] x-up:p-6 dark:bg-neutral-900 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="absolute right-4 top-4 grid size-10 place-items-center text-neutral-900 md:hidden dark:text-white"
      >
        <XIcon />
      </button>

      <Link
        href="/"
        onClick={onClose}
        className="mb-8 inline-flex rail:mx-auto x-up:mb-12"
      >
        <BrandMark withWordmark={false} />
      </Link>

      <nav className="flex flex-1 flex-col gap-2">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : false;
          return (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className={`${itemBase} ${
                active
                  ? "bg-neutral-200 text-neutral-900 shadow-[inset_0_-2px_1px_rgba(0,0,0,0.05),inset_0_1px_1px_#fff] dark:bg-neutral-800 dark:text-white dark:shadow-none"
                  : itemIdle
              }`}
            >
              <Icon size={24} className="shrink-0" />
              <span className="rail:hidden">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 space-y-1 border-t-2 border-neutral-100 pt-4 dark:border-neutral-800">
        <button
          type="button"
          className={`${itemBase} ${itemIdle} w-full`}
        >
          <HelpIcon size={24} className="shrink-0" />
          <span className="rail:hidden">Help & support</span>
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          className={`${itemBase} ${itemIdle} w-full`}
        >
          {dark ? (
            <SunIcon size={24} className="shrink-0" />
          ) : (
            <MoonIcon size={24} className="shrink-0" />
          )}
          <span className="rail:hidden">{dark ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>
    </aside>
  );
}
