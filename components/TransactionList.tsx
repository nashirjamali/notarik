"use client";

import { Fragment, useMemo, useState } from "react";
import { CATEGORY_META } from "@/lib/categories";
import { formatDate, formatIDR } from "@/lib/format";
import { monthKeyOf, monthLabel } from "@/lib/recap";
import { CATEGORIES, type Category, type Transaction } from "@/lib/types";
import { Button, Checkbox, Status } from "@/components/ui";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ReceiptIcon,
  SearchIcon,
  TrashIcon,
  XIcon,
} from "./icons";

const PAGE_SIZE = 25;

type Props = {
  txs: Transaction[];
  onDelete: (id: string) => void;
  /** Show month subheaders + per-month totals (used when viewing all time). */
  grouped: boolean;
  /** Recategorize a batch of transactions at once (bulk edit). */
  onBulkRecategorize?: (ids: string[], category: Category) => void;
};

function matches(tx: Transaction, q: string): boolean {
  if (!q) return true;
  const hay = `${tx.merchant} ${tx.category} ${(tx.tags ?? []).join(" ")} ${tx.items
    .map((i) => i.name)
    .join(" ")}`.toLowerCase();
  return hay.includes(q);
}

/**
 * The ledger. Sorted newest-first by spend date, searchable, and paginated so a
 * year of receipts never becomes an endless scroll. When scoped to all time it
 * groups under month subheaders with each month's total. (PRODUCT.md F5/F13)
 */
