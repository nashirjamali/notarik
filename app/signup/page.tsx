"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { BrandMark } from "@/components/auth/BrandMark";
import { MailIcon, CheckIcon, ReceiptIcon, AlertIcon } from "@/components/icons";

const PERKS = [
  "Unlimited receipt scans",
  "Automatic categorization",
  "Free forever",
  "Private by default",
];

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });
      if (otpError) {
        setError(otpError.message);
        setLoading(false);
        return;
      }
      setSent(true);
      setLoading(false);
    } catch {
      setError("Could not reach the server.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh bg-neutral-50 dark:bg-neutral-900">
      <aside className="flex w-[400px] shrink-0 items-center justify-center bg-neutral-100 px-6 py-24 t:hidden dark:bg-neutral-950">
        <div className="w-full max-w-[212px]">
          <div className="mx-auto mb-10 max-w-[180px]">
            <div className="rounded-2xl bg-white p-5 shadow-widget dark:bg-neutral-900">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary-500 text-white">
                <ReceiptIcon size={24} />
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-3/4 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-2.5 w-1/2 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="mt-4 flex items-center justify-between border-t-2 border-neutral-100 pt-4 dark:border-neutral-800">
                <div className="h-2.5 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <span className="rounded-full bg-success-100 px-3 py-1 text-caption-2 text-success-500">
                  Done
                </span>
              </div>
            </div>
          </div>
          <h2 className="mb-10 text-center font-serif text-2xl tracking-tight text-neutral-900 dark:text-white">
            Plan includes
          </h2>
          <ul className="space-y-5">
            {PERKS.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-3 text-base-2 text-neutral-500"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success-100 text-success-500">
                  <CheckIcon size={16} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="relative flex flex-1 items-center justify-center px-6 py-24">
        <BrandMark withWordmark={false} className="absolute left-6 top-6" />
        <p className="absolute right-8 top-8 text-caption-1 text-neutral-400">
          Already a member?{" "}
          <a
            href="/login"
            className="font-bold text-neutral-900 transition-colors hover:text-primary-500 dark:text-white"
          >
            Sign in
          </a>
        </p>

        <div className="w-full max-w-[296px] m:max-w-full">
          <h1 className="mb-8 font-serif text-[40px] leading-[1.15] tracking-tight text-neutral-900 dark:text-white">
            Sign up
          </h1>

          {error ? (
            <div className="mb-6 flex items-start gap-2 rounded-xl bg-danger-100/25 px-4 py-3 text-caption-1 text-danger-500">
              <AlertIcon size={18} className="mt-px shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {sent ? (
            <div>
              <p className="text-base-2 text-neutral-500">
                We just sent a magic link to{" "}
                <span className="font-bold text-neutral-900 dark:text-white">
                  {email}
                </span>
                . Check your inbox to finish creating your account.
              </p>
              <Button
                variant="stroke"
                className="mt-6 w-full"
                onClick={() => setSent(false)}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 border-b-2 border-neutral-200 pb-8 dark:border-neutral-800">
                <p className="mb-5 text-base-2 text-neutral-500">
                  Sign up with your open account
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending…" : "Continue"}
                  </Button>
                </div>
                <p className="mt-8 text-body-2-s text-neutral-400">
                  This site is protected by reCAPTCHA and the Google Privacy
                  Policy.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
