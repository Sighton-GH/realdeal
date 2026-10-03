import { useId } from "react";
import type { Rect } from "../captureFrame";

const RADIUS = 24;
const ARM = 30;

/** Darkened surround with a rounded cut-out, plus chunky white corner brackets. No blur. */
export function GuideFrame({ rect }: { rect: Rect }) {
  const maskId = `guide-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { x, y, width: w, height: h } = rect;
  const l = x, t = y, r = x + w, b = y + h;
  const r0 = RADIUS;
  const brackets = [
    `M ${l} ${t + ARM} V ${t + r0} Q ${l} ${t} ${l + r0} ${t} H ${l + ARM}`,
    `M ${r - ARM} ${t} H ${r - r0} Q ${r} ${t} ${r} ${t + r0} V ${t + ARM}`,
    `M ${r} ${b - ARM} V ${b - r0} Q ${r} ${b} ${r - r0} ${b} H ${r - ARM}`,
    `M ${l + ARM} ${b} H ${l + r0} Q ${l} ${b} ${l} ${b - r0} V ${b - ARM}`,
  ];
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={w} height={h} rx={RADIUS} fill="black" />
        </mask>
      </defs>
      <rect width="100%" height="100%" mask={`url(#${maskId})`} className="fill-ink/55" />
      {brackets.map((d) => (
        <path key={d} d={d} fill="none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" className="stroke-white" />
      ))}
    </svg>
  );
}