export function TransactionList({ txs, onDelete, grouped, onBulkRecategorize }: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyBulkCategory(category: Category) {
    if (!onBulkRecategorize || selected.size === 0) return;
    onBulkRecategorize(Array.from(selected), category);
    setSelected(new Set());
  }

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
        <h2 id="tx-heading" className="font-serif text-xl tracking-tight text-neutral-900">
          Transactions
        </h2>
        <span className="nums text-xs text-neutral-500">
          {filtered.length}
          {q ? ` of ${txs.length}` : ""} total
        </span>
      </div>

      <div className="relative mb-3">
        <SearchIcon
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search merchant, category, or item"
          aria-label="Search transactions"
          className="w-full rounded-lg border border-neutral-400 bg-white py-2.5 pl-10 pr-3.5 text-sm text-neutral-900 outline-none transition-[border-color,box-shadow] focus-visible:border-primary-500 focus-visible:shadow-[0_0_0_3px_var(--color-primary-100)] placeholder:text-neutral-500"
        />
      </div>

      {onBulkRecategorize && selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary-100 px-4 py-3 shadow-dropdown dark:bg-primary-500/15">
          <Status variant="blue">{selected.size} selected</Status>
          <div className="flex items-center gap-2">
            <select
              defaultValue=""
              aria-label="Move selected expenses to category"
              onChange={(e) => {
                const val = e.target.value as Category;
                if (val) applyBulkCategory(val);
              }}
              className="h-10 rounded-lg border-2 border-transparent bg-white px-3 text-caption-1-m text-neutral-900 outline-none transition-colors focus:border-neutral-400 dark:bg-neutral-800 dark:text-white"
            >
              <option value="" disabled>
                Move to…
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="white"
              size="small"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white px-5 py-12 text-center">
          <p className="text-sm text-neutral-500">
            No expenses match{" "}
            <span className="font-medium text-neutral-900">“{query.trim()}”</span>.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {rows.map(({ tx, mk, showHeader }) => {
            return (
              <Fragment key={tx.id}>
                {showHeader && (
                  <li className="flex items-baseline justify-between gap-3 border-t border-neutral-200 bg-neutral-100 px-4 py-2 first:border-t-0 sm:px-5">
                    <span className="text-xs font-medium text-neutral-900">
                      {mk ? monthLabel(mk) : "No date"}
                    </span>
                    <span className="nums text-xs text-neutral-500">
                      {formatIDR(monthTotals.get(mk) ?? 0)}
                    </span>
                  </li>
                )}
                <Row
                  tx={tx}
                  onDelete={onDelete}
                  withHeader={showHeader}
                  selectable={Boolean(onBulkRecategorize)}
                  selected={selected.has(tx.id)}
                  onToggleSelected={() => toggleSelected(tx.id)}
                  onViewReceipt={tx.imageThumb ? () => setViewerSrc(tx.imageThumb!) : undefined}
                />
              </Fragment>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="nums text-xs text-neutral-500">
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
            <span className="nums px-1 text-xs text-neutral-500">
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

      {viewerSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Receipt photo"
          onClick={() => setViewerSrc(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] max-w-md rounded-2xl bg-white p-2 shadow-dropdown dark:bg-neutral-900"
          >
            {/* Receipt reference — base64 data URL, next/image can't optimize it */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewerSrc}
              alt="Saved receipt"
              className="max-h-[calc(85vh-1rem)] w-full rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={() => setViewerSrc(null)}
              aria-label="Close receipt viewer"
              className="absolute -top-3 -right-3 grid size-8 place-items-center rounded-full bg-white text-neutral-900 shadow-widget dark:bg-neutral-800 dark:text-white"
            >
              <XIcon size={16} />
            </button>
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
      className="grid size-9 place-items-center rounded-md border border-neutral-400 bg-white text-neutral-900 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
    >
      {children}
    </button>
  );
}

function Row({
  tx,
  onDelete,
  withHeader,
  selectable,
  selected,
  onToggleSelected,
  onViewReceipt,
}: {
  tx: Transaction;
  onDelete: (id: string) => void;
  withHeader: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelected?: () => void;
  onViewReceipt?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const hasItems = tx.items.length > 0;
  const hasTags = (tx.tags?.length ?? 0) > 0;

  return (
    <li className={withHeader ? "" : "border-t border-neutral-200 first:border-t-0"}>
      <div className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-100 sm:px-5">
        {selectable && (
          <Checkbox
            checked={Boolean(selected)}
            onChange={onToggleSelected}
            aria-label={`Select ${tx.merchant} expense`}
            className="shrink-0"
          />
        )}
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
            <span className="flex items-center gap-1.5">
              <span className="block truncate text-sm font-medium text-neutral-900">
                {tx.merchant}
              </span>
              {tx.recurring && (
                <Status variant="blue" className="shrink-0">
                  Recurring
                </Status>
              )}
              {tx.wasEdited && (
                <Status
                  variant="yellow"
                  className="shrink-0"
                  title="You corrected this after the AI read it"
                >
                  Edited
                </Status>
              )}
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
              <span>{tx.category}</span>
              <span aria-hidden>·</span>
              <span className="nums">{formatDate(tx.date)}</span>
              {hasTags &&
                tx.tags!.map((tag) => (
                  <Status key={tag} variant="purple" className="shrink-0 !py-0 text-[10px] leading-5">
                    {tag}
                  </Status>
                ))}
            </span>
          </span>
          <span className="nums shrink-0 text-sm font-medium text-neutral-900">
            {formatIDR(tx.total)}
          </span>
          {hasItems && (
            <ChevronDownIcon
              size={16}
              className={`shrink-0 text-neutral-500 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {onViewReceipt && (
          <button
            type="button"
            onClick={onViewReceipt}
            aria-label={`View receipt for ${tx.merchant}`}
            className="shrink-0 rounded-md p-1.5 text-neutral-500 opacity-0 transition-[opacity,color,background-color] hover:bg-neutral-200 hover:text-neutral-900 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ReceiptIcon size={16} />
          </button>
        )}

        {confirming ? (
          <span className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onDelete(tx.id)}
              className="rounded-md px-2 py-1 text-xs font-medium text-danger-500 transition-colors hover:bg-danger-100"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-200"
            >
              Keep
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${tx.merchant} expense`}
            className="shrink-0 rounded-md p-1.5 text-neutral-500 opacity-0 transition-[opacity,color,background-color] hover:bg-danger-100 hover:text-danger-500 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <TrashIcon size={16} />
          </button>
        )}
      </div>

      {hasItems && open && (
        <ul className="border-t border-neutral-200 bg-neutral-100 px-5 py-2.5 text-sm sm:pl-[2.875rem]">
          {tx.items.map((it, idx) => (
            <li
              key={idx}
              className="flex items-baseline justify-between gap-4 py-1.5"
            >
              <span className="text-neutral-900">
                {it.qty && it.qty > 1 && (
                  <span className="nums mr-1.5 text-neutral-500">{it.qty}×</span>
                )}
                {it.name}
              </span>
              {it.price != null && (
                <span className="nums shrink-0 text-neutral-500">
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
