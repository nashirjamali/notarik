import { CATEGORIES, type Category, type Transaction } from "./types";

/** One category's slice of the recap. */
export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
  /** 0–1 share of the grand total. */
  share: number;
}

/**
 * Per-category totals over the given transactions, largest first.
 * Empty categories are dropped — the recap only shows where money went.
 */
export function categoryTotals(txs: Transaction[]): CategoryTotal[] {
  const sums = new Map<Category, { total: number; count: number }>();
  for (const tx of txs) {
    const prev = sums.get(tx.category) ?? { total: 0, count: 0 };
    sums.set(tx.category, { total: prev.total + tx.total, count: prev.count + 1 });
  }
  const grand = txs.reduce((s, t) => s + t.total, 0);
  return CATEGORIES.map((category) => {
    const s = sums.get(category);
    return s
      ? { category, total: s.total, count: s.count, share: grand > 0 ? s.total / grand : 0 }
      : null;
  })
    .filter((x): x is CategoryTotal => x !== null)
    .sort((a, b) => b.total - a.total);
}

export function grandTotal(txs: Transaction[]): number {
  return txs.reduce((s, t) => s + t.total, 0);
}

/** A transaction's month bucket, "YYYY-MM", or null if its date is unreadable. */
export function monthKeyOf(dateISO: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})/.exec(dateISO ?? "");
  return m ? `${m[1]}-${m[2]}` : null;
}

/** "2026-06" -> "June 2026". */
export function monthLabel(key: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(key);
  if (!m) return key;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function currentMonthKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Distinct months present in the data, newest first, with display labels. */
export function listMonths(
  txs: Transaction[],
): { key: string; label: string }[] {
  const keys = new Set<string>();
  for (const tx of txs) {
    const k = monthKeyOf(tx.date);
    if (k) keys.add(k);
  }
  return [...keys]
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({ key, label: monthLabel(key) }));
}

/** Transactions in a given "YYYY-MM" bucket. */
export function filterByMonth(txs: Transaction[], key: string): Transaction[] {
  return txs.filter((tx) => monthKeyOf(tx.date) === key);
}

/**
 * Recurring expenses (rent, subscriptions) whose most recent instance predates
 * the given month and hasn't been re-logged for it yet — one per merchant.
 */
export function dueRecurring(txs: Transaction[], monthKey: string): Transaction[] {
  const latestByMerchant = new Map<string, Transaction>();
  for (const tx of txs) {
    if (!tx.recurring) continue;
    const mk = monthKeyOf(tx.date);
    if (!mk || mk >= monthKey) continue;
    const existing = latestByMerchant.get(tx.merchant);
    if (!existing || tx.date > existing.date) latestByMerchant.set(tx.merchant, tx);
  }
  const loggedThisMonth = new Set(
    filterByMonth(txs, monthKey).map((tx) => tx.merchant),
  );
  return [...latestByMerchant.values()].filter((tx) => !loggedThisMonth.has(tx.merchant));
}

/** True when a transaction looks like a re-scan of an existing one (same merchant/date/total). */
export function isLikelyDuplicate(
  candidate: Pick<Transaction, "merchant" | "date" | "total">,
  existing: Transaction[],
): boolean {
  const merchant = candidate.merchant.trim().toLowerCase();
  return existing.some(
    (tx) =>
      tx.merchant.trim().toLowerCase() === merchant &&
      tx.date === candidate.date &&
      tx.total === candidate.total,
  );
}

/** A period the dashboard can scope to: everything, or one month. */
export type Period = "all" | string;

export function periodTxs(txs: Transaction[], period: Period): Transaction[] {
  return period === "all" ? txs : filterByMonth(txs, period);
}

export function periodLabel(period: Period): string {
  return period === "all" ? "All time" : monthLabel(period);
}

/** Transactions dated within the current calendar month (local time). */
export function thisMonth(txs: Transaction[], now = new Date()): Transaction[] {
  const y = now.getFullYear();
  const m = now.getMonth();
  return txs.filter((tx) => {
    const d = new Date(tx.date);
    return !Number.isNaN(d.getTime()) && d.getFullYear() === y && d.getMonth() === m;
  });
}

export type BudgetStatus = "on-track" | "near-limit" | "over";

export interface BudgetSummary {
  limit: number;
  spent: number;
  /** limit - spent; negative when over. */
  remaining: number;
  percentUsed: number;
  status: BudgetStatus;
}

function statusFor(percentUsed: number): BudgetStatus {
  return percentUsed > 100 ? "over" : percentUsed >= 80 ? "near-limit" : "on-track";
}

/**
 * The month against a single total budget. Categories are still tracked for
 * visibility (see {@link categoryTotals}), but the limit is one overall figure.
 */
export function budgetSummary(monthTxs: Transaction[], limit: number): BudgetSummary {
  const spent = grandTotal(monthTxs);
  const percentUsed = limit > 0 ? (spent / limit) * 100 : 0;
  return { limit, spent, remaining: limit - spent, percentUsed, status: statusFor(percentUsed) };
}

export interface Projection {
  /** True only when there is enough history to extrapolate honestly. */
  ready: boolean;
  daysCovered: number;
  txCount: number;
  dailyRate: number;
  projected2m: number;
  projected4m: number;
}

const MIN_DAYS = 7;
const MIN_TX = 5;

/**
 * Straight-line run-rate projection. Deliberately conservative: it refuses to
 * produce a number until there is a week of data and a handful of receipts,
 * because a confident figure built on three receipts would mislead the user
 * about their own money. (PRODUCT.md §8c)
 */
export function projectSpend(txs: Transaction[], now = new Date()): Projection {
  const dated = txs
    .map((t) => new Date(t.date))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  const total = grandTotal(txs);
  const earliest = dated[0];
  const dayMs = 86_400_000;
  const daysCovered = earliest
    ? Math.max(1, Math.round((now.getTime() - earliest.getTime()) / dayMs) + 1)
    : 0;
  const dailyRate = daysCovered > 0 ? total / daysCovered : 0;
  const ready = daysCovered >= MIN_DAYS && txs.length >= MIN_TX;

  return {
    ready,
    daysCovered,
    txCount: txs.length,
    dailyRate,
    projected2m: dailyRate * 60,
    projected4m: dailyRate * 120,
  };
}
