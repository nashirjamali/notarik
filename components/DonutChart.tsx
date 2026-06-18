"use client";

import { useId } from "react";
import { CATEGORY_META } from "@/lib/categories";
import type { CategoryTotal } from "@/lib/recap";

type Props = {
  slices: CategoryTotal[];
  size?: number;
};

/**
 * A quiet donut: thin segments, a small gap between them, and an empty centre
 * reserved for the period total (rendered by the caller). Hand-built in SVG so
 * it inherits the palette and stays flat — no chart-library chrome, gradients,
 * or tooltips fighting the "calm ledger" voice.
 */
export function DonutChart({ slices, size = 168 }: Props) {
  const titleId = useId();
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const gap = slices.length > 1 ? 0.012 * circumference : 0; // small visual breather

  // Cumulative start offset for each slice, computed up front so render stays pure.
  let running = 0;
  const segments = slices.map((s) => {
    const offset = running;
    running += s.share * circumference;
    return { s, offset };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-labelledby={titleId}
      className="shrink-0 -rotate-90"
    >
      <title id={titleId}>Spending by category</title>
      {/* track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--color-surface-2)"
        strokeWidth={stroke}
      />
      {segments.map(({ s, offset }) => {
        const len = Math.max(0, s.share * circumference - gap);
        const dash = `${len} ${circumference - len}`;
        return (
          <circle
            key={s.category}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={CATEGORY_META[s.category].color}
            strokeWidth={stroke}
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            strokeLinecap={slices.length === 1 ? "butt" : "round"}
          />
        );
      })}
    </svg>
  );
}
