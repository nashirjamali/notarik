"use client";

import { CATEGORY_META } from "@/lib/categories";
import { formatIDR } from "@/lib/format";
import { categoryTotals, grandTotal } from "@/lib/recap";
import type { Transaction } from "@/lib/types";
import { DonutChart } from "./DonutChart";

const pct = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/**
 * Where the money went. The donut is the glanceable chart; the breakdown beside
 * it carries the real figures (tabular, sorted largest-first) so the chart never
 * has to be precise — the numbers are.
 */
export function Recap({ txs, label }: { txs: Transaction[]; label: string }) {
  const slices = categoryTotals(txs);
  const total = grandTotal(txs);

  return (
    <section
      aria-labelledby="recap-heading"
      className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-7"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="recap-heading"
          className="font-serif text-xl tracking-tight text-neutral-900"
        >
          Where it went
        </h2>
        <span className="text-xs text-neutral-500">{label}</span>
      </div>

      <div className="mt-6 flex flex-col items-center gap-7 sm:flex-row sm:items-center sm:gap-9">
        <div className="relative grid place-items-center">
          <DonutChart slices={slices} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[0.6875rem] font-medium uppercase tracking-wide text-neutral-500">
              Total
            </span>
            <span className="nums font-serif text-xl tracking-tight text-neutral-900">
              {formatIDR(total)}
            </span>
          </div>
        </div>

        <ul className="w-full flex-1 space-y-1">
          {slices.map((s) => (
            <li key={s.category}>
              <div className="flex items-baseline justify-between gap-3 py-1.5">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CATEGORY_META[s.category].color }}
                    aria-hidden
                  />
                  <span className="truncate text-sm text-neutral-900">{s.category}</span>
                  <span className="nums shrink-0 text-xs text-neutral-500">
                    {pct.format(s.share * 100)}%
                  </span>
                </span>
                <span className="nums shrink-0 text-sm font-medium text-neutral-900">
                  {formatIDR(s.total)}
                </span>
              </div>
              <div
                className="h-1 overflow-hidden rounded-full bg-neutral-200"
                aria-hidden
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-quint)]"
                  style={{
                    width: `${Math.max(s.share * 100, 2)}%`,
                    backgroundColor: CATEGORY_META[s.category].color,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
