"use client";

import { LoginMarketingBackground } from "@/components/login/LoginMarketingBackground";
import {
  CheckIcon,
  MenuDotsIcon,
  PlusIcon,
  TrendIcon,
  XIcon,
} from "@/components/icons";
import { useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 4500;

const slides = [
  {
    heading: "Get Smart With Your Receipts",
    body: "Snap a photo of any receipt and Notarik pulls out the merchant, items, and total automatically — no typing, no spreadsheets.",
  },
  {
    heading: "See Where Your Money Goes",
    body: "Every receipt is sorted into a category automatically, so you always know what's eating your budget.",
  },
  {
    heading: "Never Miss Your Budget Again",
    body: "Track spending in real time and get a heads-up before you go over budget this month.",
  },
];

function ScanReceiptCard() {
  return (
    <div className="relative z-10 mx-auto w-[88%] rounded-3xl bg-white p-5 shadow-2xl shadow-black/30">
      <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full text-faint">
        <XIcon size={14} />
      </span>

      <h3 className="text-center text-base font-extrabold text-ink">Scan Receipt</h3>
      <p className="mx-auto mt-1.5 max-w-[220px] text-center text-[11px] leading-relaxed text-muted">
        Snap a photo and we&apos;ll pull out the merchant, date, and items for
        you.
      </p>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-muted">
        Recent Receipts
      </p>
      <div className="mt-2 flex items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full border border-dashed border-border-strong text-faint">
          <PlusIcon size={14} />
        </div>
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-cat-groceries text-[11px] font-bold text-white">
          IM
        </div>
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-blue text-[11px] font-bold text-white">
          BB
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          Category
        </p>
        <span className="text-[10px] font-extrabold text-primary">Add +</span>
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cat-groceries" />
            <span className="text-[11px] font-bold text-ink">Groceries</span>
          </div>
          <span className="grid size-4 place-items-center rounded-full bg-primary text-white">
            <CheckIcon size={10} />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cat-transport" />
            <span className="text-[11px] font-bold text-faint">Transport</span>
          </div>
          <span className="size-4 rounded-full border border-border-strong" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
        <span className="text-[10px] font-semibold uppercase text-faint">Total</span>
        <span className="nums text-sm font-extrabold text-ink">Rp 142.500</span>
      </div>
    </div>
  );
}

function ThisMonthCard() {
  return (
    <div className="absolute -top-24 -right-6 z-20 w-[60%] rounded-2xl bg-white p-4 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted">This Month</p>
        <MenuDotsIcon size={14} className="text-faint" />
      </div>
      <p className="nums mt-1 text-xl font-extrabold text-ink">Rp 4.280.000</p>
      <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-success">
        <TrendIcon size={12} />
        12,4%
        <span className="font-medium text-faint">&middot; Jul 2026</span>
      </p>
    </div>
  );
}

function SpendingChartCard() {
  return (
    <div className="absolute -bottom-2 -left-4 z-20 w-[58%] rounded-2xl bg-white p-4 shadow-xl shadow-black/20">
      <div className="flex items-center gap-1 text-[9px] font-bold">
        <span className="rounded-full bg-primary px-2 py-0.5 text-white">Week</span>
        <span className="px-2 py-0.5 text-faint">Month</span>
        <span className="px-2 py-0.5 text-faint">Year</span>
      </div>
      <svg viewBox="0 0 120 50" className="mt-2 h-12 w-full" aria-hidden="true">
        <polyline
          points="0,40 15,30 30,35 45,15 60,25 75,10 90,20 105,5 120,15"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="105" cy="5" r="3.5" fill="var(--color-lime)" stroke="white" strokeWidth="1.5" />
      </svg>
      <div className="mt-1 flex justify-between text-[8px] font-semibold text-faint">
        <span>Mon</span>
        <span>Wed</span>
        <span>Fri</span>
        <span>Sun</span>
      </div>
    </div>
  );
}

function BudgetLeftCard() {
  return (
    <div className="absolute -bottom-2 -right-6 z-20 w-[48%] rounded-2xl bg-primary-hover p-4 shadow-xl shadow-black/25 ring-1 ring-white/10">
      <p className="text-[10px] font-medium text-white/70">Budget Left</p>
      <p className="nums mt-0.5 text-lg font-extrabold text-lime">Rp 1.720.000</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
        <div className="h-full w-[72%] rounded-full bg-lime" />
      </div>
    </div>
  );
}

export function MarketingPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => {
      setActive((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [active]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-primary px-8 py-16 xl:px-12">
      <LoginMarketingBackground className="pointer-events-none absolute inset-0 h-full w-full" />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        <div className="relative w-full pb-14 pt-12">
          <ScanReceiptCard />
          <ThisMonthCard />
          <SpendingChartCard />
          <BudgetLeftCard />
        </div>

        <div className="relative mt-4 h-[168px] w-full">
          {slides.map((slide, i) => (
            <div
              key={slide.heading}
              aria-hidden={i !== active}
              className={`absolute inset-x-0 top-0 flex flex-col items-center text-center transition-opacity duration-700 ease-out-quint ${
                i === active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white">
                {slide.heading}
              </h2>
              <p className="mx-auto mt-4 max-w-[340px] text-pretty text-sm leading-relaxed text-white/80">
                {slide.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.heading}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}: ${slide.heading}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
