import * as XLSX from "xlsx";
import { formatDate } from "./format";
import type { Transaction } from "./types";

const SHEET_NAME = "Expenses";

/** Flatten a transaction's line items into one human-readable cell. */
function itemsToCell(tx: Transaction): string {
  return tx.items
    .map((it) => {
      const qty = it.qty && it.qty > 1 ? `${it.qty}× ` : "";
      const price = it.price != null ? ` (${it.price})` : "";
      return `${qty}${it.name}${price}`;
    })
    .join("; ");
}

/**
 * Export all transactions to a downloadable .xlsx. Columns are human-first
 * (Date, Merchant, …) so the file reads as a normal expense sheet — and still
 * re-imports cleanly because the AI importer maps any header layout.
 */
export function exportTransactions(txs: Transaction[]): void {
  const rows = txs.map((tx) => ({
    Date: tx.date,
    Merchant: tx.merchant,
    Category: tx.category,
    Total: tx.total,
    Currency: tx.currency,
    Items: itemsToCell(tx),
    "Logged at": formatDate(tx.createdAt.slice(0, 10)),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 12 }, // Date
    { wch: 28 }, // Merchant
    { wch: 12 }, // Category
    { wch: 12 }, // Total
    { wch: 9 }, // Currency
    { wch: 48 }, // Items
    { wch: 14 }, // Logged at
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, SHEET_NAME);
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `notarik-expenses-${stamp}.xlsx`);
}

export interface ParsedSheet {
  /** Detected column headers, in order. */
  headers: string[];
  /** Rows keyed by header. Empty cells are null. */
  rows: Record<string, unknown>[];
}

/**
 * Read an uploaded .xlsx / .csv into plain rows. Layout-agnostic on purpose —
 * the AI importer figures out which columns mean what, so we don't assume a
 * schema here. Reads the first non-empty sheet.
 */
export async function readSpreadsheet(file: File): Promise<ParsedSheet> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const sheetName =
    wb.SheetNames.find((n) => {
      const ref = wb.Sheets[n]?.["!ref"];
      return ref && ref !== "A1";
    }) ?? wb.SheetNames[0];

  if (!sheetName) throw new Error("This file has no readable sheets.");

  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: null,
    raw: true,
  });
  if (rows.length === 0) throw new Error("That sheet looks empty.");

  const headers = Object.keys(rows[0] ?? {});
  return { headers, rows };
}
