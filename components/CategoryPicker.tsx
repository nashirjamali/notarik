"use client";

import { CATEGORIES, type Category } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";

type Props = {
  value: Category;
  onChange: (c: Category) => void;
};

/**
 * Inline segmented picker rather than a dropdown: all six categories are
 * always visible, so correcting the auto-pick is one tap with no menu.
 */
export function CategoryPicker({ value, onChange }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Category"
      className="flex flex-wrap gap-2"
    >
      {CATEGORIES.map((cat) => {
        const selected = cat === value;
        return (
          <button
            key={cat}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(cat)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${
              selected
                ? "border-primary bg-primary-soft font-medium text-ink"
                : "border-border bg-bg text-muted hover:border-border-strong hover:text-ink"
            }`}
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: CATEGORY_META[cat].color }}
              aria-hidden
            />
            {cat}
          </button>
        );
      })}
    </div>
  );
}
