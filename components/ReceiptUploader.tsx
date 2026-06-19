"use client";

import { useRef, useState } from "react";
import { CameraIcon, UploadIcon, ReceiptIcon, PlusIcon } from "./icons";
import { CameraCapture } from "./CameraCapture";

type Props = {
  onSelect: (file: File) => void;
  onManual: () => void;
  disabled?: boolean;
};

export function ReceiptUploader({ onSelect, onManual, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onSelect(file);
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`relative flex flex-col items-center gap-5 rounded-xl border border-dashed px-6 py-12 text-center transition-colors duration-200 ${
          dragging
            ? "border-primary bg-primary-soft"
            : "border-border-strong bg-surface"
        }`}
      >
        <span
          className="grid size-14 place-items-center rounded-full bg-bg text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          aria-hidden
        >
          <ReceiptIcon size={26} />
        </span>

        <div className="space-y-1.5">
          <p className="font-serif text-xl tracking-tight text-ink">
            Snap a receipt, skip the typing
          </p>
          <p className="mx-auto max-w-[42ch] text-sm leading-relaxed text-muted">
            Take a photo, or upload an image or PDF. We&apos;ll read the merchant,
            date, total, and items — you just confirm.
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setCameraOpen(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-ink transition-[background-color,transform] duration-150 hover:bg-primary-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CameraIcon size={18} />
            Take photo
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border-strong bg-bg px-4 py-2.5 text-sm font-medium text-ink transition-[background-color,transform] duration-150 hover:bg-surface-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UploadIcon size={18} />
            Image or PDF
          </button>
        </div>

        <p className="hidden text-xs text-muted sm:block">
          or drag &amp; drop an image or PDF here
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onManual}
        className="inline-flex items-center justify-center gap-1.5 self-center rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        <PlusIcon size={16} />
        Enter manually instead
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {cameraOpen && (
        <CameraCapture
          onCapture={(file) => {
            setCameraOpen(false);
            onSelect(file);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
