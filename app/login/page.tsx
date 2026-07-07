"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      const next = from && from.startsWith("/") && from !== "/login" ? from : "/";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
    } catch {
      setError("Could not reach the server.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-12">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-md bg-primary font-serif text-lg leading-none text-primary-ink">
          N
        </span>
        <span className="text-base font-semibold tracking-tight text-ink">Notarik</span>
      </div>

      <div className="mt-10 space-y-5">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Continue with your Google account.</p>
        </div>

        {error && (
          <p className="rounded-md border border-border bg-danger-soft px-3 py-2 text-sm text-ink">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-md border border-border-strong bg-bg px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
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
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
