"use client";

import { useMemo, useState } from "react";
import type { ExtractionResult, Transaction } from "@/lib/types";
import { formatIDR, parseAmount, todayISO } from "@/lib/format";
import { newId } from "@/lib/storage";
import { CategoryPicker } from "./CategoryPicker";
import { AlertIcon, CheckIcon, ChevronDownIcon, RefreshIcon } from "./icons";

type Props = {
  result: ExtractionResult;
  preview: string;
  onSave: (tx: Transaction) => void;
  onRetake: () => void;
};

export function ReviewCard({ result, preview, onSave, onRetake }: Props) {
  const [merchant, setMerchant] = useState(result.merchant ?? "");
  const [date, setDate] = useState(result.date ?? todayISO());
  const [totalText, setTotalText] = useState(
    result.total != null ? String(result.total) : "",
  );
  const [category, setCategory] = useState(result.category);
  const [itemsOpen, setItemsOpen] = useState(false);

  const total = parseAmount(totalText);
  const totalUnread = result.total == null;
  const dateUnread = result.date == null;
  const merchantUnread = result.merchant == null;

  const canSave = merchant.trim().length > 0 && total != null && total > 0;

  const itemsTotal = useMemo(
    () =>
      result.items.reduce(
        (sum, it) => sum + (it.price ?? 0) * (it.qty ?? 1),
        0,
      ),
    [result.items],
  );

  function handleSave() {
    if (!canSave || total == null) return;
    onSave({
      id: newId(),
      merchant: merchant.trim(),
      date,
      total,
      currency: "IDR",
      category,
      items: result.items,
      createdAt: new Date().toISOString(),
      imageThumb: preview,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight text-ink">
            Check the details
          </h2>
          <p className="mt-1 text-sm text-muted">
            We read this from your receipt. Fix anything that&apos;s off, then save.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <RefreshIcon size={16} />
          <span className="hidden sm:inline">Retake</span>
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-[8.5rem_1fr] sm:items-start">
        {/* Receipt reference — base64 data URL, next/image can't optimize it */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt="The receipt you uploaded"
          className="hidden w-full rounded-lg border border-border object-cover sm:block"
        />

        <div className="flex flex-col gap-5">
          {/* The total — the figure that matters most */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <label
              htmlFor="total"
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted"
            >
              Final total
              {totalUnread && (
                <span className="inline-flex items-center gap-1 text-danger">
                  <AlertIcon size={13} /> not read — please enter
                </span>
              )}
            </label>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-serif text-2xl text-muted">Rp</span>
              <input
                id="total"
                inputMode="numeric"
                value={totalText}
                onChange={(e) => setTotalText(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="0"
                aria-invalid={!canSave && totalText.length > 0}
                className="nums w-full min-w-0 bg-transparent font-serif text-4xl tracking-tight text-ink outline-none placeholder:text-border-strong"
              />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              Make sure this is the amount paid — not the subtotal before tax &amp; service.
            </p>
          </div>

          {/* Merchant + date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Merchant" flagged={merchantUnread}>
              <input
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="Who you paid"
                className="field-input"
              />
            </Field>
            <Field label="Date" flagged={dateUnread} flagText="not read — using today">
              <input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                className="field-input nums"
              />
            </Field>
          </div>

          {/* Category */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Category
            </p>
            <CategoryPicker value={category} onChange={setCategory} />
          </div>

          {/* Items */}
          {result.items.length > 0 && (
            <div className="rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setItemsOpen((o) => !o)}
                aria-expanded={itemsOpen}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm transition-colors hover:bg-surface-2"
              >
                <span className="font-medium text-ink">
                  {result.items.length} item{result.items.length > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-2 text-muted">
                  {itemsTotal > 0 && (
                    <span className="nums text-xs">{formatIDR(itemsTotal)}</span>
                  )}
                  <ChevronDownIcon
                    size={18}
                    className={`transition-transform duration-200 ${itemsOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>
              {itemsOpen && (
                <ul className="border-t border-border px-4 py-2.5 text-sm">
                  {result.items.map((it, i) => (
                    <li
                      key={i}
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
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onRetake}
          className="rounded-md border border-border-strong bg-bg px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          Start over
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-ink transition-[background-color,transform] duration-150 hover:bg-primary-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckIcon size={18} />
          Save expense
        </button>
      </div>

      <style>{`
        .field-input {
          width: 100%;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-strong);
          background: var(--color-bg);
          padding: 0.5rem 0.75rem;
          font-size: 0.9375rem;
          color: var(--color-ink);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input::placeholder { color: var(--color-muted); }
        .field-input:focus-visible {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-soft);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  flagged,
  flagText = "not read",
  children,
}: {
  label: string;
  flagged?: boolean;
  flagText?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
        {label}
        {flagged && (
          <span className="inline-flex items-center gap-1 normal-case tracking-normal text-warning">
            <AlertIcon size={12} /> {flagText}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
