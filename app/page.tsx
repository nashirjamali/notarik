"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExtractionResult, Transaction } from "@/lib/types";
import { prepareImage } from "@/lib/image";
import { pdfFirstPageToImage } from "@/lib/pdf";
import {
  type Period,
  currentMonthKey,
  dueRecurring,
  filterByMonth,
  isLikelyDuplicate,
  listMonths,
  monthLabel,
  periodLabel,
  periodTxs,
} from "@/lib/recap";
import { newId } from "@/lib/id";
import type { Category } from "@/lib/types";
import { formatIDR, todayISO } from "@/lib/format";
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
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AlertIcon, RefreshIcon } from "@/components/icons";
import { Button, Card, Status } from "@/components/ui";

type Stage = "idle" | "extracting" | "review" | "manual" | "error";

const BLANK_RESULT: ExtractionResult = {
  merchant: null,
  date: null,
  total: null,
  currency: "IDR",
  category: "Other",
  items: [],
};

async function readTransactions(): Promise<Transaction[]> {
  const res = await fetch("/api/transactions");
  if (!res.ok) throw new Error("Could not load expenses.");
  const data = await res.json();
  return Array.isArray(data.transactions) ? data.transactions : [];
}

async function readBudget(): Promise<number | null> {
  const res = await fetch("/api/budget");
  if (!res.ok) throw new Error("Could not load budget.");
  const data = await res.json();
  return typeof data.monthlyTotal === "number" ? data.monthlyTotal : null;
}

