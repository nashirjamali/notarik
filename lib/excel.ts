import * as XLSX from "xlsx";
import { formatDate } from "./format";
import type { Item, Transaction } from "./types";

const SHEET_NAME = "Expenses";

function unitPrice(item: Item): number | null {
  const total = item.price;
  const qty = item.qty;
  if (total == null || qty == null || qty <= 0) return null;
  return Math.round(total / qty);
}

function itemRows(tx: Transaction) {
  const loggedAt = formatDate(tx.createdAt.slice(0, 10));
  if (tx.items.length === 0) {
    return [
      {
        Date: tx.date,
        Merchant: tx.merchant,
        Item: "",
        Qty: null as number | null,
        Price: null as number | null,
        Total: tx.total,
        Category: tx.category,
        Currency: tx.currency,
        "Logged at": loggedAt,
      },
    ];
  }
  return tx.items.map((item) => ({
    Date: tx.date,
    Merchant: tx.merchant,
    Item: item.name,
    Qty: item.qty ?? null,
    Price: unitPrice(item),
    Total: item.price ?? null,
    Category: tx.category,
    Currency: tx.currency,
    "Logged at": loggedAt,
  }));
}

export function exportTransactions(txs: Transaction[]): void {
  const rows = txs
    .flatMap(itemRows)
    .sort((a, b) => {
      const byDate = a.Date.localeCompare(b.Date);
      if (byDate !== 0) return byDate;
      const byMerchant = a.Merchant.localeCompare(b.Merchant);
      if (byMerchant !== 0) return byMerchant;
      return a.Item.localeCompare(b.Item);
    });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 12 },
    { wch: 28 },
    { wch: 32 },
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 9 },
    { wch: 14 },
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
