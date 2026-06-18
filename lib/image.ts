export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB raw file ceiling

export type PreparedImage = {
  /** Downscaled data URL sent to the extraction API. */
  full: string;
  /** Small square-ish thumbnail stored alongside the transaction. */
  thumb: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = src;
  });
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function drawScaled(img: HTMLImageElement, maxEdge: number, quality: number): string {
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Validate, then downscale a chosen file. Receipts read fine at ~1600px on the
 * long edge, which keeps the upload small and fast. Returns a full image for
 * extraction plus a compact thumbnail for the saved record.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That image is over 15MB. Try a smaller photo.");
  }
  const raw = await readAsDataURL(file);
  let img: HTMLImageElement;
  try {
    img = await loadImage(raw);
  } catch {
    // HEIC and a few formats can't decode in <canvas>; fall back to the raw bytes.
    return { full: raw, thumb: raw };
  }
  const full = drawScaled(img, 1600, 0.82);
  const thumb = drawScaled(img, 240, 0.7);
  return { full, thumb };
}
