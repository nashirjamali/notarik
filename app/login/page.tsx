"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Login failed.");
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

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-12">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-md bg-primary font-serif text-lg leading-none text-primary-ink">
          N
        </span>
        <span className="text-base font-semibold tracking-tight text-ink">Notarik</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Enter your credentials to continue.</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">Username</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border-strong bg-bg px-3 py-2.5 text-sm text-ink outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border-strong bg-bg px-3 py-2.5 text-sm text-ink outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
            />
          </label>
        </div>

        {error && (
          <p className="rounded-md border border-border bg-danger-soft px-3 py-2 text-sm text-ink">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-ink transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
