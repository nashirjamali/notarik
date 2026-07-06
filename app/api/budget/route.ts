import { requireAuth } from "@/lib/auth-request";
import { loadBudget, saveBudget } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  try {
    const monthlyTotal = await loadBudget(auth.supabase);
    return Response.json({ monthlyTotal });
  } catch (err) {
    console.error("load budget", err);
    return Response.json(
      { error: "Could not load budget.", code: "db_error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request): Promise<Response> {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  let body: { monthlyTotal?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body.", code: "bad_request" }, { status: 400 });
  }

  const monthlyTotal =
    body.monthlyTotal === null
      ? null
      : typeof body.monthlyTotal === "number" && Number.isFinite(body.monthlyTotal)
        ? body.monthlyTotal
        : undefined;

  if (monthlyTotal === undefined) {
    return Response.json({ error: "Invalid budget.", code: "bad_request" }, { status: 400 });
  }

  try {
    const saved = await saveBudget(auth.supabase, auth.user.id, monthlyTotal);
    return Response.json({ monthlyTotal: saved });
  } catch (err) {
    console.error("save budget", err);
    return Response.json(
      { error: "Could not save budget.", code: "db_error" },
      { status: 500 },
    );
  }
}
