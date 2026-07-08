"use client";

import { useRef, useState } from "react";
import { CameraIcon, UploadIcon, ReceiptIcon, PlusIcon } from "./icons";
import { CameraCapture } from "./CameraCapture";
import { Button } from "@/components/ui";

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
            ? "border-primary-500 bg-primary-100"
            : "border-neutral-400 bg-neutral-100"
        }`}
      >
        <span
          className="grid size-14 place-items-center rounded-full bg-white text-primary-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          aria-hidden
        >
          <ReceiptIcon size={26} />
        </span>

        <div className="space-y-1.5">
          <p className="font-serif text-xl tracking-tight text-neutral-900">
            Snap a receipt, skip the typing
          </p>
          <p className="mx-auto max-w-[42ch] text-sm leading-relaxed text-neutral-500">
            Take a photo, or upload an image or PDF. We&apos;ll read the merchant,
            date, total, and items — you just confirm.
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button
            type="button"
            disabled={disabled}
            onClick={() => setCameraOpen(true)}
            iconLeft={<CameraIcon size={18} />}
            className="flex-1"
          >
            Take photo
          </Button>
          <Button
            type="button"
            variant="white"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            iconLeft={<UploadIcon size={18} />}
            className="flex-1"
          >
            Image or PDF
          </Button>
        </div>

        <p className="hidden text-xs text-neutral-500 sm:block">
          or drag &amp; drop an image or PDF here
        </p>
      </div>

      <Button
        type="button"
        variant="stroke"
        size="small"
        disabled={disabled}
        onClick={onManual}
        iconLeft={<PlusIcon size={16} />}
        className="self-center"
      >
        Enter manually instead
      </Button>

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
