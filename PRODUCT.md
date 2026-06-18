# Notarik — Product Specification

**Version:** 0.1 (prototype scope)
**Author:** Nashir Jamali
**Context:** Web product that solves a real problem in ~1 day.

---

## 1. Problem statement

Recording personal expenses from paper receipts is manual and tedious. Today the process is: collect receipts → type each one into a spreadsheet, line by line → manually total and categorize. This is especially painful after groceries or eating out, where a single receipt has many items. If receipts aren't logged immediately, the details are forgotten and the recap becomes incomplete or gets abandoned entirely.

**The pain in one sentence:** the data-entry step kills the habit of tracking spending.

---

## 2. Goal & non-goals

**Goal:** Remove the manual data-entry step. A user photographs a receipt and gets a correct, categorized expense entry, plus a running per-category recap — with as little typing as possible.

**Non-goals (for this prototype):**
- Not a full budgeting / accounting suite (no bank sync, no budgets, no forecasting).
- Not multi-user or team expense management.
- Not a bill-splitting app (deferred — see §9).

---

## 3. Target user

A working individual who *wants* to track personal spending but gives up because manual entry is too tedious. Tech-comfortable, uses a phone to photograph receipts, recaps spending periodically (weekly/monthly). Primary spend categories: groceries and dining out.

**Primary persona:** "Me" — recaps expenses, currently in Excel, frustrated by manual entry. Authentic primary user = the builder.

---

## 4. The core job (what it must do well)

> Turn a receipt photo into a correct, categorized expense entry with near-zero typing.

Success on this single job is the whole bet. If extraction is accurate and the recap is useful, the product works. Everything else is secondary.

---

## 5. Core user flow

1. **Open app** → see the recap dashboard (empty state on first use).
2. **Add receipt** → upload a photo or use the device camera.
3. **Processing** → image is sent to AI vision; a loading state is shown.
4. **Review extracted entry** → app shows merchant, date, total, items, and an auto-assigned category. User can accept or quickly correct the category/total.
5. **Save** → entry is added to the list and the per-category recap updates.
6. **View recap** → list of all transactions + a per-category summary (amounts + a simple chart).

**Critical path that must not break:** step 2 → 3 → 4 (photo → extraction → reviewable entry). This is the product.

---

## 6. Features

### Must-have (prototype core)
| # | Feature | Notes |
|---|---------|-------|
| F1 | Receipt upload / camera capture | Accept common image formats; mobile-friendly. |
| F2 | AI vision extraction | Extract merchant, date, line items, **final payable total**. |
| F3 | Auto-categorization | Assign one category from a small fixed set. |
| F4 | Review & correct | User can fix category and total before saving. |
| F5 | Transaction list | All saved entries, newest first. |
| F6 | Per-category recap | Totals per category + one simple chart. |
| F7 | Local persistence | Data survives refresh (local storage). |
| F8 | Export to Excel | Download all transactions as .xlsx — manual backup against local-storage loss. |
| F9 | Import from Excel | Restore transactions from a previously exported .xlsx. |

### Should-have (only if time allows — strong value, but not the core loop)
| # | Feature | Notes |
|---|---------|-------|
| F10 | Budget tracking | User sets a monthly budget per category (e.g. groceries, dining). Recap shows spent vs budget: remaining or over, in **both nominal (IDR) and percentage**, with a clear surplus/deficit indicator. |
| F11 | Spend projection | A simple simulation: based on the current recap's run-rate, estimate likely spend in ~2 and ~4 months. Clearly labelled as an estimate (see §8b). |
| F12 | Delete an entry | Basic data management. |
| F13 | Per-item view | Expand a transaction to see line items. |

### Won't-have (this prototype — stated deliberately)
- Split bill.
- Auth / accounts / sync.
- Multi-currency, full-text search.

> **Priority note (read before building):** F1–F9 are the core. The backup pair (F8/F9) is worth doing because it removes a real data-loss risk that local storage introduces — and it's cheap. Budget (F10) and projection (F11) add great product value and make the recap forward-looking, **but only build them once the core loop is solid and shipped.** It is better to ship F1–F9 polished than F1–F11 half-working. If time runs short, F10/F11 move to "what I'd do next" in the README — which is itself a strong scoping signal.

---

## 7. Data model (prototype)

```
Transaction {
  id: string
  merchant: string
  date: string (ISO)
  total: number
  currency: "IDR"
  category: enum (Groceries | Dining | Transport | Shopping | Bills | Other)
  items: Item[]
  createdAt: string (ISO)
  imageThumb?: string (optional, for reference)
}

Item {
  name: string
  qty?: number
  price?: number
}

Budget {
  category: enum (same set as Transaction.category)
  monthlyLimit: number   // in IDR
}
```

Stored in local storage as JSON. No backend database for the prototype.

---

## 8. AI extraction contract

The single most important technical detail: **the model must return the final payable total, not a subtotal.** Many receipts list a subtotal, then tax/service, then the grand total — getting this wrong corrupts every category figure.

The vision model is prompted to return **strict JSON only** with this shape:

```json
{
  "merchant": "string",
  "date": "YYYY-MM-DD or null",
  "total": 0,
  "currency": "IDR",
  "category": "Groceries | Dining | Transport | Shopping | Bills | Other",
  "items": [{ "name": "string", "qty": 1, "price": 0 }]
}
```

Handling rules:
- If the total is ambiguous, prefer the largest "amount due / total" line, not the subtotal.
- If a field can't be read, return null rather than guessing.
- The response is parsed defensively (strip code fences, validate shape) before use.

---

