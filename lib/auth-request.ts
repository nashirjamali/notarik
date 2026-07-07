import { createClient } from "./supabase/server";

export async function requireAuth(): Promise<Response | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return Response.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }
  return null;
}
