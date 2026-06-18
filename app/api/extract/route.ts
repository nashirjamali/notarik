import { EXTRACTION_PROMPT, parseExtraction } from "@/lib/extraction";

export const runtime = "nodejs";
// Vision extraction can take a few seconds; give it room on platforms that cap.
export const maxDuration = 60;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // ~8MB of base64 payload

type ErrorBody = { error: string; code: string };

function err(message: string, code: string, status: number): Response {
  return Response.json({ error: message, code } satisfies ErrorBody, {
    status,
  });
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return err(
      "Receipt scanning isn't configured yet. Add OPENROUTER_API_KEY to your environment.",
      "no_api_key",
      503,
    );
  }

  let body: { image?: unknown };
  try {
    body = await request.json();
  } catch {
    return err("Invalid request body.", "bad_request", 400);
  }

  const image = body.image;
  if (typeof image !== "string" || !image.startsWith("data:image/")) {
    return err("Please attach a valid image.", "bad_image", 400);
  }
  if (image.length > MAX_IMAGE_BYTES) {
    return err("That image is too large. Try a smaller photo.", "too_large", 413);
  }

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Optional attribution headers OpenRouter recommends.
        "HTTP-Referer": "https://notarik.app",
        "X-Title": "Notarik",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: EXTRACTION_PROMPT },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });
  } catch {
    return err(
      "Couldn't reach the scanning service. Check your connection and try again.",
      "network",
      502,
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error("OpenRouter error", upstream.status, detail);
    if (upstream.status === 401 || upstream.status === 403) {
      return err("Scanning service rejected the API key.", "auth", 502);
    }
    if (upstream.status === 429) {
      return err("Rate limit reached. Wait a moment and try again.", "rate_limit", 429);
    }
    return err("The scanning service had a problem. Please try again.", "upstream", 502);
  }

  let data: {
    choices?: { message?: { content?: string } }[];
  };
  try {
    data = await upstream.json();
  } catch {
    return err("Got an unreadable response from the scanner.", "bad_upstream", 502);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    return err("The scanner returned nothing to read.", "empty", 502);
  }

  try {
    const result = parseExtraction(text);
    return Response.json(result);
  } catch {
    return err(
      "Couldn't read the details from that receipt. Try a clearer photo, or enter it by hand.",
      "parse_failed",
      422,
    );
  }
}
