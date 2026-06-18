/** Indonesian Rupiah, no decimals — e.g. 45000 -> "Rp 45.000". */
const idr = new Intl.NumberFormat("id-ID", {
  style: "decimal",
  maximumFractionDigits: 0,
});

export function formatIDR(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Rp —";
  return `Rp ${idr.format(Math.round(value))}`;
}

/** Parse a user-typed amount ("45.000", "Rp 45000", "45,5") into a number. */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[^\d]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** "2026-06-18" -> "18 Jun 2026". Falls back gracefully. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "No date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
