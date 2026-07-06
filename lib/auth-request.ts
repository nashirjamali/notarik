import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";

type AuthSuccess = {
  user: User;
  supabase: SupabaseClient;
};

type AuthFailure = {
  error: Response;
};

export type AuthResult = AuthSuccess | AuthFailure;

export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: Response.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 }),
    };
  }

  return { user, supabase };
}
