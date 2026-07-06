import { requireAuth } from "@/lib/auth-request";
import { IMPORT_PROMPT, parseImport } from "@/lib/importer";

export const runtime = "nodejs";
// Mapping a whole sheet can take a few seconds; give it room.
export const maxDuration = 60;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

const MAX_ROWS = 500; // keep the prompt bounded
const MAX_CHARS = 200_000; // hard cap on serialized payload

type ErrorBody = { error: string; code: string };

function err(message: string, code: string, status: number): Response {
  return Response.json({ error: message, code } satisfies ErrorBody, { status });
}

export async function POST(request: Request): Promise<Response> {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return err(
      "Import isn't configured yet. Add OPENROUTER_API_KEY to your environment.",
      "no_api_key",
      503,
    );
  }

  let body: { rows?: unknown };
  try {
    body = await request.json();
  } catch {
    return err("Invalid request body.", "bad_request", 400);
  }

  const rows = body.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return err("No rows to import.", "empty", 400);
  }

  const trimmed = rows.slice(0, MAX_ROWS);
  const serialized = JSON.stringify(trimmed);
  if (serialized.length > MAX_CHARS) {
    return err(
      "That file is too large to import at once. Split it into smaller files and try again.",
      "too_large",
      413,
    );
  }

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://notarik.app",
        "X-Title": "Notarik",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: `${IMPORT_PROMPT}\n\nSpreadsheet rows:\n${serialized}`,
          },
        ],
      }),
    });
  } catch {
    return err(
      "Couldn't reach the import service. Check your connection and try again.",
      "network",
      502,
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error("OpenRouter import error", upstream.status, detail);
    if (upstream.status === 401 || upstream.status === 403) {
      return err("Import service rejected the API key.", "auth", 502);
    }
    if (upstream.status === 429) {
      return err("Rate limit reached. Wait a moment and try again.", "rate_limit", 429);
    }
    return err("The import service had a problem. Please try again.", "upstream", 502);
  }

  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = await upstream.json();
  } catch {
    return err("Got an unreadable response from the importer.", "bad_upstream", 502);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    return err("The importer returned nothing to read.", "empty_response", 502);
  }

  try {
    const imported = parseImport(text);
    const skipped = Math.max(0, trimmed.length - imported.length);
    return Response.json({ imported, skipped, seen: trimmed.length });
  } catch {
    return err(
      "Couldn't make sense of that file's contents. Make sure it lists expenses with an amount per row.",
      "parse_failed",
      422,
    );
  }
}
