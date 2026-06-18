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
