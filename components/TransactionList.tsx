"use client";

import { useState } from "react";
import { CATEGORY_META } from "@/lib/categories";
import { formatDate, formatIDR } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { ChevronDownIcon, TrashIcon } from "./icons";

type Props = {
  txs: Transaction[];
  onDelete: (id: string) => void;
};

/**
 * The ledger. Dense, scannable rows newest-first; each one expands to its line
 * items (PRODUCT.md F13). No gridlines or zebra — tonal hover and tabular
 * figures carry the structure instead.
 */
export function TransactionList({ txs, onDelete }: Props) {
  return (
    <section aria-labelledby="tx-heading">
      <div className="mb-3 flex items-baseline justify-between gap-4 px-1">
        <h2 id="tx-heading" className="font-serif text-xl tracking-tight text-ink">
          Transactions
        </h2>
        <span className="text-xs text-muted">
          {txs.length} total
        </span>
      </div>
      <ul className="overflow-hidden rounded-xl border border-border bg-bg">
        {txs.map((tx, i) => (
          <Row
            key={tx.id}
            tx={tx}
            onDelete={onDelete}
            divider={i > 0}
          />
        ))}
      </ul>
    </section>
  );
}

function Row({
  tx,
  onDelete,
  divider,
}: {
  tx: Transaction;
  onDelete: (id: string) => void;
  divider: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const hasItems = tx.items.length > 0;

  return (
    <li className={divider ? "border-t border-border" : ""}>
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
            className="shrink-0 rounded-md p-1.5 text-muted opacity-0 transition-[opacity,color,background-color] hover:bg-danger-soft hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
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
