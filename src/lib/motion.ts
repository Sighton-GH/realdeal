export const spring = {
  press: { type: "spring", stiffness: 700, damping: 30 },
  pop: { type: "spring", stiffness: 420, damping: 22 },
  slam: { type: "spring", stiffness: 300, damping: 14 },
  sheet: { type: "spring", stiffness: 380, damping: 36 },
} as const;

export const stepSlide = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
} as const;
