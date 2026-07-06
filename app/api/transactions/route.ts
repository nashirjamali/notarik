import { requireAuth } from "@/lib/auth-request";
import {
  deleteTransaction,
  insertTransaction,
  listTransactions,
  mergeTransactions,
  replaceTransactions,
} from "@/lib/data";
import type { Transaction } from "@/lib/types";

export const runtime = "nodejs";

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== "object") return false;
  const tx = value as Record<string, unknown>;
  return (
    typeof tx.id === "string" &&
    typeof tx.merchant === "string" &&
    typeof tx.date === "string" &&
    typeof tx.total === "number" &&
    tx.currency === "IDR" &&
    typeof tx.category === "string" &&
    Array.isArray(tx.items) &&
    typeof tx.createdAt === "string"
  );
}

export async function GET(): Promise<Response> {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  try {
    const transactions = await listTransactions(auth.supabase);
    return Response.json({ transactions });
  } catch (err) {
    console.error("list transactions", err);
    return Response.json(
      { error: "Could not load expenses.", code: "db_error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body.", code: "bad_request" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body.", code: "bad_request" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;

  if (payload.mode === "merge" || payload.mode === "replace") {
    if (!Array.isArray(payload.transactions)) {
      return Response.json({ error: "Invalid transactions.", code: "bad_request" }, { status: 400 });
    }
    const txs = payload.transactions.filter(isTransaction);
    if (txs.length === 0) {
      return Response.json({ error: "No valid transactions.", code: "bad_request" }, { status: 400 });
    }
    try {
      const transactions =
        payload.mode === "replace"
          ? await replaceTransactions(auth.supabase, auth.user.id, txs)
          : await mergeTransactions(auth.supabase, auth.user.id, txs);
      return Response.json({ transactions });
    } catch (err) {
      console.error("bulk transactions", err);
      return Response.json(
        { error: "Could not save expenses.", code: "db_error" },
        { status: 500 },
      );
    }
  }

  if (!isTransaction(payload)) {
    return Response.json({ error: "Invalid transaction.", code: "bad_request" }, { status: 400 });
  }

  try {
    await insertTransaction(auth.supabase, auth.user.id, payload);
    const transactions = await listTransactions(auth.supabase);
    return Response.json({ transactions });
  } catch (err) {
    console.error("insert transaction", err);
    return Response.json(
      { error: "Could not save expense.", code: "db_error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing id.", code: "bad_request" }, { status: 400 });
  }

  try {
    const removed = await deleteTransaction(auth.supabase, id);
    if (!removed) {
      return Response.json({ error: "Expense not found.", code: "not_found" }, { status: 404 });
    }
    const transactions = await listTransactions(auth.supabase);
    return Response.json({ transactions });
  } catch (err) {
    console.error("delete transaction", err);
    return Response.json(
      { error: "Could not delete expense.", code: "db_error" },
      { status: 500 },
    );
  }
}
