import { CATEGORIES, type Category, type ExtractionResult, type Item } from "./types";

export const EXTRACTION_PROMPT = `You are a precise receipt-reading assistant. Read the attached receipt image and return STRICT JSON ONLY — no prose, no markdown, no code fences.

Return exactly this shape:
{
  "merchant": string | null,
  "date": "YYYY-MM-DD" | null,
  "total": number | null,
  "currency": "IDR",
  "category": "Groceries" | "Dining" | "Transport" | "Shopping" | "Bills" | "Other",
  "items": [{ "name": string, "qty": number, "price": number }]
}

Rules:
- "total" MUST be the FINAL PAYABLE AMOUNT (grand total / amount due / total after tax and service charge) — NEVER the subtotal. If several totals appear, choose the largest "total / amount due" line, not the subtotal.
- Amounts are Indonesian Rupiah. Return plain integers with no separators, currency symbols, or decimals (e.g. 45000, not "Rp 45.000").
- If a field cannot be read with confidence, return null for it (use null for merchant/date/total; for items, omit unreadable rows). Do NOT guess.
- "category" must be exactly one of the six listed values; pick the best fit. If unsure, use "Other".
- "date" must be ISO format YYYY-MM-DD. If absent or unreadable, null.
Return JSON only.`;

/** Strip ```json fences / leading prose the model may wrap around the JSON. */
function extractJsonBlock(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

export function toNumberOrNull(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function normalizeCategory(v: unknown): Category {
  if (typeof v === "string") {
    const match = CATEGORIES.find(
      (c) => c.toLowerCase() === v.trim().toLowerCase(),
    );
    if (match) return match;
  }
  return "Other";
}

export function normalizeDate(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const m = v.match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[0] : null;
}

export function normalizeItems(v: unknown): Item[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((raw): Item | null => {
      if (!raw || typeof raw !== "object") return null;
      const r = raw as Record<string, unknown>;
      const name = typeof r.name === "string" ? r.name.trim() : "";
      if (!name) return null;
      const qty = toNumberOrNull(r.qty);
      const price = toNumberOrNull(r.price);
      return {
        name,
        ...(qty != null ? { qty } : {}),
        ...(price != null ? { price } : {}),
      };
    })
    .filter((x): x is Item => x !== null);
}

/**
 * Parse the model's raw text response into a validated ExtractionResult.
 * Throws if no JSON object can be recovered at all.
 */
export function parseExtraction(rawText: string): ExtractionResult {
  const block = extractJsonBlock(rawText);
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(block);
  } catch {
    throw new Error("Model did not return readable JSON.");
  }

  const merchant =
    typeof obj.merchant === "string" && obj.merchant.trim()
      ? obj.merchant.trim()
      : null;

  return {
    merchant,
    date: normalizeDate(obj.date),
    total: toNumberOrNull(obj.total),
    currency: "IDR",
    category: normalizeCategory(obj.category),
    items: normalizeItems(obj.items),
  };
}
