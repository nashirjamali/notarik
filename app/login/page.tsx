"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MarketingPanel } from "@/components/login/MarketingPanel";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  WalletIcon,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { FaApple, FaGoogle } from "react-icons/fa";

type Mode = "sign-in" | "sign-up" | "forgot";

function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-9 place-items-center rounded-lg bg-primary">
        <WalletIcon size={20} className="text-lime" />
      </span>
      <span className="text-lg font-bold tracking-tight text-primary">Notarik</span>
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
                <Button
                  type="button"
                  variant="icon"
                  onClick={() => handleOAuth("google")}
                  disabled={oauthLoading !== null}
                  aria-label="Sign in with Google"
                  className="w-full rounded-xl"
                  icon={<FaGoogle className="size-6" />}
                />
                <Button
                  type="button"
                  variant="icon"
                  onClick={() => handleOAuth("apple")}
                  disabled={oauthLoading !== null}
                  aria-label="Sign in with Apple"
                  className="w-full rounded-xl"
                  icon={<FaApple className="size-6" />}
                />
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
                <Input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  icon={<EnvelopeIcon size={16} className="shrink-0 text-faint" />}
                />
              </label>

              {mode !== "forgot" && (
                <label className="block">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    icon={<LockIcon size={16} className="shrink-0 text-faint" />}
                    trailing={
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => setShowPassword((v) => !v)}
                        className="p-2 text-muted hover:text-ink"
                        icon={
                          showPassword ? (
                            <EyeSlashIcon size={16} />
                          ) : (
                            <EyeIcon size={16} />
                          )
                        }
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      />
                    }
                  />
                </label>
              )}

              {mode === "sign-in" && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="text"
                    onClick={() => {
                      setMode("forgot");
                      setError("");
                      setMessage("");
                    }}
                  >
                    Forget Password ?
                  </Button>
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
                  <Button
                    type="button"
                    variant="text"
                    emphasis
                    onClick={() => {
                      setMode("sign-up");
                      setError("");
                      setMessage("");
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Button
                    type="button"
                    variant="text"
                    emphasis
                    onClick={() => {
                      setMode("sign-in");
                      setError("");
                      setMessage("");
                    }}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </p>
          </div>
        </main>

        <footer className="flex items-center justify-between px-6 py-6 sm:px-10 lg:px-12 xl:px-16">
          <Button type="button" variant="text" className="text-xs text-faint hover:text-muted">
            Privacy Policy
          </Button>
          <span className="text-xs text-faint">Copyright {new Date().getFullYear()}</span>
        </footer>
      </section>

      <aside className="relative hidden min-h-dvh lg:block">
        <MarketingPanel />
      </aside>
    </div>
  );
}
