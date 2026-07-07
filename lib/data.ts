import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import type { Transaction } from "./types";

type TransactionRow = {
  id: string;
  merchant: string;
  date: string;
  total: number;
  currency: string;
  category: string;
  items: unknown;
  created_at: string;
  image_thumb: string | null;
};

const TRANSACTION_COLUMNS =
  "id, merchant, date, total, currency, category, items, created_at, image_thumb";

async function currentUserId(supabase: SupabaseClient): Promise<string> {
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) throw new Error("Not authenticated.");
  return userId;
}

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    merchant: row.merchant,
    date: String(row.date).slice(0, 10),
    total: row.total,
    currency: "IDR",
    category: row.category as Transaction["category"],
    items: Array.isArray(row.items) ? (row.items as Transaction["items"]) : [],
    createdAt: new Date(row.created_at).toISOString(),
    ...(row.image_thumb ? { imageThumb: row.image_thumb } : {}),
  };
}

function toRow(tx: Transaction, userId: string) {
  return {
    id: tx.id,
    user_id: userId,
    merchant: tx.merchant,
    date: tx.date,
    total: tx.total,
    currency: tx.currency,
    category: tx.category,
    items: tx.items,
    created_at: tx.createdAt,
    image_thumb: tx.imageThumb ?? null,
  };
}

export async function listTransactions(): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(TRANSACTION_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => rowToTransaction(row as TransactionRow));
}

export async function insertTransaction(tx: Transaction): Promise<Transaction> {
  const supabase = await createClient();
  const userId = await currentUserId(supabase);
  const { error } = await supabase.from("transactions").insert(toRow(tx, userId));
  if (error) throw error;
  return tx;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function replaceTransactions(txs: Transaction[]): Promise<Transaction[]> {
  const supabase = await createClient();
  const userId = await currentUserId(supabase);
  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("user_id", userId);
  if (deleteError) throw deleteError;
  if (txs.length > 0) {
    const { error } = await supabase
      .from("transactions")
      .insert(txs.map((tx) => toRow(tx, userId)));
    if (error) throw error;
  }
  return txs;
}

export async function mergeTransactions(txs: Transaction[]): Promise<Transaction[]> {
  const supabase = await createClient();
  const userId = await currentUserId(supabase);
  const { error } = await supabase
    .from("transactions")
    .upsert(txs.map((tx) => toRow(tx, userId)), { onConflict: "id" });
  if (error) throw error;
  return listTransactions();
}

export async function loadBudget(): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget")
    .select("monthly_total")
    .maybeSingle();
  if (error) throw error;
  const val = data?.monthly_total;
  return typeof val === "number" && val > 0 ? val : null;
}

export async function saveBudget(monthlyTotal: number | null): Promise<number | null> {
  const supabase = await createClient();
  const userId = await currentUserId(supabase);
  const next = monthlyTotal != null && monthlyTotal > 0 ? monthlyTotal : null;
  const { error } = await supabase
    .from("budget")
    .upsert({ user_id: userId, monthly_total: next }, { onConflict: "user_id" });
  if (error) throw error;
  return next;
}
