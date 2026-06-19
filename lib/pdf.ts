/**
 * Render the first page of a PDF receipt to a PNG File, so e-receipts can flow
 * through the exact same image-extraction pipeline as photos. Receipts are
 * effectively always one page; we read page 1.
 */
export async function pdfFirstPageToImage(file: File): Promise<File> {
  // Loaded lazily and client-side only — pdf.js touches the DOM/worker.
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).href;

  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;
  try {
    const page = await pdf.getPage(1);
    // ~2x scale keeps small text legible for the model without ballooning size.
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't render that PDF.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("Couldn't render that PDF.");

    const name = file.name.replace(/\.pdf$/i, "") || "receipt";
    return new File([blob], `${name}.png`, { type: "image/png" });
  } finally {
    await loadingTask.destroy();
  }
}
