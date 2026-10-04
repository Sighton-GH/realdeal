import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={cn("rounded-sm bg-sunken", className)}
      initial={{ opacity: reduce ? 1 : 0.6 }}
      animate={reduce ? { opacity: 1 } : { opacity: [0.6, 1, 0.6] }}
      transition={reduce ? { duration: 0 } : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
