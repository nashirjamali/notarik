import { requireAuth } from "@/lib/auth-request";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return Response.json({ error: error.message, code: "sign_out_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
