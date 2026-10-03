// STUB (SPEC-00). SCR-13 replaces. Contract used by ScanPage (SCR-14).
export interface Rect { x: number; y: number; width: number; height: number }

/** Map a rectangle in on-screen video-element coordinates to source video pixels, accounting for object-fit: cover. Pure, unit-testable. */
export function mapRectToVideo(rect: Rect, elementSize: { width: number; height: number }, videoSize: { width: number; height: number }): Rect {
  void elementSize; void videoSize;
  return rect;
}

/** Capture the current frame cropped to `guide` (element coordinates), long edge <= 1600px, JPEG 0.85. */
export async function captureFrame(video: HTMLVideoElement, guide: Rect): Promise<Blob> {
  void video; void guide;
  return new Blob([], { type: "image/jpeg" });
}

/** Downscale an arbitrary picked image file to long edge <= 1600px JPEG 0.85. */
export async function prepareImageFile(file: File): Promise<Blob> {
  return file;
}
