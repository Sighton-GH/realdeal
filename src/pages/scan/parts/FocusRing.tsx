import { motion, useReducedMotion } from "motion/react";

/** Focus ring shown where the user tapped the viewfinder. Fades out; the parent removes it. */
export function FocusRing({ x, y }: { x: number; y: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute size-18 rounded-full border-3 border-white"
      style={{ left: x - 36, top: y - 36 }}
      initial={{ scale: reduceMotion ? 1 : 1.4, opacity: 1 }}
      animate={{ scale: 1, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    />
  );
}
