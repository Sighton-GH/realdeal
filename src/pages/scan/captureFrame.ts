export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/**
 * Map a rectangle in on-screen video-element coordinates (CSS pixels) to source
 * video pixels, accounting for `object-fit: cover`. Result is clamped to the video.
 */
export function mapRectToVideo(rect: Rect, elementSize: Size, videoSize: Size): Rect {
  const { width: elW, height: elH } = elementSize;
  const { width: vW, height: vH } = videoSize;
  if (elW <= 0 || elH <= 0 || vW <= 0 || vH <= 0) {
    return { x: 0, y: 0, width: Math.max(vW, 0), height: Math.max(vH, 0) };
  }

  const scale = Math.max(elW / vW, elH / vH);
  // Offset (in element px) of the scaled video's top-left corner; negative on the cropped axis.
  const offsetX = (elW - vW * scale) / 2;
  const offsetY = (elH - vH * scale) / 2;

  const left = clamp((rect.x - offsetX) / scale, 0, vW);
  const top = clamp((rect.y - offsetY) / scale, 0, vH);
  const right = clamp((rect.x + rect.width - offsetX) / scale, 0, vW);
  const bottom = clamp((rect.y + rect.height - offsetY) / scale, 0, vH);

  return { x: left, y: top, width: Math.max(right - left, 0), height: Math.max(bottom - top, 0) };
}

function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not encode the image."));
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

function drawScaled(
  source: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
): HTMLCanvasElement {
  const longEdge = Math.max(sw, sh);
  const ratio = longEdge > MAX_EDGE ? MAX_EDGE / longEdge : 1;
  const outW = Math.max(1, Math.round(sw * ratio));
  const outH = Math.max(1, Math.round(sh * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, outW, outH);
  return canvas;
}

/** Capture the current frame cropped to `guide` (element coordinates), long edge <= 1600px, JPEG 0.85. */
export async function captureFrame(video: HTMLVideoElement, guide: Rect): Promise<Blob> {
  const vW = video.videoWidth;
  const vH = video.videoHeight;
  if (!vW || !vH) throw new Error("The camera has no frame yet.");

  const elementSize = { width: video.clientWidth, height: video.clientHeight };
  const mapped = mapRectToVideo(guide, elementSize, { width: vW, height: vH });
  const sw = Math.max(1, Math.round(mapped.width));
  const sh = Math.max(1, Math.round(mapped.height));
  const sx = Math.min(Math.round(mapped.x), vW - sw);
  const sy = Math.min(Math.round(mapped.y), vH - sh);

  return toJpeg(drawScaled(video, Math.max(sx, 0), Math.max(sy, 0), sw, sh));
}

/** Downscale an arbitrary picked image file to long edge <= 1600px JPEG 0.85. */
export async function prepareImageFile(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    return await toJpeg(drawScaled(bitmap, 0, 0, bitmap.width, bitmap.height));
  } finally {
    bitmap.close();
  }
}
