const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Where a tap lands in the camera frame (0..1 each way), for a video shown with object-fit: cover. */
export function tapToVideoPoint(
  tap: { x: number; y: number },
  box: { left: number; top: number; width: number; height: number },
  video: { width: number; height: number },
): { x: number; y: number } | undefined {
  if (!(video.width > 0 && video.height > 0 && box.width > 0 && box.height > 0)) return undefined;
  const scale = Math.max(box.width / video.width, box.height / video.height);
  const shownW = video.width * scale;
  const shownH = video.height * scale;
  const x = (tap.x - box.left - (box.width - shownW) / 2) / shownW;
  const y = (tap.y - box.top - (box.height - shownH) / 2) / shownH;
  return { x: clamp01(x), y: clamp01(y) };
}
