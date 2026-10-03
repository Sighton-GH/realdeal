import confetti from "canvas-confetti";
import type { VerdictTier } from "@shared/types";

export interface Effects {
  fire: (tier: VerdictTier) => void;
  reset: () => void;
}

/** Reads a theme colour token so confetti stays on the design-system palette. */
function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Confetti bound to one canvas that is confined to the app column. */
export function createEffects(canvas: HTMLCanvasElement): Effects {
  const shoot = confetti.create(canvas, { resize: true, useWorker: false });

  const fire = (tier: VerdictTier) => {
    if (tier === "steal") {
      const colors = [token("--color-steal"), token("--color-grape-500"), token("--color-normal")];
      const base = { particleCount: 90, spread: 70, startVelocity: 55, ticks: 220, colors, disableForReuse: false };
      shoot({ ...base, angle: 60, origin: { x: 0, y: 1 } });
      shoot({ ...base, angle: 120, origin: { x: 1, y: 1 } });
    } else if (tier === "good") {
      shoot({
        particleCount: 40,
        spread: 60,
        startVelocity: 35,
        ticks: 150,
        origin: { x: 0.5, y: 0.6 },
        colors: [token("--color-good"), token("--color-grape-400"), token("--color-normal")],
      });
    }
  };

  const reset = () => {
    shoot.reset();
  };

  return { fire, reset };
}
