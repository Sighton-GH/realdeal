// FROZEN contract between ART-03, ART-04 and ART-05.
import type { ReactElement } from "react";
import type { ArtKey } from "@shared/types";

/** Draws one item in a 64x64 viewBox. Return only the inner shapes (a <g>), not the <svg> or backdrop. */
export type ArtDrawing = () => ReactElement;
export type ArtSet = Partial<Record<ArtKey, ArtDrawing>>;
