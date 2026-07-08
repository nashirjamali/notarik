"use client";

import { useMemo, useState } from "react";
import type { ExtractionResult, Item, Transaction } from "@/lib/types";
import { formatAmount, formatIDR, parseAmount, todayISO } from "@/lib/format";
import { newId } from "@/lib/id";
import { Button, Checkbox } from "@/components/ui";
import { CategoryPicker } from "./CategoryPicker";
import {
  AlertIcon,
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  RefreshIcon,
  XIcon,
} from "./icons";

type Props = {
  result: ExtractionResult;
  preview: string;
  onSave: (tx: Transaction) => void;
  onRetake: () => void;
  /** No photo behind this entry — typed by hand. Hides the image + "we read" cues. */
  manual?: boolean;
};

export function ReviewCard({ result, preview, onSave, onRetake, manual }: Props) {
  const [merchant, setMerchant] = useState(result.merchant ?? "");
  const [date, setDate] = useState(result.date ?? todayISO());
  const [totalText, setTotalText] = useState(
    result.total != null ? String(result.total) : "",
  );
  const [category, setCategory] = useState(result.category);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [items, setItems] = useState<Item[]>(result.items);
  const [tagsText, setTagsText] = useState("");
  const [recurring, setRecurring] = useState(false);

  const total = parseAmount(totalText);
  const totalUnread = !manual && result.total == null;
  const dateUnread = !manual && result.date == null;
  const merchantUnread = !manual && result.merchant == null;

  const canSave = merchant.trim().length > 0 && total != null && total > 0;

  // price is the line total (qty already baked in), so sum it directly —
  // multiplying by qty would shrink weight-priced items (e.g. 0.1 kg of chili).
  const itemsTotal = useMemo(
    () => items.reduce((sum, it) => sum + (it.price ?? 0), 0),
    [items],
  );

  function updateItem(index: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function handleSave() {
    if (!canSave || total == null) return;
    // Drop blank rows; a kept item needs at least a name.
    const cleanItems = items.filter((it) => it.name.trim().length > 0);
    const cleanTags = Array.from(
      new Set(
        tagsText
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      ),
    );
    // Flag entries the AI misread so the recap can surface where extraction needs a human fix.
    const wasEdited =
      !manual &&
      (merchant.trim() !== (result.merchant ?? "") ||
        date !== (result.date ?? todayISO()) ||
        total !== result.total ||
        category !== result.category);
    onSave({
      id: newId(),
      merchant: merchant.trim(),
      date,
      total,
      currency: "IDR",
      category,
      items: cleanItems,
      createdAt: new Date().toISOString(),
      imageThumb: preview,
      ...(cleanTags.length > 0 ? { tags: cleanTags } : {}),
      ...(recurring ? { recurring: true } : {}),
      ...(wasEdited ? { wasEdited: true } : {}),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight text-neutral-900">
            {manual ? "Add an expense" : "Check the details"}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {manual
              ? "Type the details, then save."
              : "We read this from your receipt. Fix anything that’s off, then save."}
          </p>
        </div>
        {!manual && (
          <button
            type="button"
            onClick={onRetake}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900"
          >
            <RefreshIcon size={16} />
            <span className="hidden sm:inline">Retake</span>
          </button>
        )}
      </div>

      <div
        className={
          manual
            ? "grid gap-6"
            : "grid gap-6 sm:grid-cols-[8.5rem_1fr] sm:items-start"
        }
      >
        {/* Receipt reference — base64 data URL, next/image can't optimize it */}
        {!manual && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="The receipt you uploaded"
            className="hidden w-full rounded-lg border border-neutral-200 object-cover sm:block"
          />
        )}

        <div className="flex flex-col gap-5">
          {/* The total — the figure that matters most */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-100 p-4">
            <label
              htmlFor="total"
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500"
            >
              Final total
              {totalUnread && (
                <span className="inline-flex items-center gap-1 text-danger-500">
                  <AlertIcon size={13} /> not read — please enter
                </span>
              )}
            </label>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-serif text-2xl text-neutral-500">Rp</span>
              <input
                id="total"
                inputMode="numeric"
                value={total != null ? formatAmount(total) : ""}
                onChange={(e) => setTotalText(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="0"
                aria-invalid={!canSave && totalText.length > 0}
                className="nums w-full min-w-0 bg-transparent font-serif text-4xl tracking-tight text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-500">
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
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Category
            </p>
            <CategoryPicker value={category} onChange={setCategory} />
          </div>

          {/* Tags — optional, free-form, comma separated */}
          <Field label="Tags (optional)">
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g. work travel, date night"
              className="field-input"
            />
          </Field>

          {/* Recurring — surfaces a quick-add suggestion in future months */}
          <Checkbox
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            label="This repeats every month (e.g. rent, subscription)"
          />

          {/* Items — editable when typed by hand, read-only when read from a photo */}
          {manual ? (
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Items <span className="normal-case tracking-normal">(optional)</span>
                </p>
                {itemsTotal > 0 && (
                  <button
                    type="button"
                    onClick={() => setTotalText(String(itemsTotal))}
                    className="nums text-xs font-medium text-primary-500 transition-colors hover:text-primary-600"
                  >
                    Sum {formatIDR(itemsTotal)} → set as total
                  </button>
                )}
              </div>

              {items.length > 0 && (
                <ul className="mb-2 flex flex-col gap-2">
                  {items.map((it, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <input
                        value={it.name}
                        onChange={(e) => updateItem(i, { name: e.target.value })}
                        placeholder="Item name"
                        aria-label={`Item ${i + 1} name`}
                        className="field-input flex-1"
                      />
                      <span className="flex items-center gap-1 rounded-md border border-neutral-400 bg-white px-2.5 py-2">
                        <span className="text-sm text-neutral-500">Rp</span>
                        <input
                          inputMode="numeric"
                          value={it.price != null ? formatAmount(it.price) : ""}
                          onChange={(e) =>
                            updateItem(i, {
                              price: parseAmount(e.target.value) ?? undefined,
                            })
                          }
                          placeholder="0"
                          aria-label={`Item ${i + 1} price`}
                          className="nums w-24 bg-transparent text-right text-sm text-neutral-900 outline-none placeholder:text-neutral-500"
                        />
                      </span>
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                        aria-label={`Remove item ${i + 1}`}
                        className="shrink-0 rounded-md p-2 text-neutral-500 transition-colors hover:bg-danger-100 hover:text-danger-500"
                      >
                        <XIcon size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={() => setItems((prev) => [...prev, { name: "" }])}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-neutral-400 px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:border-primary-500 hover:text-neutral-900"
              >
                <PlusIcon size={16} />
                Add item
              </button>
            </div>
          ) : (
            items.length > 0 && (
              <div className="rounded-lg border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setItemsOpen((o) => !o)}
                  aria-expanded={itemsOpen}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm transition-colors hover:bg-neutral-200"
                >
                  <span className="font-medium text-neutral-900">
                    {items.length} item{items.length > 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-2 text-neutral-500">
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
                  <ul className="border-t border-neutral-200 px-4 py-2.5 text-sm">
                    {items.map((it, i) => (
                      <li
                        key={i}
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
              </div>
            )
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Button type="button" variant="stroke" onClick={onRetake}>
          {manual ? "Cancel" : "Start over"}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          iconLeft={<CheckIcon size={18} />}
        >
          Save expense
        </Button>
      </div>

      <style>{`
        .field-input {
          width: 100%;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-neutral-400);
          background: var(--color-white);
          padding: 0.5rem 0.75rem;
          font-size: 0.9375rem;
          color: var(--color-neutral-900);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input::placeholder { color: var(--color-neutral-500); }
        .field-input:focus-visible {
          outline: none;
          border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px var(--color-primary-100);
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
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
        {flagged && (
          <span className="inline-flex items-center gap-1 normal-case tracking-normal text-warning-500">
            <AlertIcon size={12} /> {flagText}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
