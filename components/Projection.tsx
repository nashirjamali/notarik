"use client";

import { formatIDR } from "@/lib/format";
import { projectSpend } from "@/lib/recap";
import type { Transaction } from "@/lib/types";
import { TrendIcon } from "./icons";

/**
 * A straight-line run-rate estimate, deliberately styled as a soft note rather
 * than a headline metric. It never uses the primary accent or confident money
 * type — an estimate must look like an estimate. (PRODUCT.md §8c)
 */
export function Projection({ txs }: { txs: Transaction[] }) {
  const p = projectSpend(txs);

  return (
    <section
      aria-labelledby="projection-heading"
      className="rounded-xl border border-dashed border-border-strong bg-surface p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 text-muted">
        <TrendIcon size={18} />
        <h2
          id="projection-heading"
          className="text-sm font-medium text-ink"
        >
          If your pace holds
        </h2>
      </div>

      {!p.ready ? (
        <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-muted">
          Not enough data yet. Once you&apos;ve logged about a week of receipts
          (at least 5 expenses across 7+ days), we&apos;ll estimate where your
          current pace is heading.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Estimate label="In ~2 months" value={p.projected2m} />
            <Estimate label="In ~4 months" value={p.projected4m} />
          </div>
          <p className="mt-4 max-w-[58ch] text-xs leading-relaxed text-muted">
            Estimated if your current pace continues —{" "}
            <span className="nums">{formatIDR(p.dailyRate)}</span>/day across{" "}
            <span className="nums">{p.daysCovered}</span> days. A straight-line
            guess only: it doesn&apos;t account for one-off purchases, seasonality,
            or income.
          </p>
        </>
      )}
    </section>
  );
}

function Estimate({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-bg px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="nums mt-0.5 text-lg tracking-tight text-ink">
        ≈ {formatIDR(value)}
      </p>
    </div>
  );
}
