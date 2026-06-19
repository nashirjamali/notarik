"use client";

import { useEffect, useState } from "react";
import type { ExtractionResult, Transaction } from "@/lib/types";
import { prepareImage } from "@/lib/image";
import { pdfFirstPageToImage } from "@/lib/pdf";
import {
  addTransaction,
  addTransactions,
  deleteTransaction,
  loadBudget,
  loadTransactions,
  replaceTransactions,
  saveBudget,
} from "@/lib/storage";
import {
  type Period,
  currentMonthKey,
  filterByMonth,
  listMonths,
  monthLabel,
  periodLabel,
  periodTxs,
} from "@/lib/recap";
import { formatIDR } from "@/lib/format";
import { ReceiptUploader } from "@/components/ReceiptUploader";
import { ProcessingState } from "@/components/ProcessingState";
import { ReviewCard } from "@/components/ReviewCard";
import { Recap } from "@/components/Recap";
import { BudgetPanel } from "@/components/BudgetPanel";
import { Projection } from "@/components/Projection";
import { TransactionList } from "@/components/TransactionList";
import { BackupBar } from "@/components/BackupBar";
import { MonthSelector } from "@/components/MonthSelector";
import { Toast } from "@/components/Toast";
import { AlertIcon, RefreshIcon } from "@/components/icons";

type Stage = "idle" | "extracting" | "review" | "manual" | "error";

const BLANK_RESULT: ExtractionResult = {
  merchant: null,
  date: null,
  total: null,
  currency: "IDR",
  category: "Other",
  items: [],
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("idle");
  const [preview, setPreview] = useState<string>("");
  const [fullImage, setFullImage] = useState<string>("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string>("");
  const [toast, setToast] = useState<string>("");
  const [saved, setSaved] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<number | null>(null);
  const [period, setPeriod] = useState<Period>("all");

  useEffect(() => {
    // Mount-time hydration from localStorage. Deliberately not a lazy
    // initializer: that would render device data on the server-empty first
    // pass and cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(loadTransactions());
    setBudget(loadBudget());
  }, []);

  async function runExtraction(image: string) {
    setStage("extracting");
    setError("");
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong reading the receipt.");
        setStage("error");
        return;
      }
      setResult(data as ExtractionResult);
      setStage("review");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setStage("error");
    }
  }

  async function handleSelect(file: File) {
    setStage("extracting");
    setError("");
    try {
      // PDF e-receipts: render page 1 to an image, then use the same pipeline.
      const imageFile =
        file.type === "application/pdf" ? await pdfFirstPageToImage(file) : file;
      const { full, thumb } = await prepareImage(imageFile);
      setPreview(thumb);
      setFullImage(full);
      await runExtraction(full);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
      setStage("error");
    }
  }

  function handleManual() {
    setResult(BLANK_RESULT);
    setPreview("");
    setFullImage("");
    setError("");
    setStage("manual");
  }

  function handleSave(tx: Transaction) {
    const list = addTransaction(tx);
    setSaved(list);
    reset();
    setToast(`Saved ${formatIDR(tx.total)} to ${tx.category}`);
  }

  function handleDelete(id: string) {
    setSaved(deleteTransaction(id));
    setToast("Expense deleted");
  }

  function handleBudget(next: number | null) {
    setBudget(saveBudget(next));
  }

  function handleImport(rows: Transaction[], mode: "merge" | "replace") {
    setSaved(mode === "replace" ? replaceTransactions(rows) : addTransactions(rows));
  }

  function reset() {
    setStage("idle");
    setResult(null);
    setPreview("");
    setFullImage("");
    setError("");
  }

  const total = saved.reduce((s, t) => s + t.total, 0);
  const months = listMonths(saved);
  // Guard against a stale selection after the underlying month disappears.
  const activePeriod: Period =
    period === "all" || months.some((m) => m.key === period) ? period : "all";
  const shownTxs = periodTxs(saved, activePeriod);
  const budgetMonthKey = activePeriod === "all" ? currentMonthKey() : activePeriod;
  const budgetMonthTxs = filterByMonth(saved, budgetMonthKey);
  const budgetMonthLabel =
    activePeriod === "all" ? "This month" : monthLabel(activePeriod);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-8 sm:py-12">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-primary font-serif text-lg leading-none text-primary-ink">
            N
          </span>
          <span className="text-base font-semibold tracking-tight text-ink">
            Notarik
          </span>
        </div>
        {saved.length > 0 && (
          <div className="text-right">
            <p className="nums text-sm font-medium text-ink">{formatIDR(total)}</p>
            <p className="text-xs text-muted">
              {saved.length} expense{saved.length > 1 ? "s" : ""} logged
            </p>
          </div>
        )}
      </header>

      <main className="mt-10 flex-1">
        <section className="rounded-xl border border-border bg-bg p-5 shadow-[0_1px_3px_rgba(20,20,40,0.04)] sm:p-7">
          {stage === "idle" && (
            <ReceiptUploader onSelect={handleSelect} onManual={handleManual} />
          )}

          {stage === "extracting" && (
            <ProcessingState preview={preview || fullImage} />
          )}

          {stage === "review" && result && (
            <ReviewCard
              result={result}
              preview={preview || fullImage}
              onSave={handleSave}
              onRetake={reset}
            />
          )}

          {stage === "manual" && result && (
            <ReviewCard
              result={result}
              preview=""
              onSave={handleSave}
              onRetake={reset}
              manual
            />
          )}

          {stage === "error" && (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
                <AlertIcon size={24} />
              </span>
              <div className="space-y-1.5">
                <p className="font-serif text-xl tracking-tight text-ink">
                  We couldn&apos;t read that one
                </p>
                <p className="mx-auto max-w-[44ch] text-sm leading-relaxed text-muted">
                  {error}
                </p>
              </div>
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-md border border-border-strong bg-bg px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
                >
                  Choose another photo
                </button>
                {fullImage && (
                  <button
                    type="button"
                    onClick={() => runExtraction(fullImage)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-ink transition-colors hover:bg-primary-hover"
                  >
                    <RefreshIcon size={18} />
                    Try again
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {stage === "idle" && saved.length === 0 && (
          <>
            <p className="mt-6 text-center text-xs leading-relaxed text-muted">
              Your receipts are read on the server and never stored there.
              Expenses are saved on this device only.
            </p>
            <div className="mt-8">
              <BackupBar txs={saved} onApply={handleImport} onToast={setToast} />
            </div>
          </>
        )}

        {saved.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-end px-1">
              <MonthSelector
                months={months}
                value={activePeriod}
                onChange={setPeriod}
              />
            </div>
            <Recap txs={shownTxs} label={periodLabel(activePeriod)} />
            <BudgetPanel
              monthTxs={budgetMonthTxs}
              monthLabel={budgetMonthLabel}
              budget={budget}
              onSave={handleBudget}
            />
            <Projection txs={saved} />
            <TransactionList
              txs={shownTxs}
              onDelete={handleDelete}
              grouped={activePeriod === "all"}
            />
            <BackupBar txs={saved} onApply={handleImport} onToast={setToast} />
          </div>
        )}
      </main>

      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </div>
  );
}
