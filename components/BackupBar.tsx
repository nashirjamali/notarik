"use client";

import { useRef, useState } from "react";
import { exportTransactions, readSpreadsheet } from "@/lib/excel";
import type { ImportedRow } from "@/lib/importer";
import { todayISO } from "@/lib/format";
import { newId } from "@/lib/id";
import type { Transaction } from "@/lib/types";
import { AlertIcon, RefreshIcon, UploadIcon } from "./icons";
import { Button } from "@/components/ui";

type ImportMode = "merge" | "replace";

type Props = {
  txs: Transaction[];
  onApply: (rows: Transaction[], mode: ImportMode) => void;
  onToast: (message: string) => void;
};

type Phase =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "review"; rows: Transaction[]; skipped: number }
  | { kind: "error"; message: string };

function toTransaction(r: ImportedRow): Transaction {
  return {
    id: newId(),
    merchant: r.merchant ?? "Imported expense",
    date: r.date ?? todayISO(),
    total: r.total ?? 0,
    currency: "IDR",
    category: r.category,
    items: r.items,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Backup: export to .xlsx, or import from any .xlsx/.csv. Import runs the sheet
 * through the AI mapper so columns can be named or ordered anything, then asks
 * whether to merge or replace before touching saved data. (PRODUCT.md F8/F9)
 */
export function BackupBar({ txs, onApply, onToast }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  function handleExport() {
    if (txs.length === 0) return;
    exportTransactions(txs);
    onToast(`Exported ${txs.length} expense${txs.length > 1 ? "s" : ""}`);
  }

  async function handleFile(file: File) {
    setPhase({ kind: "working" });
    try {
      const { rows } = await readSpreadsheet(file);
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase({ kind: "error", message: data?.error ?? "Import failed." });
        return;
      }
      const mapped = (data.imported as ImportedRow[]).map(toTransaction);
      if (mapped.length === 0) {
        setPhase({
          kind: "error",
          message: "No expenses found in that file. Check it lists an amount per row.",
        });
        return;
      }
      setPhase({ kind: "review", rows: mapped, skipped: data.skipped ?? 0 });
    } catch (e) {
      setPhase({
        kind: "error",
        message:
          e instanceof Error ? e.message : "Couldn't read that file. Try .xlsx or .csv.",
      });
    }
  }

  function apply(mode: ImportMode) {
    if (phase.kind !== "review") return;
    onApply(phase.rows, mode);
    const n = phase.rows.length;
    onToast(
      mode === "replace"
        ? `Replaced with ${n} imported expense${n > 1 ? "s" : ""}`
        : `Added ${n} imported expense${n > 1 ? "s" : ""}`,
    );
    setPhase({ kind: "idle" });
  }

  return (
    <section
      aria-labelledby="backup-heading"
      className="rounded-xl border border-neutral-200 bg-neutral-100 p-5 sm:p-6"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="backup-heading" className="text-sm font-medium text-neutral-900">
            Backup &amp; restore
          </h2>
          <p className="mt-0.5 max-w-[48ch] text-xs leading-relaxed text-neutral-500">
            Save a spreadsheet copy, or import one in any layout — the importer
            reads the columns for you.
          </p>
        </div>

        {phase.kind === "working" ? (
          <p className="inline-flex shrink-0 items-center gap-2 text-sm text-neutral-500">
            <RefreshIcon size={16} className="animate-spin" />
            Reading your file…
          </p>
        ) : (
          <div className="flex shrink-0 gap-2.5">
            <Button
              type="button"
              variant="white"
              size="small"
              onClick={handleExport}
              disabled={txs.length === 0}
            >
              Export
            </Button>
            <Button
              type="button"
              variant="white"
              size="small"
              onClick={() => inputRef.current?.click()}
              iconLeft={<UploadIcon size={16} />}
            >
              Import
            </Button>
          </div>
        )}
      </div>

      {phase.kind === "review" && (
        <div className="mt-5 rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-900">
            Found{" "}
            <span className="font-medium">
              {phase.rows.length} expense{phase.rows.length > 1 ? "s" : ""}
            </span>{" "}
            in that file
            {phase.skipped > 0 && (
              <span className="text-neutral-500">
                {" "}
                · {phase.skipped} row{phase.skipped > 1 ? "s" : ""} skipped
              </span>
            )}
            .
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {txs.length > 0
              ? "Add them to your current expenses, or replace everything with this file?"
              : "Add them to your expenses?"}
          </p>
          <div className="mt-4 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="stroke"
              size="small"
              onClick={() => setPhase({ kind: "idle" })}
            >
              Cancel
            </Button>
            {txs.length > 0 && (
              <Button
                type="button"
                variant="stroke-red"
                size="small"
                onClick={() => apply("replace")}
              >
                Replace all
              </Button>
            )}
            <Button type="button" size="small" onClick={() => apply("merge")}>
              {txs.length > 0 ? "Add to existing" : "Import"}
            </Button>
          </div>
        </div>
      )}

      {phase.kind === "error" && (
        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-danger-100/25 p-3.5 text-sm text-danger-500">
          <span className="mt-0.5 shrink-0">
            <AlertIcon size={16} />
          </span>
          <div className="flex-1">
            <p className="leading-relaxed">{phase.message}</p>
            <button
              type="button"
              onClick={() => setPhase({ kind: "idle" })}
              className="mt-1.5 text-xs font-medium underline-offset-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
