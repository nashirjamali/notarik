import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth-session";

export async function requireAuth(): Promise<Response | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return Response.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }
  return null;
}
