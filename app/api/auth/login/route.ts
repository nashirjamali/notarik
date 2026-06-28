import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth-credentials";
import {
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth-session";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!process.env.AUTH_USERNAME || !process.env.AUTH_PASSWORD || !process.env.AUTH_SECRET) {
    return Response.json(
      { error: "Auth is not configured.", code: "auth_not_configured" },
      { status: 503 },
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body.", code: "bad_request" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyCredentials(username, password)) {
    return Response.json({ error: "Invalid username or password.", code: "invalid_credentials" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
