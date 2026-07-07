import type { User } from "@supabase/supabase-js";

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function displayNameFromUser(user: User | null): string {
  if (!user) return "User";

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta =
    typeof meta?.full_name === "string"
      ? meta.full_name
      : typeof meta?.name === "string"
        ? meta.name
        : null;

  if (fromMeta?.trim()) return fromMeta.trim();
  if (user.email) return displayNameFromEmail(user.email);
  return "User";
}
