import type { Transaction } from "./types";

const KEY = "notarik.transactions.v1";
const BUDGET_KEY = "notarik.budgets.v1";

/** Read all saved transactions, newest first. Resilient to corrupt storage. */
export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Transaction[];
  } catch {
    return [];
  }
}

function persist(list: Transaction[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

/** Prepend a transaction and persist. Returns the updated list. */
export function addTransaction(tx: Transaction): Transaction[] {
  const list = [tx, ...loadTransactions()];
  persist(list);
  return list;
}

/** Remove a transaction by id and persist. Returns the updated list. */
export function deleteTransaction(id: string): Transaction[] {
  const list = loadTransactions().filter((t) => t.id !== id);
  persist(list);
  return list;
}

/**
 * A single total monthly budget (IDR), or null if none is set. Categories are
 * auto-assigned per receipt and shown for visibility, but the limit is one
 * overall number — the user budgets their month, not each category.
 */
export function loadBudget(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BUDGET_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const val = typeof parsed === "number" ? parsed : parsed?.monthlyTotal;
    return typeof val === "number" && val > 0 ? val : null;
  } catch {
    return null;
  }
}

export function saveBudget(monthlyTotal: number | null): number | null {
  if (monthlyTotal == null || monthlyTotal <= 0) {
    window.localStorage.removeItem(BUDGET_KEY);
    return null;
  }
  window.localStorage.setItem(BUDGET_KEY, JSON.stringify({ monthlyTotal }));
  return monthlyTotal;
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
