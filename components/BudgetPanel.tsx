"use client";

import { useState } from "react";
import { CATEGORY_META } from "@/lib/categories";
import { formatAmount, formatIDR, parseAmount } from "@/lib/format";
import {
  budgetSummary,
  categoryTotals,
  type BudgetStatus,
} from "@/lib/recap";
import type { Transaction } from "@/lib/types";
import { CheckIcon, PlusIcon } from "./icons";

const pct = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const STATUS_TEXT: Record<BudgetStatus, string> = {
  "on-track": "text-success",
  "near-limit": "text-warning",
  over: "text-danger",
};
const STATUS_BAR: Record<BudgetStatus, string> = {
  "on-track": "var(--color-success)",
  "near-limit": "var(--color-warning)",
  over: "var(--color-danger)",
};
const STATUS_LABEL: Record<BudgetStatus, string> = {
  "on-track": "On track",
  "near-limit": "Near limit",
  over: "Over budget",
};

type Props = {
  monthTxs: Transaction[];
  monthLabel: string;
  budget: number | null;
  onSave: (next: number | null) => void;
};

/**
 * One total monthly budget. The user budgets their month as a whole; categories
 * are auto-assigned per receipt and shown beneath for visibility (PRODUCT.md
 * §8b, adapted to a single overall limit at the user's request).
 */
export function BudgetPanel({ monthTxs, monthLabel, budget, onSave }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <section
      aria-labelledby="budget-heading"
      className="rounded-xl border border-border bg-bg p-5 sm:p-7"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2
            id="budget-heading"
            className="font-serif text-xl tracking-tight text-ink"
          >
            Monthly budget
          </h2>
          <p className="mt-0.5 text-xs text-muted">{monthLabel}, all categories</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary-soft"
          >
            <PlusIcon size={16} />
            {budget != null ? "Edit limit" : "Set a limit"}
          </button>
        )}
      </div>

      {editing ? (
        <BudgetEditor
          budget={budget}
          onDone={(next) => {
            onSave(next);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : budget == null ? (
        <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted">
          No budget set. Add one total monthly limit and we&apos;ll track every
          receipt against it — you&apos;ll still see the breakdown by category
          below.
        </p>
      ) : (
        <Summary monthTxs={monthTxs} monthLabel={monthLabel} budget={budget} />
      )}
    </section>
  );
}

function Summary({
  monthTxs,
  monthLabel,
  budget,
}: {
  monthTxs: Transaction[];
  monthLabel: string;
  budget: number;
}) {
  const s = budgetSummary(monthTxs, budget);
  const cats = categoryTotals(monthTxs);
  const over = s.status === "over";
  const filled = Math.min(s.percentUsed, 100);

  return (
    <div className="mt-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="nums font-serif text-3xl tracking-tight text-ink">
            {formatIDR(s.spent)}
          </p>
          <p className="nums mt-1 text-sm text-muted">
            of {formatIDR(s.limit)} budget
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TEXT[s.status]}`}
          style={{ backgroundColor: `color-mix(in oklch, ${STATUS_BAR[s.status]} 12%, transparent)` }}
        >
          {STATUS_LABEL[s.status]}
        </span>
      </div>

      <div
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={Math.round(s.percentUsed)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Monthly budget used"
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-quint)]"
          style={{ width: `${filled}%`, backgroundColor: STATUS_BAR[s.status] }}
        />
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
        <span className={`nums font-medium ${STATUS_TEXT[s.status]}`}>
          {over
            ? `${formatIDR(-s.remaining)} over`
            : `${formatIDR(s.remaining)} left`}
        </span>
        <span className="nums text-muted">{pct.format(s.percentUsed)}% used</span>
      </div>

      {cats.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="mb-3 text-xs font-medium text-muted">
            {monthLabel} by category
          </p>
          <ul className="space-y-2.5">
            {cats.map((c) => (
              <li
                key={c.category}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_META[c.category].color }}
                    aria-hidden
                  />
                  <span className="text-sm text-ink">{c.category}</span>
                </span>
                <span className="nums text-sm text-muted">{formatIDR(c.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BudgetEditor({
  budget,
  onDone,
  onCancel,
}: {
  budget: number | null;
  onDone: (next: number | null) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(budget != null ? String(budget) : "");
  const value = parseAmount(draft);

  return (
    <div className="mt-5">
      <label htmlFor="total-budget" className="text-sm text-ink">
        Total to spend this month
      </label>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-base text-muted">Rp</span>
        <input
          id="total-budget"
          inputMode="numeric"
          autoFocus
          value={value != null ? formatAmount(value) : ""}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="3.500.000"
          className="nums w-full rounded-md border border-border-strong bg-bg px-3 py-2 text-base text-ink outline-none transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--color-primary-soft)] placeholder:text-muted"
        />
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {budget != null ? (
          <button
            type="button"
            onClick={() => onDone(null)}
            className="text-sm font-medium text-muted transition-colors hover:text-danger"
          >
            Remove budget
          </button>
        ) : (
          <span />
        )}
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border-strong bg-bg px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onDone(value)}
            disabled={value == null || value <= 0}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-ink transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckIcon size={18} />
            Save budget
          </button>
        </div>
      </div>
    </div>
  );
}
