"use client";

import { Fragment, useMemo, useState } from "react";
import { CATEGORY_META } from "@/lib/categories";
import { formatDate, formatIDR } from "@/lib/format";
import { monthKeyOf, monthLabel } from "@/lib/recap";
import type { Transaction } from "@/lib/types";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  TrashIcon,
} from "./icons";

const PAGE_SIZE = 25;

type Props = {
  txs: Transaction[];
  onDelete: (id: string) => void;
  /** Show month subheaders + per-month totals (used when viewing all time). */
  grouped: boolean;
};

function matches(tx: Transaction, q: string): boolean {
  if (!q) return true;
  const hay = `${tx.merchant} ${tx.category} ${tx.items
    .map((i) => i.name)
    .join(" ")}`.toLowerCase();
  return hay.includes(q);
}

/**
 * The ledger. Sorted newest-first by spend date, searchable, and paginated so a
 * year of receipts never becomes an endless scroll. When scoped to all time it
 * groups under month subheaders with each month's total. (PRODUCT.md F5/F13)
 */
export function TransactionList({ txs, onDelete, grouped }: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const q = query.trim().toLowerCase();

  const sorted = useMemo(
    () =>
      [...txs].sort(
        (a, b) =>
          b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
      ),
    [txs],
  );

  const filtered = useMemo(() => sorted.filter((t) => matches(t, q)), [sorted, q]);

  // Per-month totals across the whole filtered set, so a header's figure is the
  // real month total even when that month spans several pages.
  const monthTotals = useMemo(() => {
    const m = new Map<string | null, number>();
    for (const tx of filtered) {
      const k = monthKeyOf(tx.date);
      m.set(k, (m.get(k) ?? 0) + tx.total);
    }
    return m;
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  // Decide month headers up front (a header opens each new month within the page,
  // including at the top when a month carries over from the previous page).
  const rows = pageItems.map((tx, i) => {
    const mk = monthKeyOf(tx.date);
    const prevMk = i > 0 ? monthKeyOf(pageItems[i - 1].date) : undefined;
    return { tx, mk, showHeader: grouped && mk !== prevMk };
  });

  function onSearch(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <section aria-labelledby="tx-heading">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-1">
        <h2 id="tx-heading" className="font-serif text-xl tracking-tight text-ink">
          Transactions
        </h2>
        <span className="nums text-xs text-muted">
          {filtered.length}
          {q ? ` of ${txs.length}` : ""} total
        </span>
      </div>

      <div className="relative mb-3">
        <SearchIcon
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search merchant, category, or item"
          aria-label="Search transactions"
          className="w-full rounded-lg border border-border-strong bg-bg py-2.5 pl-10 pr-3.5 text-sm text-ink outline-none transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--color-primary-soft)] placeholder:text-muted"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg px-5 py-12 text-center">
          <p className="text-sm text-muted">
            No expenses match{" "}
            <span className="font-medium text-ink">“{query.trim()}”</span>.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-bg">
          {rows.map(({ tx, mk, showHeader }) => {
            return (
              <Fragment key={tx.id}>
                {showHeader && (
                  <li className="flex items-baseline justify-between gap-3 border-t border-border bg-surface px-4 py-2 first:border-t-0 sm:px-5">
                    <span className="text-xs font-medium text-ink">
                      {mk ? monthLabel(mk) : "No date"}
                    </span>
                    <span className="nums text-xs text-muted">
                      {formatIDR(monthTotals.get(mk) ?? 0)}
                    </span>
                  </li>
                )}
                <Row tx={tx} onDelete={onDelete} withHeader={showHeader} />
              </Fragment>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="nums text-xs text-muted">
            {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-1.5">
            <PageButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              label="Previous page"
            >
              <ChevronLeftIcon size={18} />
            </PageButton>
            <span className="nums px-1 text-xs text-muted">
              {safePage} / {totalPages}
            </span>
            <PageButton
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              label="Next page"
            >
              <ChevronRightIcon size={18} />
            </PageButton>
          </div>
        </div>
      )}
    </section>
  );
}

function PageButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-9 place-items-center rounded-md border border-border-strong bg-bg text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-bg"
    >
      {children}
    </button>
  );
}

function Row({
  tx,
  onDelete,
  withHeader,
}: {
  tx: Transaction;
  onDelete: (id: string) => void;
  withHeader: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const hasItems = tx.items.length > 0;

  return (
    <li className={withHeader ? "" : "border-t border-border first:border-t-0"}>
      <div className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface sm:px-5">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: CATEGORY_META[tx.category].color }}
          aria-hidden
        />

        <button
          type="button"
          onClick={() => hasItems && setOpen((o) => !o)}
          aria-expanded={hasItems ? open : undefined}
          disabled={!hasItems}
          className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">
              {tx.merchant}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <span>{tx.category}</span>
              <span aria-hidden>·</span>
              <span className="nums">{formatDate(tx.date)}</span>
            </span>
          </span>
          <span className="nums shrink-0 text-sm font-medium text-ink">
            {formatIDR(tx.total)}
          </span>
          {hasItems && (
            <ChevronDownIcon
              size={16}
              className={`shrink-0 text-muted transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {confirming ? (
          <span className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onDelete(tx.id)}
              className="rounded-md px-2 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2"
            >
              Keep
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${tx.merchant} expense`}
            className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <TrashIcon size={16} />
          </button>
        )}
      </div>

      {hasItems && open && (
        <ul className="border-t border-border bg-surface px-5 py-2.5 text-sm sm:pl-[2.875rem]">
          {tx.items.map((it, idx) => (
            <li
              key={idx}
              className="flex items-baseline justify-between gap-4 py-1.5"
            >
              <span className="text-ink">
                {it.qty && it.qty > 1 && (
                  <span className="nums mr-1.5 text-muted">{it.qty}×</span>
                )}
                {it.name}
              </span>
              {it.price != null && (
                <span className="nums shrink-0 text-muted">
                  {formatIDR(it.price)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
