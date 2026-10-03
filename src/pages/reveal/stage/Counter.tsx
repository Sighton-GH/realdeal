import { useEffect, useState } from "react";
import { animate } from "motion/react";

/** Ticks a number from `from` to `to` over `seconds`. */
export function Counter({ from, to, seconds, label }: { from: number; to: number; seconds: number; label: string }) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    const controls = animate(from, to, {
      duration: seconds,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [from, to, seconds]);
  return (
    <p className="text-small font-extrabold text-white/70">
      {label}: <span className="tabular">{value}</span>
    </p>
  );
}
