"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { BrandMark } from "@/components/auth/BrandMark";
import { MailIcon, LockIcon, AlertIcon } from "@/components/icons";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      const next =
        from && from.startsWith("/") && from !== "/login" ? from : "/";
      window.location.assign(next);
    } catch {
      setError("Could not reach the server.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 p-12 m:p-6 dark:bg-neutral-900">
      <div className="w-full max-w-[296px] m:max-w-full">
        <BrandMark className="mb-8" />
        <h1 className="mb-8 font-serif text-[40px] leading-[1.15] tracking-tight text-neutral-900 dark:text-white">
          Sign in
        </h1>

        {error ? (
          <div className="mb-6 flex items-start gap-2 rounded-xl bg-danger-100/25 px-4 py-3 text-caption-1 text-danger-500">
            <AlertIcon size={18} className="mt-px shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mb-8 border-b-2 border-neutral-200 pb-8 dark:border-neutral-800">
          <p className="mb-5 text-base-2 text-neutral-500">
            Sign in with your open account
          </p>
          <OAuthButtons onError={setError} disabled={loading} />
        </div>

        <form onSubmit={handleSubmit}>
          <p className="mb-5 text-base-2 text-neutral-500">
            Or continue with email address
          </p>
          <div className="space-y-3">
            <Field
              type="email"
              name="email"
              required
              placeholder="Your email"
              icon={<MailIcon />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Field
              type="password"
              name="password"
              required
              placeholder="Password"
              icon={<LockIcon />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        </form>

        <p className="mt-8 text-body-2-s text-neutral-400">
          This site is protected by reCAPTCHA and the Google Privacy Policy.
        </p>
        <p className="mt-8 text-caption-1 text-neutral-500">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="font-bold text-neutral-900 transition-colors hover:text-primary-500 dark:text-white"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
