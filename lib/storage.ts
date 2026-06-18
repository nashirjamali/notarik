import type { Transaction } from "./types";

const KEY = "notarik.transactions.v1";

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

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
