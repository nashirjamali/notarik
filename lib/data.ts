import { ensureDb } from "./db";
import type { Transaction } from "./types";

type TransactionRow = {
  id: string;
  merchant: string;
  date: Date | string;
  total: number;
  currency: "IDR";
  category: string;
  items: unknown;
  created_at: Date;
  image_thumb: string | null;
};

function formatDate(value: Date | string): string {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    merchant: row.merchant,
    date: formatDate(row.date),
    total: row.total,
    currency: "IDR",
    category: row.category as Transaction["category"],
    items: Array.isArray(row.items) ? (row.items as Transaction["items"]) : [],
    createdAt: row.created_at.toISOString(),
    ...(row.image_thumb ? { imageThumb: row.image_thumb } : {}),
  };
}

export async function listTransactions(): Promise<Transaction[]> {
  const db = await ensureDb();
  const { rows } = await db.query<TransactionRow>(
    `SELECT id, merchant, date, total, currency, category, items, created_at, image_thumb
     FROM transactions
     ORDER BY created_at DESC`,
  );
  return rows.map(rowToTransaction);
}

export async function insertTransaction(tx: Transaction): Promise<Transaction> {
  const db = await ensureDb();
  await db.query(
    `INSERT INTO transactions (id, merchant, date, total, currency, category, items, created_at, image_thumb)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      tx.id,
      tx.merchant,
      tx.date,
      tx.total,
      tx.currency,
      tx.category,
      JSON.stringify(tx.items),
      tx.createdAt,
      tx.imageThumb ?? null,
    ],
  );
  return tx;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const db = await ensureDb();
  const { rowCount } = await db.query(`DELETE FROM transactions WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}

export async function replaceTransactions(txs: Transaction[]): Promise<Transaction[]> {
  const db = await ensureDb();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM transactions");
    for (const tx of txs) {
      await client.query(
        `INSERT INTO transactions (id, merchant, date, total, currency, category, items, created_at, image_thumb)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          tx.id,
          tx.merchant,
          tx.date,
          tx.total,
          tx.currency,
          tx.category,
          JSON.stringify(tx.items),
          tx.createdAt,
          tx.imageThumb ?? null,
        ],
      );
    }
    await client.query("COMMIT");
    return txs;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function mergeTransactions(txs: Transaction[]): Promise<Transaction[]> {
  const db = await ensureDb();
  for (const tx of txs) {
    await db.query(
      `INSERT INTO transactions (id, merchant, date, total, currency, category, items, created_at, image_thumb)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        tx.id,
        tx.merchant,
        tx.date,
        tx.total,
        tx.currency,
        tx.category,
        JSON.stringify(tx.items),
        tx.createdAt,
        tx.imageThumb ?? null,
      ],
    );
  }
  return listTransactions();
}

export async function loadBudget(): Promise<number | null> {
  const db = await ensureDb();
  const { rows } = await db.query<{ monthly_total: number | null }>(
    `SELECT monthly_total FROM budget WHERE id = 1`,
  );
  const val = rows[0]?.monthly_total;
  return typeof val === "number" && val > 0 ? val : null;
}

export async function saveBudget(monthlyTotal: number | null): Promise<number | null> {
  const db = await ensureDb();
  const next = monthlyTotal != null && monthlyTotal > 0 ? monthlyTotal : null;
  await db.query(`UPDATE budget SET monthly_total = $1 WHERE id = 1`, [next]);
  return next;
}