export default function Home() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [preview, setPreview] = useState<string>("");
  const [fullImage, setFullImage] = useState<string>("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string>("");
  const [toast, setToast] = useState<string>("");
  const [saved, setSaved] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<number | null>(null);
  const [period, setPeriod] = useState<Period>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [txs, nextBudget] = await Promise.all([readTransactions(), readBudget()]);
        if (cancelled) return;
        setSaved(txs);
        setBudget(nextBudget);
      } catch {
        if (!cancelled) setToast("Could not load your saved data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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

  async function handleSave(tx: Transaction) {
    if (
      isLikelyDuplicate(tx, saved) &&
      !window.confirm(
        `This looks like it might already be logged — same merchant, date, and total. Save it anyway?`,
      )
    ) {
      return;
    }
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data?.error ?? "Could not save expense.");
        return;
      }
      setSaved(Array.isArray(data.transactions) ? data.transactions : []);
      reset();
      setToast(`Saved ${formatIDR(tx.total)} to ${tx.category}`);
    } catch {
      setToast("Could not save expense.");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data?.error ?? "Could not delete expense.");
        return;
      }
      setSaved(Array.isArray(data.transactions) ? data.transactions : []);
      setToast("Expense deleted");
    } catch {
      setToast("Could not delete expense.");
    }
  }

  async function handleBudget(next: number | null) {
    try {
      const res = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyTotal: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data?.error ?? "Could not save budget.");
        return;
      }
      setBudget(typeof data.monthlyTotal === "number" ? data.monthlyTotal : null);
    } catch {
      setToast("Could not save budget.");
    }
  }

  async function handleImport(rows: Transaction[], mode: "merge" | "replace") {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, transactions: rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data?.error ?? "Could not import expenses.");
        return;
      }
      setSaved(Array.isArray(data.transactions) ? data.transactions : []);
    } catch {
      setToast("Could not import expenses.");
    }
  }

  async function handleBulkRecategorize(ids: string[], category: Category) {
    const idSet = new Set(ids);
    const updated = saved
      .filter((tx) => idSet.has(tx.id))
      .map((tx) => ({ ...tx, category }));
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "merge", transactions: updated }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data?.error ?? "Could not recategorize expenses.");
        return;
      }
      setSaved(Array.isArray(data.transactions) ? data.transactions : []);
      setToast(`Moved ${ids.length} expense${ids.length > 1 ? "s" : ""} to ${category}`);
    } catch {
      setToast("Could not recategorize expenses.");
    }
  }

  async function handleQuickAddRecurring(tx: Transaction) {
    await handleSave({
      ...tx,
      id: newId(),
      date: todayISO(),
      createdAt: new Date().toISOString(),
    });
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  function reset() {
    setStage("idle");
    setResult(null);
    setPreview("");
    setFullImage("");
    setError("");
  }

  const total = saved.reduce((s, t) => s + t.total, 0);
  const recurringDue = dueRecurring(saved, currentMonthKey());
  const months = listMonths(saved);
  const activePeriod: Period =
    period === "all" || months.some((m) => m.key === period) ? period : "all";
  const shownTxs = periodTxs(saved, activePeriod);
  const budgetMonthKey = activePeriod === "all" ? currentMonthKey() : activePeriod;
  const budgetMonthTxs = filterByMonth(saved, budgetMonthKey);
  const budgetMonthLabel =
    activePeriod === "all" ? "This month" : monthLabel(activePeriod);

  if (loading) {
    return (
      <DashboardShell title="Overview" onLogout={handleLogout}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-base-2 text-neutral-500">Loading your expenses…</p>
        </div>
      </DashboardShell>
    );
  }

  const summary =
    saved.length > 0 ? (
      <div className="hidden text-right sm:block">
        <p className="nums text-base-2 font-semibold text-neutral-900 dark:text-white">
          {formatIDR(total)}
        </p>
        <p className="text-caption-2-m text-neutral-500">
          {saved.length} expense{saved.length > 1 ? "s" : ""}
        </p>
      </div>
    ) : undefined;

  return (
    <DashboardShell
      title="Overview"
      summary={summary}
      onLogout={handleLogout}
    >
      <div className="space-y-10">
        <section
          id="add"
          className="scroll-mt-28 rounded-lg bg-white p-6 shadow-widget dark:bg-neutral-900"
        >
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
              <span className="grid size-12 place-items-center rounded-full bg-danger-100 text-danger-500">
                <AlertIcon size={24} />
              </span>
              <div className="space-y-1.5">
                <p className="font-serif text-xl tracking-tight text-neutral-900 dark:text-white">
                  We couldn&apos;t read that one
                </p>
                <p className="mx-auto max-w-[44ch] text-sm leading-relaxed text-neutral-500">
                  {error}
                </p>
              </div>
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-md border border-neutral-400 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
                >
                  Choose another photo
                </button>
                {fullImage && (
                  <button
                    type="button"
                    onClick={() => runExtraction(fullImage)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
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
          <BackupBar txs={saved} onApply={handleImport} onToast={setToast} />
        )}

        {saved.length > 0 && (
          <div className="space-y-10">
            {/* This month's picture — recap, budget, and projection read together at a glance */}
            <div className="space-y-4">
              <div className="flex items-center justify-end">
                <MonthSelector
                  months={months}
                  value={activePeriod}
                  onChange={setPeriod}
                />
              </div>

              {recurringDue.length > 0 && (
                <Card className="bg-primary-100 dark:bg-primary-500/15">
                  <div className="flex items-center gap-2">
                    <Status variant="blue">{recurringDue.length} due</Status>
                    <p className="text-base-1-s text-neutral-900 dark:text-white">
                      Recurring expense{recurringDue.length > 1 ? "s" : ""} due this month
                    </p>
                  </div>
                  <ul className="mt-4 flex flex-col gap-3">
                    {recurringDue.map((tx) => (
                      <li
                        key={tx.id}
                        className="flex items-center justify-between gap-3 text-base-1-s text-neutral-900 dark:text-white"
                      >
                        <span>
                          {tx.merchant} — {formatIDR(tx.total)}
                        </span>
                        <Button
                          type="button"
                          size="small"
                          onClick={() => handleQuickAddRecurring(tx)}
                        >
                          Add for this month
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
                <div id="recap" className="scroll-mt-28">
                  <Recap txs={shownTxs} label={periodLabel(activePeriod)} />
                </div>
                <div id="budget" className="scroll-mt-28">
                  <BudgetPanel
                    monthTxs={budgetMonthTxs}
                    monthLabel={budgetMonthLabel}
                    budget={budget}
                    onSave={handleBudget}
                  />
                </div>
              </div>

              <Projection txs={saved} />
            </div>

            {/* The ledger — every receipt, searchable, with the backup safety net beneath */}
            <div className="space-y-4">
              <div id="transactions" className="scroll-mt-28">
                <TransactionList
                  txs={shownTxs}
                  onDelete={handleDelete}
                  grouped={activePeriod === "all"}
                  onBulkRecategorize={handleBulkRecategorize}
                />
              </div>
              <BackupBar txs={saved} onApply={handleImport} onToast={setToast} />
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </DashboardShell>
  );
}
