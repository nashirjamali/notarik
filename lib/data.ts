import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction } from "./types";

type TransactionRow = {
  id: string;
  merchant: string;
  date: string;
  total: number;
  currency: "IDR";
  category: string;
  items: unknown;
  created_at: string;
  image_thumb: string | null;
};

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    merchant: row.merchant,
    date: row.date.slice(0, 10),
    total: row.total,
    currency: "IDR",
    category: row.category as Transaction["category"],
    items: Array.isArray(row.items) ? (row.items as Transaction["items"]) : [],
    createdAt: row.created_at,
    ...(row.image_thumb ? { imageThumb: row.image_thumb } : {}),
  };
}

export async function listTransactions(supabase: SupabaseClient): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, merchant, date, total, currency, category, items, created_at, image_thumb")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToTransaction);
}

export async function insertTransaction(
  supabase: SupabaseClient,
  userId: string,
  tx: Transaction,
): Promise<Transaction> {
  const { error } = await supabase.from("transactions").insert({
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
  });

  if (error) throw error;
  return tx;
}

export async function deleteTransaction(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("transactions")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function replaceTransactions(
  supabase: SupabaseClient,
  userId: string,
  txs: Transaction[],
): Promise<Transaction[]> {
  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("user_id", userId);

  if (deleteError) throw deleteError;

  if (txs.length === 0) return [];

  const { error: insertError } = await supabase.from("transactions").insert(
    txs.map((tx) => ({
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
    })),
  );

  if (insertError) throw insertError;
  return txs;
}

export async function mergeTransactions(
  supabase: SupabaseClient,
  userId: string,
  txs: Transaction[],
): Promise<Transaction[]> {
  if (txs.length > 0) {
    const { error } = await supabase.from("transactions").insert(
      txs.map((tx) => ({
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
      })),
    );

    if (error) throw error;
  }

  return listTransactions(supabase);
}

export async function loadBudget(supabase: SupabaseClient): Promise<number | null> {
  const { data, error } = await supabase
    .from("budget")
    .select("monthly_total")
    .maybeSingle();

  if (error) throw error;
  const val = data?.monthly_total;
  return typeof val === "number" && val > 0 ? val : null;
}

export async function saveBudget(
  supabase: SupabaseClient,
  userId: string,
  monthlyTotal: number | null,
): Promise<number | null> {
  const next = monthlyTotal != null && monthlyTotal > 0 ? monthlyTotal : null;
  const { error } = await supabase.from("budget").upsert({
    user_id: userId,
    monthly_total: next,
  });

  if (error) throw error;
  return next;
}