## 8b. Budget logic (F10)

The user sets **one optional total monthly limit** for all spending — not a limit per category. Categories are still auto-assigned per receipt and shown for visibility, but the user budgets their month as a whole. For the current calendar month:

```
spent      = sum of ALL of this month's transactions
remaining  = monthlyLimit - spent
percentUsed = spent / monthlyLimit * 100
status:
  - "on track"   if percentUsed < 80
  - "near limit" if 80 <= percentUsed <= 100
  - "over"       if percentUsed > 100   (deficit)
```

Display: total spent vs limit, remaining/over in **both IDR and %**, and a clear surplus/deficit indicator (e.g. green = remaining, amber = near, red = over). Beneath the headline, this month's spend is broken down per category for visibility (read-only — categories are not individually budgeted). When no budget is set, nothing is tracked. All math is purely arithmetic on the user's own data — no prediction here.

> **Design note:** an earlier draft budgeted each category separately. The single-total model was chosen because the user wants to cap their overall monthly spend without micro-managing per-category limits, while still *seeing* where the money goes. Stored as one number (`notarik.budget.v1`).

---

## 8c. Spend projection (F11) — clearly a simulation, not a forecast

A lightweight "what-if" estimate, **explicitly labelled as a rough projection, not a guarantee.** It extrapolates the user's current run-rate forward.

```
dailyRate   = totalSpentSoFar / numberOfDaysCovered
projected2m = dailyRate * 60
projected4m = dailyRate * 120
```

**Honesty constraints (important — this is a financial-ish feature):**
- Label it plainly, e.g. "Estimated if your current pace continues" — never "you will spend".
- Show the assumption (based on N days of data) so the user can judge it.
- Require a minimum amount of data (e.g. at least ~7 days / a handful of transactions) before showing a projection; below that, show "not enough data yet" instead of a misleading number.
- It is a straight-line extrapolation only. It does not model seasonality, one-off purchases, or income — and the UI should say so in one line.

> Rationale: a projection that looks authoritative but is based on three receipts would mislead the user about their own finances. Keeping it visibly rough and assumption-stating is the responsible design — and it's a good thing to call out in the README's "where I didn't have answers / what I assumed" section.

---

## 9. Backup & restore (F8 / F9)

Local storage can be cleared by the browser, so the prototype offers a manual safety net:

- **Export to Excel (F8):** download all transactions as an `.xlsx` file. Columns: date, merchant, category, total, currency, items (flattened), createdAt.
- **Import from Excel (F9):** upload a previously exported `.xlsx` to restore. On import, validate columns and either merge or replace (ask the user which). Malformed rows are skipped with a count shown, rather than failing the whole import.

This is deliberately manual (user-triggered file, not cloud sync) — it removes the data-loss risk cheaply without needing accounts or a backend.

---

## 9b. Explicitly deferred: Split bill

Split bill is a real, wanted need but is its own feature (assign items to people, handle shared items, compute each person's share incl. tax/service). Including it now would compromise the core loop. It is the #1 "what I'd do next" item and one of the open user questions: do users want to split *inside* the app, or just record their own share?

---

## 10. Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js + TypeScript | Fast to build, trivial Vercel deploy, plays to my strengths. |
| Styling | Tailwind CSS | Speed. |
| AI vision | Google Gemini (vision) | Strong receipt OCR, generous free tier, simple setup. |
| API | Next.js API route | Keeps the Gemini key server-side, never in the browser. |
| Charts | Recharts | Quick category chart. |
| Excel I/O | SheetJS (xlsx) | Read/write .xlsx for export & import (F8/F9). |
| Persistence | Local storage | Sufficient to prove the loop; no auth needed. |
| Hosting | Vercel | Required public live URL; one-command deploy. |

**Security note:** the Gemini API key lives only in a server-side environment variable and is never exposed to the client.

---

## 11. Success criteria

**For the test (definition of done):**
- Live URL opens and works.
- Repo runs from the README.
- Delivered within the 48-hour window.

**For the product (how I'd know it's working):**
- Extracted total is correct on the large majority of clear receipts (user rarely corrects it).
- A user keeps logging receipts instead of abandoning after a few — i.e. it becomes a habit.

---

## 12. Risks & assumptions

- **Receipt legibility varies** (thermal fade, crumpling, non-standard layouts). Assumption: reasonably legible printed receipts; best-effort extraction with the total prioritized.
- **Extraction errors** will happen → mitigated by the review-and-correct step (F4).
- **Category accuracy** is heuristic → user can override.
- **Single currency (IDR)** assumed for the prototype.

---

## 13. Build order (to fit 48h + produce real commit history)

**Core loop first — ship this much no matter what:**
1. Scaffold Next.js + Tailwind, empty dashboard. *(commit)*
2. Upload / camera capture UI + image preview. *(commit)*
3. Gemini API route + extraction prompt; log raw output. *(commit)*
4. Parse + review screen (show extracted entry). *(commit)*
5. Save to local storage + transaction list. *(commit)*
6. Per-category recap + chart. *(commit)*

**Then the cheap, high-value safety net:**
7. Export to Excel + import from Excel (F8/F9). *(commit)*

**Then, only if the above is solid:**
8. Budget per category + spent/remaining vs budget (F10). *(commit)*
9. Spend projection / simulation, with assumptions shown (F11). *(commit)*

**Always finish with:**
10. Empty/loading/error states + polish. *(commit)*
11. README finalize + deploy to Vercel. *(commit)*

> If you run out of time after step 7, stop there and move F10/F11 into the README's "what I'd do next." A polished app through step 7 beats a buggy one through step 9.