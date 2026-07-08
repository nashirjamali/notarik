"use client";

import { ScanIcon } from "./icons";

type Props = { preview: string };

/**
 * Shown while the receipt is being read. A scan line sweeps the actual photo,
 * with skeleton rows standing in for the fields about to be filled — so the
 * wait previews the shape of the result rather than spinning in the void.
 */
export function ProcessingState({ preview }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5 text-sm font-medium text-primary-500">
        <ScanIcon size={18} className="animate-[pulse_1.6s_ease-in-out_infinite]" />
        <span>Reading your receipt…</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[7rem_1fr] sm:items-start">
        <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          {/* base64 data URL — next/image can't optimize these */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Receipt being processed"
            className="block max-h-44 w-full object-cover sm:max-h-40"
          />
          <div className="scanline" aria-hidden />
        </div>

        <div className="space-y-3" aria-hidden>
          <div className="shimmer h-7 w-2/3 rounded-md" />
          <div className="flex gap-3">
            <div className="shimmer h-5 w-24 rounded-md" />
            <div className="shimmer h-5 w-20 rounded-md" />
          </div>
          <div className="shimmer h-px w-full rounded" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between gap-4">
              <div
                className="shimmer h-4 rounded"
                style={{ width: `${60 - i * 8}%` }}
              />
              <div className="shimmer h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        This usually takes a few seconds. Keep this tab open.
      </p>

      <style>{`
        .shimmer {
          background: linear-gradient(
            100deg,
            var(--color-neutral-200) 30%,
            var(--color-neutral-100) 50%,
            var(--color-neutral-200) 70%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s linear infinite;
        }
        @keyframes shimmer {
          to { background-position: -200% 0; }
        }
        .scanline {
          position: absolute;
          inset-inline: 0;
          height: 2px;
          background: var(--color-primary-500);
          box-shadow: 0 0 12px 2px color-mix(in oklch, var(--color-primary-500) 60%, transparent);
          animation: sweep 1.8s var(--ease-out-quint) infinite;
        }
        @keyframes sweep {
          0% { top: 4%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 96%; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .shimmer { animation: none; background: var(--color-neutral-200); }
          .scanline { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
