import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-request";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth-session";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  const denied = await requireAuth();
  if (denied) return denied;

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
