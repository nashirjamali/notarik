"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type Provider = "google" | "apple";

function resolveNext(): string {
  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");
  return from && from.startsWith("/") && from !== "/login" ? from : "/";
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.67 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path
        fill="currentColor"
        d="M16.36 12.78c.02 2.53 2.22 3.37 2.24 3.38-.02.06-.35 1.2-1.16 2.38-.7 1.02-1.43 2.03-2.57 2.05-1.12.02-1.48-.66-2.76-.66-1.28 0-1.68.64-2.74.68-1.1.04-1.94-1.1-2.65-2.12-1.45-2.09-2.56-5.9-1.07-8.48.74-1.28 2.06-2.09 3.49-2.11 1.08-.02 2.1.73 2.76.73.66 0 1.9-.9 3.2-.77.55.02 2.08.22 3.07 1.68-.08.05-1.83 1.07-1.81 3.19M14.28 5.6c.58-.71.98-1.69.87-2.66-.84.03-1.86.56-2.47 1.26-.54.63-1.02 1.63-.89 2.58.94.07 1.9-.47 2.49-1.18"
      />
    </svg>
  );
}

type Props = {
  onError: (message: string) => void;
  disabled?: boolean;
};

export function OAuthButtons({ onError, disabled }: Props) {
  const [pending, setPending] = useState<Provider | null>(null);

  async function signIn(provider: Provider) {
    setPending(provider);
    onError("");
    try {
      const supabase = createClient();
      const next = resolveNext();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        onError(error.message);
        setPending(null);
      }
    } catch {
      onError("Could not reach the server.");
      setPending(null);
    }
  }

  const busy = disabled || pending !== null;

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="stroke"
        className="flex-1 px-4"
        disabled={busy}
        onClick={() => signIn("google")}
        iconLeft={<GoogleMark />}
      >
        Google
      </Button>
      <Button
        type="button"
        variant="stroke"
        className="flex-1 px-4"
        disabled={busy}
        onClick={() => signIn("apple")}
        iconLeft={<AppleMark />}
      >
        Apple ID
      </Button>
    </div>
  );
}
