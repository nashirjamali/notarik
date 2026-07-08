"use client";

import type { Period } from "@/lib/recap";
import { ChevronDownIcon } from "./icons";

type Props = {
  months: { key: string; label: string }[];
  value: Period;
  onChange: (next: Period) => void;
};

/**
 * Scopes the whole dashboard to a period: everything, or one month. A native
 * select keeps it accessible and unbreakable when a year of months piles up —
 * styled to the system rather than reinvented.
 */
export function MonthSelector({ months, value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2.5">
      <span className="text-sm text-neutral-500">Showing</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Period to show"
          className="nums appearance-none rounded-md border border-neutral-400 bg-white py-2 pl-3.5 pr-9 text-sm font-medium text-neutral-900 outline-none transition-[border-color,box-shadow] hover:bg-neutral-200 focus-visible:border-primary-500 focus-visible:shadow-[0_0_0_3px_var(--color-primary-100)]"
        >
          <option value="all">All time</option>
          {months.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
        />
      </span>
    </label>
  );
}
