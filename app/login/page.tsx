"use client";

import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Mode = "sign-in" | "sign-up" | "forgot";

function GoogleIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg className="size-4 shrink-0 text-faint" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="size-4 shrink-0 text-faint" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path
          fillRule="evenodd"
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
        clipRule="evenodd"
      />
      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
    </svg>
  );
}

function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-9 place-items-center rounded-lg bg-primary">
        <svg className="size-5 text-lime" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="15" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-primary">Notarik</span>
    </div>
  );
}

function MarketingPanel() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-primary px-8 py-16 xl:px-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="absolute left-[12%] top-[18%] size-3 rounded-full border border-white/20" />
        <span className="absolute right-[20%] top-[12%] size-2 rounded-full bg-white/10" />
        <span className="absolute left-[8%] top-[45%] text-lg text-white/15">+</span>
        <span className="absolute right-[15%] top-[38%] size-4 rotate-45 border border-white/15" />
        <span className="absolute bottom-[30%] left-[18%] size-5 rounded-full border border-white/10" />
        <span className="absolute bottom-[22%] right-[22%] text-sm text-white/15">×</span>
        <span className="absolute bottom-[40%] right-[8%] size-2 rounded-full bg-lime/30" />
      </div>

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center">
        <div className="relative aspect-4/3 w-full">
          <div className="absolute left-0 top-4 w-[72%] rounded-2xl bg-white p-4 shadow-2xl shadow-black/20">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">This month</p>
            <p className="mt-1 text-2xl font-extrabold text-ink nums">Rp 4.280.000</p>
            <div className="mt-3 flex gap-1">
              {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-lime"
                  style={{ height: `${h * 0.4}px` }}
                />
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {[
                { name: "Indomaret", cat: "Groceries", amt: "Rp 142.500" },
                { name: "Bluebird", cat: "Transport", amt: "Rp 45.000" },
              ].map((row) => (
                <div key={row.name} className="flex items-center justify-between text-[11px]">
                  <div>
                    <p className="font-semibold text-ink">{row.name}</p>
                    <p className="text-muted">{row.cat}</p>
                  </div>
                  <p className="font-semibold text-ink nums">{row.amt}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 right-0 w-[58%] rounded-2xl bg-primary-hover p-4 shadow-xl shadow-black/25 ring-1 ring-white/10">
            <p className="text-[10px] font-medium text-white/70">Budget left</p>
            <p className="mt-0.5 text-xl font-extrabold text-lime nums">Rp 1.720.000</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[72%] rounded-full bg-lime" />
            </div>
          </div>
        </div>

        <div className="mt-12 w-full text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white">
            Get Smart With Money
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-white/80">
            Notarik turns receipt photos into categorized expenses — no typing, no
            spreadsheets. Scan, review, and track your spending in seconds.
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          <span className="size-2 rounded-full bg-white" />
          <span className="size-2 rounded-full bg-white/30" />
          <span className="size-2 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    if (authError === "auth_callback_failed") {
      setError("Sign in failed. Please try again.");
    }
  }, []);

  function getRedirectTo() {
    const from = new URLSearchParams(window.location.search).get("from");
    return from && from.startsWith("/") && from !== "/login"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(from)}`
      : `${window.location.origin}/auth/callback`;
  }

  async function handleOAuth(provider: "google" | "apple") {
    setOauthLoading(provider);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: getRedirectTo() },
      });
      if (signInError) {
        setError(signInError.message);
        setOauthLoading(null);
      }
    } catch {
      setError("Could not reach the server.");
      setOauthLoading(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (resetError) {
          setError(resetError.message);
          return;
        }
        setMessage("Check your email for a password reset link.");
        return;
      }

      if (mode === "sign-up") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: getRedirectTo() },
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        setMessage("Check your email to confirm your account.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }

      const from = new URLSearchParams(window.location.search).get("from");
      router.replace(from && from.startsWith("/") && from !== "/login" ? from : "/");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  const heading =
    mode === "sign-up"
      ? "Sign Up To Notarik"
      : mode === "forgot"
        ? "Reset Password"
        : "Sign In To Notarik";

  return (
    <div className="grid min-h-dvh w-full lg:grid-cols-2">
      <section className="flex min-h-dvh flex-col bg-white">
        <header className="px-6 pt-8 sm:px-10 lg:px-12 xl:px-16">
          <LogoMark />
        </header>

        <main className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="mx-auto w-full lg:max-w-104 xl:max-w-112">
            <h1 className="text-balance text-center text-3xl font-extrabold tracking-tight text-primary">
              {heading}
            </h1>

            {mode !== "forgot" && (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => handleOAuth("google")}
                  disabled={oauthLoading !== null}
                  aria-label="Sign in with Google"
                  className="flex h-14 items-center justify-center rounded-xl bg-surface-2 transition-colors hover:bg-border disabled:opacity-60"
                >
                  <GoogleIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth("apple")}
                  disabled={oauthLoading !== null}
                  aria-label="Sign in with Apple"
                  className="flex h-14 items-center justify-center rounded-xl bg-surface-2 transition-colors hover:bg-border disabled:opacity-60"
                >
                  <AppleIcon />
                </button>
              </div>
            )}

            {mode !== "forgot" && (
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-muted">Or</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="block">
                <div className="flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-3.5">
                  <EnvelopeIcon />
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted"
                  />
                </div>
              </label>

              {mode !== "forgot" && (
                <label className="block">
                  <div className="flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-3.5">
                    <LockIcon />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="-m-2 shrink-0 p-2 text-muted transition-colors hover:text-ink"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </label>
              )}

              {mode === "sign-in" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError("");
                      setMessage("");
                    }}
                    className="text-sm text-muted transition-colors hover:text-primary"
                  >
                    Forget Password ?
                  </button>
                </div>
              )}

              {error && (
                <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-ink">{error}</p>
              )}

              {message && (
                <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm text-ink">{message}</p>
              )}

              <Button
                type="submit"
                variant="lime"
                disabled={loading || oauthLoading !== null}
                className="mt-2 w-full rounded-xl py-4 text-base font-extrabold uppercase tracking-wide"
              >
                {loading
                  ? "Please wait…"
                  : mode === "sign-up"
                    ? "Sign Up"
                    : mode === "forgot"
                      ? "Send Reset Link"
                      : "Sign In"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              {mode === "sign-in" ? (
                <>
                  Create A New Account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("sign-up");
                      setError("");
                      setMessage("");
                    }}
                    className="font-bold text-primary transition-colors hover:text-primary-hover"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("sign-in");
                      setError("");
                      setMessage("");
                    }}
                    className="font-bold text-primary transition-colors hover:text-primary-hover"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>
        </main>

        <footer className="flex items-center justify-between px-6 py-6 text-xs text-faint sm:px-10 lg:px-12 xl:px-16">
          <span>Privacy Policy</span>
          <span>Copyright {new Date().getFullYear()}</span>
        </footer>
      </section>

      <aside className="relative hidden min-h-dvh lg:block">
        <MarketingPanel />
      </aside>
    </div>
  );
}
