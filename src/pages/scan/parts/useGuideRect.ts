import { useLayoutEffect, useState, type RefObject } from "react";
import type { Rect } from "../captureFrame";

/** Guide frame: 4:3, 80% of the column width, centred slightly above the middle. Coordinates are relative to the container. */
export function computeGuideRect(width: number, height: number): Rect {
  const w = width * 0.8;
  const h = (w * 3) / 4;
  return { x: (width - w) / 2, y: (height - h) / 2 - height * 0.06, width: w, height: h };
}

export function useGuideRect(containerRef: RefObject<HTMLElement | null>): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setRect(computeGuideRect(width, height));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);
  return rect;
}
