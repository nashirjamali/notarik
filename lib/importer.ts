import { normalizeCategory, normalizeDate, normalizeItems } from "./extraction";
import type { Category, Item } from "./types";

/**
 * Parse an amount as Indonesian Rupiah — strip everything but digits. Unlike the
 * extraction helper, this never treats "." as a decimal point: in IDR a dot is a
 * thousands separator, so "Rp 32.000" must become 32000, not 32.
 */
function parseRupiah(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (typeof v === "string") {
    const digits = v.replace(/[^\d]/g, "");
    if (!digits) return null;
    const n = Number(digits);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** One importable expense after the model has mapped an arbitrary sheet row. */
export interface ImportedRow {
  merchant: string | null;
  date: string | null;
  total: number | null;
  currency: "IDR";
  category: Category;
  items: Item[];
}

export const IMPORT_PROMPT = `You are a data-mapping assistant for an Indonesian Rupiah expense tracker. You will be given the rows of a spreadsheet (as JSON) whose columns and language are UNKNOWN — they may be in English or Indonesian, named anything, ordered any way, with extra columns you should ignore.

Map every row that represents a real expense into STRICT JSON ONLY — no prose, no markdown, no code fences. Return an array:
[
  {
    "merchant": string | null,
    "date": "YYYY-MM-DD" | null,
    "total": number | null,
    "currency": "IDR",
    "category": "Groceries" | "Dining" | "Transport" | "Shopping" | "Bills" | "Other",
    "items": [{ "name": string, "qty": number, "price": number }]
  }
]

Rules:
- One object per expense row. Skip header rows, blank rows, totals/summary rows, and anything that clearly isn't a single expense.
- "total" is the amount paid as a plain integer — strip "Rp", thousands separators, and decimals (e.g. "Rp 45.000" -> 45000). If you cannot find an amount, use null (that row will be dropped).
- "merchant" is the shop/payee/description. Use null if there is none.
- "date": parse any date format (e.g. 18/06/2026, 2026-06-18, "18 Jun 2026") into YYYY-MM-DD. Use null if absent or unparseable.
- "category": choose the single best fit from the six values. Map foreign or free-text categories sensibly (e.g. "Makan"/"Restoran" -> Dining, "Belanja"/"Supermarket" -> Groceries, "Transportasi"/"Bensin" -> Transport, "Tagihan" -> Bills). If unsure, "Other".
- "items": only if the row clearly lists line items; otherwise return []. Each item's "price" is the line total actually charged for that item (after any discount, quantity/weight already included), not the per-unit price.
- Map ONLY data present in the rows. Never invent expenses.
Return the JSON array only.`;

/** Recover a JSON array from the model's raw text, tolerating fences/prose. */
function extractJsonArray(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

/**
 * Parse the model's mapping response into validated rows. Throws only when no
 * JSON array can be recovered at all; individual malformed rows are dropped so
 * one bad row never fails the whole import. (PRODUCT.md §9)
 */
export function parseImport(rawText: string): ImportedRow[] {
  const block = extractJsonArray(rawText);
  let arr: unknown;
  try {
    arr = JSON.parse(block);
  } catch {
    throw new Error("Model did not return a readable JSON array.");
  }
  if (!Array.isArray(arr)) throw new Error("Expected a JSON array of rows.");

  return arr
    .map((raw): ImportedRow | null => {
      if (!raw || typeof raw !== "object") return null;
      const r = raw as Record<string, unknown>;
      const total = parseRupiah(r.total);
      // Without a positive amount the row is meaningless as an expense.
      if (total == null || total <= 0) return null;
      const merchant =
        typeof r.merchant === "string" && r.merchant.trim()
          ? r.merchant.trim()
          : null;
      return {
        merchant,
        date: normalizeDate(r.date),
        total,
        currency: "IDR",
        category: normalizeCategory(r.category),
        items: normalizeItems(r.items),
      };
    })
    .filter((x): x is ImportedRow => x !== null);
}
