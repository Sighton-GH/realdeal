import type { PennyMood } from "../types";

/** Hex values from DESIGN.md (SVG illustration files may use them). */
export const C = {
  copper: "#E0793C",
  shade: "#B5561F",
  light: "#FFB37D",
  ink: "#241B35",
  white: "#FFFFFF",
  mouth: "#7A2E12",
  pink: "#FF8FA3",
  grape: "#6A3BE4",
  yellow: "#FFC21A",
} as const;

export interface FaceConfig {
  /** "open" draws white eyes, "arc" draws closed-eye arcs. */
  eyes: "open" | "arc";
  /** Eye scale (1 = 26x32 oval). */
  eyeSx: number;
  eyeSy: number;
  /** Fraction of the eye covered from the top by a lid (0 to 1). */
  lid: number;
  pupil: { x: number; y: number; scale: number };
  arc: string;
  /** Left and right brow: y offset from the base line and rotation in degrees. */
  browL: { y: number; r: number };
  browR: { y: number; r: number };
  /** Open path for an open mouth (closed shape), hidden when `open` is false. */
  mouthOpen: string;
  open: boolean;
  /** Line mouth for closed moods. */
  mouthLine: string;
  tongue: { x: number; y: number; rx: number; ry: number; on: boolean };
  cheek: number;
}

const arcPath = (w: number, h: number): string => {
  const y = 98 + h / 2;
  const left = `M ${76 - w / 2} ${y} Q 76 ${y - h * 2} ${76 + w / 2} ${y}`;
  const right = `M ${124 - w / 2} ${y} Q 124 ${y - h * 2} ${124 + w / 2} ${y}`;
  return `${left} ${right}`;
};

/** Every open mouth shares one structure (M Q Q Z) so shapes can tween. */
const flatOpen = (x1: number, x2: number, y: number): string => {
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y} Q ${mid} ${y} ${x2} ${y} Q ${mid} ${y} ${x1} ${y} Z`;
};
const line = (x1: number, y1: number, cx: number, cy: number, x2: number, y2: number): string =>
  `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

const base: FaceConfig = {
  eyes: "open",
  eyeSx: 1,
  eyeSy: 1,
  lid: 0,
  pupil: { x: 0, y: 0, scale: 1 },
  arc: arcPath(20, 8),
  browL: { y: 0, r: -4 },
  browR: { y: 0, r: 4 },
  mouthOpen: flatOpen(90, 110, 138),
  open: false,
  mouthLine: line(88, 136, 100, 146, 112, 136),
  tongue: { x: 100, y: 146, rx: 6, ry: 3.5, on: false },
  cheek: 0.4,
};

export const FACES: Record<PennyMood, FaceConfig> = {
  idle: base,
  wave: {
    ...base,
    browL: { y: -6, r: -2 },
    browR: { y: -6, r: 2 },
    mouthLine: line(84, 134, 100, 150, 116, 134),
    mouthOpen: flatOpen(84, 116, 134),
  },
  thinking: {
    ...base,
    pupil: { x: 5, y: -6, scale: 1 },
    browL: { y: -9, r: -8 },
    browR: { y: 2, r: 8 },
    mouthOpen: "M 105 140 Q 110 132 115 140 Q 110 149 105 140 Z",
    open: true,
    mouthLine: line(104, 140, 110, 140, 116, 140),
    tongue: { x: 110, y: 145, rx: 3, ry: 2, on: true },
  },
  happy: {
    ...base,
    eyes: "arc",
    arc: arcPath(22, 9),
    browL: { y: -7, r: -5 },
    browR: { y: -7, r: 5 },
    mouthLine: line(82, 132, 100, 156, 118, 132),
    mouthOpen: flatOpen(82, 118, 132),
    cheek: 0.6,
  },
  celebrate: {
    ...base,
    eyes: "arc",
    arc: arcPath(28, 14),
    browL: { y: -10, r: -6 },
    browR: { y: -10, r: 6 },
    mouthOpen: "M 78 130 Q 100 126 122 130 Q 100 168 78 130 Z",
    open: true,
    mouthLine: line(78, 130, 100, 130, 122, 130),
    tongue: { x: 100, y: 152, rx: 9, ry: 5, on: true },
    cheek: 0.6,
  },
  meh: {
    ...base,
    lid: 0.55,
    pupil: { x: -3, y: 2, scale: 1 },
    browL: { y: 3, r: 0 },
    browR: { y: -7, r: -6 },
    mouthLine: line(88, 140, 100, 140, 112, 140),
    mouthOpen: flatOpen(88, 112, 140),
  },
  suspicious: {
    ...base,
    eyeSy: 0.4,
    pupil: { x: 0, y: 0, scale: 1 },
    browL: { y: 8, r: 16 },
    browR: { y: -3, r: 0 },
    mouthLine: line(86, 141, 104, 144, 116, 132),
    mouthOpen: flatOpen(86, 116, 138),
  },
  shocked: {
    ...base,
    eyeSx: 1.2,
    eyeSy: 1.2,
    pupil: { x: 0, y: 0, scale: 0.55 },
    browL: { y: -15, r: -3 },
    browR: { y: -15, r: 3 },
    mouthOpen: "M 91 138 Q 100 124 109 138 Q 100 156 91 138 Z",
    open: true,
    mouthLine: line(91, 138, 100, 138, 109, 138),
    tongue: { x: 100, y: 148, rx: 5, ry: 3, on: true },
  },
  sad: {
    ...base,
    pupil: { x: 0, y: 6, scale: 1 },
    browL: { y: -1, r: -15 },
    browR: { y: -1, r: 15 },
    mouthLine: line(88, 146, 100, 134, 112, 146),
    mouthOpen: flatOpen(88, 112, 146),
    cheek: 0.3,
  },
};

/** Arm rotation (degrees, 0 = hanging straight down). Left arm positive swings out. */
export const ARMS: Record<PennyMood, { l: number; r: number }> = {
  idle: { l: 18, r: -18 },
  wave: { l: 18, r: -140 },
  thinking: { l: 18, r: -18 },
  happy: { l: 40, r: -40 },
  celebrate: { l: 155, r: -155 },
  meh: { l: 18, r: -18 },
  suspicious: { l: 12, r: -12 },
  shocked: { l: 80, r: -80 },
  sad: { l: 6, r: -6 },
};
