"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CameraIcon, RefreshIcon, XIcon } from "./icons";

type Props = {
  /** Called with the captured photo as a JPEG File. */
  onCapture: (file: File) => void;
  onClose: () => void;
};

/**
 * A live camera overlay backed by getUserMedia, so "take a photo" works on
 * desktop webcams as well as phones — not just the file-picker capture hint.
 * Prefers the rear camera on mobile; falls back gracefully if denied.
 */
export function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [ready, setReady] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser can't access the camera. Upload a photo instead.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch (e) {
        const name = e instanceof DOMException ? e.name : "";
        setError(
          name === "NotAllowedError"
            ? "Camera access was blocked. Allow it in your browser, or upload a photo."
            : "Couldn't start the camera. Upload a photo instead.",
        );
      }
    }

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [stop]);

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function shoot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `receipt-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        stop();
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Take a photo of your receipt"
      className="fixed inset-0 z-[var(--z-modal)] flex flex-col bg-black"
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-medium">Position the receipt in frame</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close camera"
          className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <XIcon size={20} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <div className="flex max-w-xs flex-col items-center gap-4 px-6 text-center text-white">
            <p className="text-sm leading-relaxed text-white/80">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/30 px-4 py-2 text-sm font-medium"
            >
              Go back
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-contain"
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white/70">
                <RefreshIcon size={18} className="animate-spin" />
                Starting camera…
              </div>
            )}
          </>
        )}
      </div>

      {!error && (
        <div className="flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={shoot}
            disabled={!ready}
            aria-label="Capture photo"
            className="grid size-16 place-items-center rounded-full bg-white text-black ring-4 ring-white/30 transition-transform active:scale-95 disabled:opacity-40"
          >
            <CameraIcon size={26} />
          </button>
        </div>
      )}
    </div>
  );
}
